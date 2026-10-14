/*
  Local-development seed only. Do not run against production.
  Idempotently creates or refreshes one active test account for roles 2 through 7.
  Password: Camioneros.Test.2026!
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF DB_NAME() <> N'ClubCamioneros'
   OR CONVERT(nvarchar(128), SERVERPROPERTY('InstanceName')) <> N'SQLEXPRESS'
BEGIN
    THROW 51000, 'Safety check failed: this seed may run only on the local ClubCamioneros database in the SQLEXPRESS instance.', 1;
END;

BEGIN TRANSACTION;

DECLARE @PasswordHash varchar(255) = '$2a$12$gW.EMuN8Qg3OKOM/4a9wZ.GzqA.UbaETE.dc2h.pLM4IqiMgPH1qe';
DECLARE @Users table
(
    Email varchar(255) NOT NULL,
    RoleId int NOT NULL,
    Dni varchar(20) NOT NULL,
    LegacyDni varchar(20) NULL,
    FirstName varchar(100) NOT NULL,
    LastName varchar(100) NOT NULL
);

INSERT INTO @Users (Email, RoleId, Dni, LegacyDni, FirstName, LastName)
VALUES
    ('cacc.test.administrativo@example.test', 2, 'TEST-RBAC-02', NULL,              'Test', 'Administrativo'),
    ('cacc.test.medico@example.test',        3, 'TEST-RBAC-03', 'TEST-RBAC-MED',   'Test', 'Medico'),
    ('cacc.test.dt@example.test',            4, 'TEST-RBAC-04', 'TEST-RBAC-DT',    'Test', 'Director Tecnico'),
    ('cacc.test.qr@example.test',            5, 'TEST-RBAC-05', 'TEST-RBAC-QR',    'Test', 'Don QR'),
    ('cacc.test.preparador@example.test',    6, 'TEST-RBAC-06', NULL,              'Test', 'Preparador Fisico'),
    ('cacc.test.coordinador@example.test',   7, 'TEST-RBAC-07', 'TEST-RBAC-COORD', 'Test', 'Coordinador');

-- Never take over an existing account. An existing seed email is safe to
-- refresh only when it is already linked to its reserved TEST-RBAC identity.
IF EXISTS
(
    SELECT 1
    FROM @Users expected
    INNER JOIN dbo.USUARIOS actual ON actual.email = expected.Email
    LEFT JOIN dbo.PERSONAS person ON person.PK_id_persona = actual.FK_id_persona
    WHERE person.PK_id_persona IS NULL
       OR person.dni NOT IN (expected.Dni, COALESCE(expected.LegacyDni, expected.Dni))
)
BEGIN
    ROLLBACK TRANSACTION;
    THROW 51001, 'Seed account collision: an expected test email belongs to a non-test identity. No changes were applied.', 1;
END;

DECLARE @Email varchar(255), @RoleId int, @Dni varchar(20), @FirstName varchar(100), @LastName varchar(100);
DECLARE @PersonId int, @UserId int, @StaffId int;

DECLARE test_users CURSOR LOCAL FAST_FORWARD FOR
    SELECT Email, RoleId, Dni, FirstName, LastName FROM @Users ORDER BY RoleId;

OPEN test_users;
FETCH NEXT FROM test_users INTO @Email, @RoleId, @Dni, @FirstName, @LastName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SELECT @UserId = PK_id_usuario, @PersonId = FK_id_persona
    FROM dbo.USUARIOS
    WHERE email = @Email;

    IF @UserId IS NULL
    BEGIN
        SELECT @PersonId = PK_id_persona FROM dbo.PERSONAS WHERE dni = @Dni;

        IF @PersonId IS NULL
        BEGIN
            INSERT INTO dbo.PERSONAS (genero, fecha_de_nacimiento, dni, nombre, apellido, domicilio)
            VALUES (NULL, NULL, @Dni, @FirstName, @LastName, NULL);
            SET @PersonId = CONVERT(int, SCOPE_IDENTITY());
        END;

        INSERT INTO dbo.USUARIOS (FK_id_persona, FK_id_rol, email, contrasenia, activo)
        VALUES (@PersonId, @RoleId, @Email, @PasswordHash, 1);
        SET @UserId = CONVERT(int, SCOPE_IDENTITY());
    END
    ELSE
    BEGIN
        UPDATE dbo.USUARIOS
        SET FK_id_rol = @RoleId, contrasenia = @PasswordHash, activo = 1
        WHERE PK_id_usuario = @UserId;
    END;

    SELECT @StaffId = PK_id_staff FROM dbo.STAFF WHERE FK_id_usuario = @UserId;
    IF @StaffId IS NULL
    BEGIN
        INSERT INTO dbo.STAFF (FK_id_usuario) VALUES (@UserId);
        SET @StaffId = CONVERT(int, SCOPE_IDENTITY());
    END;

    IF @RoleId IN (4, 6)
    BEGIN
        INSERT INTO dbo.STAFF_CATEGORIAS (FK_id_staff, FK_id_categoria)
        SELECT @StaffId, c.PK_id_categoria
        FROM (SELECT TOP (2) PK_id_categoria FROM dbo.CATEGORIAS ORDER BY PK_id_categoria) c
        WHERE NOT EXISTS
        (
            SELECT 1 FROM dbo.STAFF_CATEGORIAS sc
            WHERE sc.FK_id_staff = @StaffId AND sc.FK_id_categoria = c.PK_id_categoria
        );
    END;

    SET @UserId = NULL;
    SET @PersonId = NULL;
    SET @StaffId = NULL;
    FETCH NEXT FROM test_users INTO @Email, @RoleId, @Dni, @FirstName, @LastName;
END;

CLOSE test_users;
DEALLOCATE test_users;

COMMIT TRANSACTION;

SELECT u.PK_id_usuario AS UserId, u.email AS Email, u.FK_id_rol AS RoleId, s.PK_id_staff AS StaffId
FROM dbo.USUARIOS u
LEFT JOIN dbo.STAFF s ON s.FK_id_usuario = u.PK_id_usuario
WHERE u.email LIKE 'cacc.test.%@example.test'
ORDER BY u.FK_id_rol;
