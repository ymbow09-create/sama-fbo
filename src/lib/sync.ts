
import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

type StoredItem = {
  id: string
  [key: string]: unknown
}

const OWNER_KEY = 'sama-fbo-data-owner'

const collections = [
  { storageKey: 'sama-fbo-products', collectionName: 'products' },
  { storageKey: 'sama-fbo-sales', collectionName: 'sales' },
  { storageKey: 'sama-fbo-expenses', collectionName: 'expenses' },
  { storageKey: 'sama-fbo-stock-movements', collectionName: 'stockMovements' },
  { storageKey: 'sama-fbo-planning', collectionName: 'planning' },
  { storageKey: 'sama-fbo-contacts', collectionName: 'contacts' },
]

function readLocalData(storageKey: string): StoredItem[] {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return []

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is StoredItem =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.length > 0,
    )
  } catch {
    throw new Error(`Impossible de lire les données : ${storageKey}`)
  }
}

async function syncCollection(
  uid: string,
  storageKey: string,
  collectionName: string,
  importLocalData: boolean,
): Promise<void> {
  const localItems = importLocalData ? readLocalData(storageKey) : []

  const collectionRef = collection(db, 'users', uid, collectionName)
  const snapshot = await getDocs(collectionRef)

  const cloudItems: StoredItem[] = snapshot.docs.map((document) => ({
    ...document.data(),
    id: document.id,
  }))

  if (importLocalData) {
    const cloudIds = new Set(cloudItems.map((item) => item.id))
    const localOnlyItems = localItems.filter((item) => !cloudIds.has(item.id))

    for (let start = 0; start < localOnlyItems.length; start += 450) {
      const batch = writeBatch(db)

      for (const item of localOnlyItems.slice(start, start + 450)) {
        batch.set(doc(collectionRef, item.id), item)
      }

      await batch.commit()
    }
  }

  const mergedItems = new Map<string, StoredItem>()

  if (importLocalData) {
    for (const item of localItems) mergedItems.set(item.id, item)
  }

  for (const item of cloudItems) mergedItems.set(item.id, item)

  localStorage.setItem(
    storageKey,
    JSON.stringify(Array.from(mergedItems.values())),
  )
}

export async function syncUserData(uid: string): Promise<void> {
  if (!uid) throw new Error('Utilisateur non authentifié.')

  const previousOwner = localStorage.getItem(OWNER_KEY)
  const importLocalData = previousOwner === null || previousOwner === uid

  for (const item of collections) {
    await syncCollection(
      uid,
      item.storageKey,
      item.collectionName,
      importLocalData,
    )
  }

  localStorage.setItem(OWNER_KEY, uid)
}
