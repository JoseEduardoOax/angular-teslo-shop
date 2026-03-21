import { ProductTableComponent } from '@/products/components/product-table/product-table.component';
import { ProductsService } from '@/products/services/products.service';
import { PaginationService } from '@/shared/components/pagination/pagination.service';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PaginationComponent } from "@/shared/components/pagination/pagination.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTableComponent, PaginationComponent, RouterLink],
  templateUrl: './products-admin-page.component.html'
})
export class ProductsAdminPageComponent {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  productsPerPage = signal(10);
  totalProducts = signal(1);
  changeProductsPerPage = signal(false);

  productsResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.productsPerPage()
    }),
    loader: ({ request }) => {

      const page = this.changeProductsPerPage() ? 0 : request.page;

      return this.productsService.getProducts({
        offset: page * 9,
        limit: request.limit
      });
    }
  })
}
