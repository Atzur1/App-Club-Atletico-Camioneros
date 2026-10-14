# Local RBAC test users

These accounts and their shared password are strictly for the local `ClubCamioneros` development database on the local `SQLEXPRESS` instance. **Never create, copy, or reuse these credentials in staging or production.**

Run `BackEnd/scripts/development/seed-rbac-test-users.sql` only while connected to `localhost\\SQLEXPRESS`, with `ClubCamioneros` selected as the current database. The script enforces both names and aborts before making changes elsewhere.

Before running it, confirm the target explicitly:

```sql
SELECT @@SERVERNAME AS ServerName, DB_NAME() AS DatabaseName;
```

Expected values are a local `...\\SQLEXPRESS` server and `ClubCamioneros`. Do not bypass the script's safety check. If a reserved email already belongs to a person whose DNI is not its exact current or legacy seed identity, the script rolls back and fails instead of overwriting that account.

All accounts use the password: `Camioneros.Test.2026!`

| Role ID | Role | Email |
|---:|---|---|
| 2 | Administrativo | `cacc.test.administrativo@example.test` |
| 3 | Médico | `cacc.test.medico@example.test` |
| 4 | Director Técnico | `cacc.test.dt@example.test` |
| 5 | Don QR | `cacc.test.qr@example.test` |
| 6 | Preparador Físico | `cacc.test.preparador@example.test` |
| 7 | Coordinador | `cacc.test.coordinador@example.test` |

The seed assigns the first two existing categories to the DT and physical trainer accounts so assigned-category scope can be tested.
