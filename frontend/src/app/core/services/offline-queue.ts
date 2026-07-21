import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OfflineQueue {

  openDatabase(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('ShopsAppDB', 2);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains('pendingOperations')) {
          db.deleteObjectStore('pendingOperations');
        }
        db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addPendingOperation(operation: any) {
    const db = await this.openDatabase();
    const transaction = db.transaction('pendingOperations', 'readwrite');
    const store = transaction.objectStore('pendingOperations');
    store.add(operation);
  }
}