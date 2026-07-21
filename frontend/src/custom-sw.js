importScripts('./ngsw-worker.js');

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-products') {
    event.waitUntil(processPendingProducts());
  }
});

async function processPendingProducts() {
  const pending = await getPendingOperations();

  for (const operation of pending) {
    try {
      await sendToServer(operation);
      await removeFromQueue(operation.id); 
    } catch (err) {
      // leave it in the queue (sync will retry automatically later)
      console.error('Sync failed for', operation, err);
    }
  }
}
function sendToServer(operation) {
  const base = 'http://127.0.0.1:8000/api/products';
  const authHeader = { 'Authorization': `Bearer ${operation.token}` };

  let request;
  switch (operation.type) {
    case 'add': {
      const formData = new FormData();
      formData.append('title', operation.data.title);
      formData.append('description', operation.data.description);
      formData.append('price', operation.data.price);
      formData.append('image', operation.data.image);
      request = fetch(base, { method: 'POST', body: formData, headers: authHeader });
      break;
    }
    case 'edit': {
      const formData = new FormData();
      formData.append('title', operation.data.title);
      formData.append('description', operation.data.description);
      formData.append('price', operation.data.price);
      if (operation.data.image) formData.append('image', operation.data.image);
      formData.append('_method', 'PUT');
      request = fetch(`${base}/${operation.productId}`, { method: 'POST', body: formData, headers: authHeader });
      break;
    }
    case 'delete':
      request = fetch(`${base}/${operation.productId}`, { method: 'DELETE', headers: authHeader });
      break;
  }

  return request.then((response) => {
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    return response;
  });
}


function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShopsAppDB', 2);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains('pendingOperations')) {
        db.deleteObjectStore('pendingOperations');
      }
      db.createObjectStore('pendingOperations', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function getPendingOperations() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const store = db.transaction('pendingOperations', 'readonly').objectStore('pendingOperations');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromQueue(id) {
     const db = await openDatabase();
     return new Promise((resolve, reject) => {
       const store = db.transaction('pendingOperations', 'readwrite').objectStore('pendingOperations');
       const request = store.delete(id);
       request.onsuccess = () => resolve();
       request.onerror = () => reject(request.error);
     });
    
}