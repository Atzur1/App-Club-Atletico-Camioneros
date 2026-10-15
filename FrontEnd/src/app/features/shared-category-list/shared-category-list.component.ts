import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PortalAccessService } from '../../shared/auth/portal-access.service';
import { CategorySummary } from '../../shared/models/portal.models';
import { ClubPortalApiService } from '../../shared/services/club-portal-api.service';

@Component({
  selector: 'app-shared-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shared-category-list.component.html',
  styleUrl: './shared-category-list.component.css',
})
export class SharedCategoryListComponent implements OnInit {
  private readonly api = inject(ClubPortalApiService);
  private readonly access = inject(PortalAccessService);
  private readonly router = inject(Router);

  readonly role = this.access.role;
  readonly capabilities = this.access.capabilities;
  categories: CategorySummary[] = [];
  searchTerm = '';
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.listCategories().subscribe({
      next: (categories) => {
        this.categories = this.access.visibleCategories(categories);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las categorías.';
        this.loading = false;
      },
    });
  }

  get filteredCategories(): CategorySummary[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('es');
    return !term ? this.categories : this.categories.filter((category) =>
      `${category.nombreCategoria} ${category.asociacion ?? ''}`.toLocaleLowerCase('es').includes(term),
    );
  }

  openCategory(id: number): void {
    this.router.navigate([`/${this.role}/categorias`, id]);
  }
}

