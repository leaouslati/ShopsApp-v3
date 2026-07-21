import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IProduct } from '../interfaces/IProduct';
import { catchError, tap, throwError } from 'rxjs';
import { Auth } from './auth';
import { OfflineQueue } from './offline-queue';
@Injectable({
  providedIn: 'root',
})
export class Product {
  auth = inject(Auth);
  http = inject(HttpClient);
  offlineQueue = inject(OfflineQueue )
  products = signal<IProduct[]>([]);
  currentProduct = signal<IProduct | null>(null);


  getAllProducts() {
    this.http.get<IProduct[]>(environment.apiUrl + '/products').subscribe({
      next: (response) => {
        this.products.set(response);
        
      },
      error: (err) => {
        console.error('Failed to fetch products', err);
      }
    });
  }

  getProductById(id: number) {
    this.http.get<IProduct>(`${environment.apiUrl}/products/${id}`).subscribe({
      next: (response) => {
        this.currentProduct.set(response);
      },
      error: (err) => {
        console.log('Product fetching error');
      }
    });
  }
  addProduct(title: string, description: string, price: number, image: File) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    formData.append('image', image);

    return this.http.post<IProduct>(environment.apiUrl + '/products', formData).pipe(
      tap((response) => {
        this.products.update(current => [...current, response]);
        this.getAllProducts();
      }),
      
     catchError((error: HttpErrorResponse) => {       
        if (error.status === 0) {
          this.offlineQueue.addPendingOperation({
            type: 'add',
            data: { title, description, price, image },
            token: this.auth.token()
          });
          this.registerSync();
          (error as any).offlineQueued = true;
        }
          return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, title: string, description: string, price: number, image: File | null) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());

    if (image) {
      formData.append('image', image);
    }

    formData.append('_method', 'PUT');

    return this.http.post<IProduct>(`${environment.apiUrl}/products/${id}`, formData).pipe(
      tap((response) => {
        this.currentProduct.set(response);
        this.products.update(current =>
          current.map(p => p.id === id ? response : p)
        );
        this.getAllProducts();
      }),

      catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        this.offlineQueue.addPendingOperation({
          type: 'edit',
          productId: id,
          data: { title, description, price, image },
          token: this.auth.token()
        });
        this.registerSync();
        (error as any).offlineQueued = true;
      }
      return throwError(() => error);
    })
    );
  }

  deleteProduct(id: number) {
  return this.http.delete(`${environment.apiUrl}/products/${id}`).pipe(
    tap(() => {
      this.products.update(current => current.filter(p => p.id !== id));
      this.getAllProducts();
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        this.offlineQueue.addPendingOperation({
          type: 'delete',
          productId: id,
          data: null,
          token: this.auth.token()
        });
        this.registerSync();
        (error as any).offlineQueued = true;
      }
      return throwError(() => error);
    })

  );
}

private async registerSync() {
  const reg = await navigator.serviceWorker.ready;
  await (reg as any)?.sync.register('sync-products');
}

}

