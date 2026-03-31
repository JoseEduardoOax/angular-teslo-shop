import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Gender, Product, ProductsResponse } from "../interfaces/product.interface";
import { forkJoin, map, Observable, of, pairwise, switchMap, tap } from "rxjs";
import { environment } from "src/environments/environment";
import { User } from "@/auth/interfaces/user.interface";

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();

  private productByIdCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;

    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: {
          limit,
          offset,
          gender
        }
      })
      .pipe(
        tap((resp) => console.log(resp)),
        tap((resp) => this.productsCache.set(key, resp))
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {

    if (this.productByIdCache.has(idSlug)) {
      return of(this.productByIdCache.get(idSlug)!);
    }

    return this.http
      .get<Product>(`${baseUrl}/products/${idSlug}`)
      .pipe(
        tap((resp) => console.log(resp)),
        tap((product) => this.productByIdCache.set(idSlug, product))
      );
  }

  getProductById(id: string): Observable<Product> {

    if (id === 'new') {
      return of(emptyProduct);
    }

    if (this.productByIdCache.has(id)) {
      return of(this.productByIdCache.get(id)!);
    }

    return this.http
      .get<Product>(`${baseUrl}/products/${id}`)
      .pipe(
        tap((resp) => console.log(resp)),
        tap((product) => this.productByIdCache.set(id, product))
      );
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product> {

    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList)
      .pipe(
        map(imageNames => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })),
        switchMap(updateProduct =>
          this.http
            .patch<Product>(`${baseUrl}/products/${id}`, updateProduct)
        ),
        tap((product) => this.updateProductCache(product))
      )
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    this.productByIdCache.set(productId, product);

    this.productsCache.forEach(productResponse => {
      productResponse.products = productResponse.products.map(currentProduct => {
        return currentProduct.id === productId ? product : currentProduct
      });
    })
  }

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);

    const uploadObservables = Array.from(images)
      .map(imageFile => this.uploadImage(imageFile)
      )

    return forkJoin(uploadObservables)
      .pipe(
        tap((imageNames) => console.log({ imageNames }))
      );
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile)

    return this.http
      .post<{ fileName: string }>(`${baseUrl}/files/product`, formData)
      .pipe(map(resp => resp.fileName))
  }

  createProduct(productLike: Partial<Product>,
    imageFileList?: FileList): Observable<Product> {

    if (!imageFileList) {
      return this.http
        .post<Product>(`${baseUrl}/products`, productLike)
    } else {

      return this.uploadImages(imageFileList)
        .pipe(
          map(imageNames => ({
            ...productLike,
            images: imageNames
          })),
          switchMap(newProduct =>
            this.http
              .post<Product>(`${baseUrl}/products/`, newProduct)
          ),
          tap((product) => this.updateProductCache(product))
        )
    }
  }
}
