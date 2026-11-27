
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Package,
  AlertTriangle,
  Plus,
  History,
} from 'lucide-react'
import { scheduleCloudSave } from '../lib/cloudSync'
import './Stock.css'

type Product = {
  id: string
  name: string
  price: number
  cc: number
  stock: number
  minStock: number
}

type Movement = {
  id: string
  productId: string
  productName: string
  type: 'entrée' | 'sortie'
  quantity: number
  date: string
  note: string
}

const PRODUCTS_KEY = 'sama-fbo-products'
const MOVEMENTS_KEY = 'sama-fbo-stock-movements'

function readProducts(): Product[] {
  try {
    const data = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]')
    if (!Array.isArray(data)) return []

    return data.map((product) => ({
      ...product,
      price: Number(product.price) || 0,
      cc: Number(product.cc) || 0,
      stock: Number(product.stock) || 0,
      minStock: Number(product.minStock) || 0,
    }))
  } catch {
    return []
  }
}

function readMovements(): Movement[] {
  try {
    const data = JSON.parse(localStorage.getItem(MOVEMENTS_KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function formatFCFA(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

function Stock() {
  const [products, setProducts] = useState<Product[]>(readProducts)
  const [movements, setMovements] = useState<Movement[]>(readMovements)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [movementType, setMovementType] = useState<'entrée' | 'sortie'>('entrée')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    scheduleCloudSave(PRODUCTS_KEY, products)
  }, [products])

  useEffect(() => {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements))
    scheduleCloudSave(MOVEMENTS_KEY, movements)
  }, [movements])

  const totalUnits = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  )

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= product.minStock,
  ).length

  const outOfStock = products.filter((product) => product.stock === 0).length

  function saveMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const product = products.find((item) => item.id === selectedProduct)
    const amount = Number(quantity)

    if (!product || !Number.isInteger(amount) || amount <= 0) {
      alert('Sélectionne un produit et une quantité valide.')
      return
    }

    if (movementType === 'sortie' && amount > product.stock) {
      alert('Stock insuffisant pour cette sortie.')
      return
    }

    const updatedProducts = products.map((item) =>
      item.id === product.id
        ? {
            ...item,
            stock: movementType === 'entrée'
              ? item.stock + amount
              : item.stock - amount,
          }
        : item,
    )

    const newMovement: Movement = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      type: movementType,
      quantity: amount,
      date: new Date().toISOString(),
      note: note.trim(),
    }

    setProducts(updatedProducts)
    setMovements((previous) => [newMovement, ...previous])
    setQuantity('1')
    setNote('')
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    const name = String(data.get('name') || '').trim()
    const price = Number(data.get('price'))
    const cc = Number(data.get('cc'))
    const stock = Number(data.get('stock'))
    const minStock = Number(data.get('minStock'))

    if (
      !name ||
      !Number.isFinite(price) || price < 0 ||
      !Number.isFinite(cc) || cc < 0 ||
      !Number.isInteger(stock) || stock < 0 ||
      !Number.isInteger(minStock) || minStock < 0
    ) {
      alert('Vérifie les informations du produit.')
      return
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      price,
      cc,
      stock,
      minStock,
    }

    setProducts((previous) => [...previous, newProduct])

    if (stock > 0) {
      const initialMovement: Movement = {
        id: crypto.randomUUID(),
        productId: newProduct.id,
        productName: name,
        type: 'entrée',
        quantity: stock,
        date: new Date().toISOString(),
        note: 'Stock initial',
      }

      setMovements((previous) => [initialMovement, ...previous])
    }

    form.reset()
  }

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div>
          <span className="eyebrow">GESTION COMMERCIALE</span>
          <h1>Gestion du stock</h1>
          <p>Contrôle tes produits, tes entrées et tes sorties.</p>
        </div>
      </header>

      <section className="stock-stats">
        <article className="stock-stat-card">
          <Package size={22} />
          <span>Références produits</span>
          <strong>{products.length}</strong>
        </article>
        <article className="stock-stat-card">
          <ArrowDownToLine size={22} />
          <span>Unités disponibles</span>
          <strong>{totalUnits}</strong>
        </article>
        <article className="stock-stat-card">
          <AlertTriangle size={22} />
          <span>Stock faible</span>
          <strong>{lowStock}</strong>
        </article>
        <article className="stock-stat-card">
          <AlertTriangle size={22} />
          <span>Ruptures</span>
          <strong>{outOfStock}</strong>
        </article>
      </section>

      <div className="stock-columns">
        <section className="stock-panel">
          <h2>Mouvement de stock</h2>
          <form onSubmit={saveMovement} className="stock-form">
            <label>Produit</label>
            <select
              value={selectedProduct}
              onChange={(event) => setSelectedProduct(event.target.value)}
              required
            >
              <option value="">Choisir un produit</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.stock} disponible(s)
                </option>
              ))}
            </select>

            <label>Type de mouvement</label>
            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as 'entrée' | 'sortie')
              }
            >
              <option value="entrée">Entrée de stock</option>
              <option value="sortie">Sortie de stock</option>
            </select>

            <label>Quantité</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />

            <label>Motif (facultatif)</label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ex. : Réapprovisionnement, utilisation..."
            />

            <button type="submit" disabled={products.length === 0}>
              Enregistrer le mouvement
            </button>
          </form>
        </section>

        <section className="stock-panel">
          <h2>Nouveau produit</h2>
          <form onSubmit={addProduct} className="stock-form">
            <label>Nom du produit</label>
            <input name="name" type="text" required placeholder="Nom du produit" />

            <label>Prix de vente (FCFA)</label>
            <input name="price" type="number" min="0" step="1" required />

            <label>Crédit CC</label>
            <input name="cc" type="number" min="0" step="0.001" required />

            <label>Stock initial</label>
            <input name="stock" type="number" min="0" step="1" defaultValue="0" required />

            <label>Seuil d'alerte</label>
            <input name="minStock" type="number" min="0" step="1" defaultValue="2" required />

            <button type="submit">
              <Plus size={17} /> Ajouter le produit
            </button>
          </form>
        </section>
      </div>

      <section className="stock-panel stock-inventory">
        <h2>Inventaire des produits</h2>
        {products.length === 0 ? (
          <p className="stock-empty">Aucun produit enregistré pour le moment.</p>
        ) : (
          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>CC</th>
                  <th>Quantité</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = product.stock === 0
                    ? 'Rupture'
                    : product.stock <= product.minStock
                      ? 'Stock faible'
                      : 'Disponible'

                  return (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{formatFCFA(product.price)}</td>
                      <td>{product.cc.toFixed(3)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`stock-status ${
                          product.stock === 0 ? 'danger' :
                          product.stock <= product.minStock ? 'warning' : 'success'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="stock-panel stock-history">
        <h2><History size={20} /> Historique des mouvements</h2>
        {movements.length === 0 ? (
          <p className="stock-empty">Aucun mouvement enregistré.</p>
        ) : (
          <div className="stock-movement-list">
            {movements.slice(0, 30).map((movement) => (
              <article className="stock-movement" key={movement.id}>
                <div className={`movement-icon ${movement.type === 'entrée' ? 'entry' : 'exit'}`}>
                  {movement.type === 'entrée'
                    ? <ArrowDownToLine size={19} />
                    : <ArrowUpFromLine size={19} />}
                </div>
                <div className="movement-details">
                  <strong>{movement.productName}</strong>
                  <span>
                    {movement.type === 'entrée' ? 'Entrée' : 'Sortie'} de {movement.quantity} unité(s)
                  </span>
                  {movement.note && <small>{movement.note}</small>}
                </div>
                <time>{new Date(movement.date).toLocaleString('fr-FR')}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Stock
