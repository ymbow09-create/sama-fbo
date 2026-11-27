
import {
  collection,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebase'

const collections: Record<string, string> = {
  'sama-fbo-products': 'products',
  'sama-fbo-sales': 'sales',
  'sama-fbo-expenses': 'expenses',
  'sama-fbo-stock-movements': 'stockMovements',
  'sama-fbo-planning': 'planning',
  'sama-fbo-contacts': 'contacts',
}

const pending = new Map<string, number>()

export async function saveCollectionToCloud(
  storageKey: string,
  items: { id: string }[],
  expectedUid?: string,
): Promise<void> {
  const user = auth.currentUser
  const collectionName = collections[storageKey]

  if (!user || !collectionName) return

  if (expectedUid && user.uid !== expectedUid) return

  const cloudCollection = collection(
    db,
    'users',
    user.uid,
    collectionName,
  )

  for (let start = 0; start < items.length; start += 450) {
    if (auth.currentUser?.uid !== user.uid) return

    const batch = writeBatch(db)
    const group = items.slice(start, start + 450)

    for (const item of group) {
      if (!item.id) continue

      batch.set(
        doc(cloudCollection, item.id),
        item,
      )
    }

    await batch.commit()
  }
}

export function scheduleCloudSave(
  storageKey: string,
  items: { id: string }[],
): void {
  const user = auth.currentUser

  if (!user || !collections[storageKey]) return

  const uid = user.uid
  const key = `${uid}:${storageKey}`
  const version = (pending.get(key) || 0) + 1

  pending.set(key, version)

  const itemsToSave = items.map((item) => ({ ...item }))

  window.setTimeout(async () => {
    if (pending.get(key) !== version) return
    if (auth.currentUser?.uid !== uid) return

    try {
      await saveCollectionToCloud(storageKey, itemsToSave, uid)
    } catch (error) {
      console.error(`Erreur de sauvegarde ${storageKey} :`, error)
    }
  }, 700)
}
