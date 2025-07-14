export interface HistoryRecord {
  id: string;
  inputContent: string;
  outputContent: string;
  timestamp: number;
  successCount: number;
  totalCount: number;
  provider: string;
}

class HistoryDB {
  private dbName = 'hosts-generator-db';
  private version = 1;
  private storeName = 'history';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async addRecord(record: Omit<HistoryRecord, 'id'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRecord: HistoryRecord = { ...record, id };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.add(fullRecord);
      
      request.onsuccess = () => {
        this.cleanupOldRecords();
        resolve(id);
      };
      
      request.onerror = () => {
        console.error('Failed to add record:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecords(page = 0, pageSize = 20): Promise<HistoryRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'prev');
      const records: HistoryRecord[] = [];
      let count = 0;
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          if (count >= startIndex && count < endIndex) {
            records.push(cursor.value);
          }
          count++;
          
          if (count < endIndex) {
            cursor.continue();
          } else {
            resolve(records);
          }
        } else {
          resolve(records);
        }
      };

      request.onerror = () => {
        console.error('Failed to get records:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteRecord(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to delete record:', request.error);
        reject(request.error);
      };
    });
  }

  async clearAllRecords(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to clear records:', request.error);
        reject(request.error);
      };
    });
  }

  async getRecordCount(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.error('Failed to count records:', request.error);
        reject(request.error);
      };
    });
  }

  private async cleanupOldRecords(): Promise<void> {
    try {
      const count = await this.getRecordCount();
      if (count <= 200) return;

      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      
      const request = index.openCursor(null, 'next');
      let deleteCount = count - 200;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && deleteCount > 0) {
          cursor.delete();
          deleteCount--;
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }
}

export const historyDB = new HistoryDB();