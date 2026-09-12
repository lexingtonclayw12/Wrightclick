// IndexedDB shim for IPayloadCache.
//
// localStorage cannot hold this payload: it stores strings only, so a 4 MB
// binary snapshot becomes ~5.4 MB of base64 against a ~5 MB quota. IndexedDB
// stores Uint8Array directly and has a far larger quota.

const DB_NAME = "wrightclick";
const STORE = "payloads";

let dbPromise = null;

function open() {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function transact(mode, work) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = work(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get(key) {
  const value = await transact("readonly", (store) => store.get(key));
  // Blazor marshals a JS number[] to byte[]; null means "not cached".
  return value ? Array.from(value) : null;
}

export async function set(key, bytes) {
  await transact("readwrite", (store) => store.put(new Uint8Array(bytes), key));
}

export async function remove(key) {
  await transact("readwrite", (store) => store.delete(key));
}
