import { openDB } from 'idb';

const DB_NAME = 'PolycareOffline';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('sales')) {
        db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const saveOfflineSale = async (sale) => {
  const db = await initDB();
  await db.add('sales', sale);
};

export const getOfflineSales = async () => {
  const db = await initDB();
  return await db.getAll('sales');
};

export const clearOfflineSales = async () => {
  const db = await initDB();
  const tx = db.transaction('sales', 'readwrite');
  await tx.objectStore('sales').clear();
  await tx.done;
};