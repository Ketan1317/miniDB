const DB_NAME = "MiniDB";
const DB_VERSION = 1;
const STORE_NAME = "database";

// MiniDb -> Object Store (database) -> state

export class Storage {
  constructor() {
    this.db = null;
  }

  open() {
    return new Promise((resolve, reject) => {
        // It contains an IDBOpenRequest.
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = () => {
        this.db = req.result;
        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  }

  save(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      // state is the key
      store.put(data, "state");
      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  load() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);

      const req = store.get("state");

      req.onsuccess = () => {
        resolve(req.result ?? null);
      };
      req.onerror = () => {
        reject(req.error);
      };
    });
  }
}
