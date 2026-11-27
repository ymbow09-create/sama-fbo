
import { useEffect, useMemo, useState } from 'react'
import { scheduleCloudSave } from '../lib/cloudSync'
import './Accounting.css'

type Product = {
  id: string
  name: string
  price: number
  cc: number
  stock: number
  minStock: number
}

type Sale = {
  id: string
  productId?: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
  ccTotal: number
  client: string
  date: string
}

type Expense = {
  id: string
  label: string
  category: string
  amount: number
  date: string
}

const PRODUCTS_KEY = 'sama-fbo-products'
const SALES_KEY = 'sama-fbo-sales'
const EXPENSES_KEY = 'sama-fbo-expenses'

function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

function loadData<T>(key: string): T[] {
  try {
    const saved = localStorage.getItem(key)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return []
  }
}

function loadProducts(): Product[] {
  const saved = loadData<Partial<Product>>(PRODUCTS_KEY)

  return saved.map((product, index) => ({
    id: String(product.id ?? `ancien-produit-${index}`),
    name: String(product.name ?? ''),
    price: Number(product.price) || 0,
    cc: Number(product.cc) || 0,
    stock: Number.isFinite(Number(product.stock))
      ? Math.max(0, Number(product.stock))
      : 0,
    minStock: Number.isFinite(Number(product.minStock))
      ? Math.max(0, Number(product.minStock))
      : 0,
  }))
}

function formatFCFA(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

function Accounting() {
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [sales, setSales] = useState<Sale[]>(() => loadData<Sale>(SALES_KEY))
  const [expenses, setExpenses] = useState<Expense[]>(() => loadData<Expense>(EXPENSES_KEY))

  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCC, setProductCC] = useState('')
  const [productStock, setProductStock] = useState('0')
  const [productMinStock, setProductMinStock] = useState('0')
  const [editingProduct, setEditingProduct] = useState<string | null>(null)

  const [saleProduct, setSaleProduct] = useState('')
  const [saleQuantity, setSaleQuantity] = useState('1')
  const [saleClient, setSaleClient] = useState('')
  const [saleDate, setSaleDate] = useState(today())

  const [expenseLabel, setExpenseLabel] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Transport')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDate, setExpenseDate] = useState(today())

  const [message, setMessage] = useState('')

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    scheduleCloudSave(PRODUCTS_KEY, products)
  }, [products])

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales))
    scheduleCloudSave(SALES_KEY, sales)
  }, [sales])

  useEffect(() => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
    scheduleCloudSave(EXPENSES_KEY, expenses)
  }, [expenses])

  const currentMonth = today().slice(0, 7)

  const monthlySales = useMemo(
    () => sales.filter((sale) => sale.date?.startsWith(currentMonth)),
    [sales, currentMonth],
  )

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => expense.date?.startsWith(currentMonth)),
    [expenses, currentMonth],
  )

  const revenue = monthlySales.reduce((total, sale) => total + (Number(sale.total) || 0), 0)
  const costs = monthlyExpenses.reduce((total, expense) => total + (Number(expense.amount) || 0), 0)
  const profit = revenue - costs
  const creditsCC = monthlySales.reduce((total, sale) => total + (Number(sale.ccTotal) || 0), 0)

  const totalStock = products.reduce((total, product) => total + product.stock, 0)
  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= product.minStock,
  ).length
  const outOfStock = products.filter((product) => product.stock === 0).length

  function resetProductForm() {
    setProductName('')
    setProductPrice('')
    setProductCC('')
    setProductStock('0')
    setProductMinStock('0')
    setEditingProduct(null)
  }

  function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const price = Number(productPrice)
    const cc = Number(productCC)
    const stock = Number(productStock)
    const minStock = Number(productMinStock)

    if (
      !productName.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(cc) ||
      cc < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(minStock) ||
      minStock < 0
    ) {
      setMessage('Vérifie le nom, le prix, les CC et les quantités de stock.')
      return
    }

    if (editingProduct) {
      setProducts((previous) => previous.map((product) =>
        product.id === editingProduct
          ? {
              ...product,
              name: productName.trim(),
              price,
              cc,
              stock,
              minStock,
            }
          : product,
      ))
      setMessage('Produit et stock modifiés avec succès.')
    } else {
      setProducts((previous) => [
        ...previous,
        {
          id: String(Date.now()),
          name: productName.trim(),
          price,
          cc,
          stock,
          minStock,
        },
      ])
      setMessage('Produit ajouté au catalogue.')
    }

    resetProductForm()
  }

  function editProduct(product: Product) {
    setEditingProduct(product.id)
    setProductName(product.name)
    setProductPrice(String(product.price))
    setProductCC(String(product.cc))
    setProductStock(String(product.stock))
    setProductMinStock(String(product.minStock))
    setMessage('')
  }

  function cancelProductEdit() {
    resetProductForm()
    setMessage('')
  }

  function deleteProduct(id: string) {
    const product = products.find((item) => item.id === id)

    if (!product) return

    const used = sales.some((sale) =>
      sale.productId
        ? sale.productId === id
        : sale.productName === product.name,
    )

    if (used) {
      setMessage('Ce produit figure déjà dans des ventes. Tu ne peux pas le supprimer.')
      return
    }

    setProducts((previous) => previous.filter((item) => item.id !== id))
    setMessage('Produit supprimé.')
  }

  function saveSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const product = products.find((item) => item.id === saleProduct)
    const quantity = Number(saleQuantity)

    if (!product || !Number.isInteger(quantity) || quantity <= 0) {
      setMessage('Choisis un produit et une quantité valide.')
      return
    }

    if (quantity > product.stock) {
      setMessage(`Stock insuffisant pour ${product.name}. Quantité disponible : ${product.stock}.`)
      return
    }

    const newSale: Sale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      ccTotal: product.cc * quantity,
      client: saleClient.trim() || 'Client non renseigné',
      date: saleDate,
    }

    setProducts((previous) => previous.map((item) =>
      item.id === product.id
        ? { ...item, stock: item.stock - quantity }
        : item,
    ))

    setSales((previous) => [newSale, ...previous])

    setSaleQuantity('1')
    setSaleClient('')
    setSaleDate(today())
    setMessage(`Vente enregistrée. ${quantity} unité(s) retirée(s) du stock. Les CC ont été calculés.`)
  }

  function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const amount = Number(expenseAmount)

    if (!expenseLabel.trim() || !Number.isFinite(amount) || amount <= 0) {
      setMessage('Vérifie le libellé et le montant de la dépense.')
      return
    }

    setExpenses((previous) => [
      {
        id: crypto.randomUUID(),
        label: expenseLabel.trim(),
        category: expenseCategory,
        amount,
        date: expenseDate,
      },
      ...previous,
    ])

    setExpenseLabel('')
    setExpenseAmount('')
    setExpenseDate(today())
    setMessage('Dépense enregistrée.')
  }

  function deleteSale(id: string) {
    const sale = sales.find((item) => item.id === id)

    if (!sale) return

    setProducts((previous) => previous.map((product) => {
      const matches = sale.productId
        ? product.id === sale.productId
        : product.name === sale.productName

      return matches
        ? { ...product, stock: product.stock + sale.quantity }
        : product
    }))

    setSales((previous) => previous.filter((item) => item.id !== id))
    setMessage('Vente supprimée. La quantité a été réintégrée au stock.')
  }

  function deleteExpense(id: string) {
    setExpenses((previous) => previous.filter((expense) => expense.id !== id))
    setMessage('Dépense supprimée.')
  }

  return (
    <section className="accounting-page">
      <div className="accounting-heading">
        <span className="eyebrow">GESTION FINANCIÈRE</span>
        <h1>Comptabilité & CC</h1>
        <p>Suivi de ton activité, de tes ventes, de tes stocks et de tes crédits CC.</p>
      </div>

      {message && (
        <div className="accounting-message" role="status">
          {message}
          <button type="button" onClick={() => setMessage('')}>Fermer</button>
        </div>
      )}

      <div className="accounting-stats">
        <article className="accounting-stat">
          <span>Chiffre d'affaires du mois</span>
          <strong>{formatFCFA(revenue)}</strong>
        </article>
        <article className="accounting-stat">
          <span>Dépenses du mois</span>
          <strong>{formatFCFA(costs)}</strong>
        </article>
        <article className="accounting-stat">
          <span>Bénéfice brut estimé</span>
          <strong className={profit < 0 ? 'negative-value' : ''}>{formatFCFA(profit)}</strong>
        </article>
        <article className="accounting-stat">
          <span>Crédits CC du mois</span>
          <strong>{creditsCC.toFixed(3)} CC</strong>
        </article>
      </div>

      <div className="accounting-stats">
        <article className="accounting-stat">
          <span>Références produits</span>
          <strong>{products.length}</strong>
        </article>
        <article className="accounting-stat">
          <span>Unités en stock</span>
          <strong>{totalStock}</strong>
        </article>
        <article className="accounting-stat">
          <span>Stocks faibles</span>
          <strong>{lowStock}</strong>
        </article>
        <article className="accounting-stat">
          <span>Ruptures de stock</span>
          <strong>{outOfStock}</strong>
        </article>
      </div>

      <div className="accounting-grid">
        <section className="accounting-panel">
          <div className="accounting-panel-title">
            <span className="eyebrow">CATALOGUE ET STOCK</span>
            <h2>{editingProduct ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
            <p>Définis le prix, les CC, la quantité disponible et le seuil d'alerte.</p>
          </div>

          <form className="accounting-form" onSubmit={saveProduct}>
            <label htmlFor="product-name">Nom du produit</label>
            <input
              id="product-name"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="Ex. Aloe Vera Gel"
              required
            />

            <label htmlFor="product-price">Prix de vente (FCFA)</label>
            <input
              id="product-price"
              type="number"
              min="1"
              step="1"
              value={productPrice}
              onChange={(event) => setProductPrice(event.target.value)}
              placeholder="Ex. 13000"
              required
            />

            <label htmlFor="product-cc">Valeur CC par unité</label>
            <input
              id="product-cc"
              type="number"
              min="0"
              step="0.001"
              value={productCC}
              onChange={(event) => setProductCC(event.target.value)}
              placeholder="Ex. 0.125"
              required
            />

            <label htmlFor="product-stock">Quantité disponible en stock</label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={productStock}
              onChange={(event) => setProductStock(event.target.value)}
              required
            />

            <label htmlFor="product-min-stock">Seuil d'alerte du stock</label>
            <input
              id="product-min-stock"
              type="number"
              min="0"
              step="1"
              value={productMinStock}
              onChange={(event) => setProductMinStock(event.target.value)}
              required
            />

            <button className="accounting-primary" type="submit">
              {editingProduct ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
            </button>

            {editingProduct && (
              <button
                className="accounting-secondary"
                type="button"
                onClick={cancelProductEdit}
              >
                Annuler la modification
              </button>
            )}
          </form>

          <div className="accounting-list">
            <h3>Mes produits ({products.length})</h3>

            {products.length === 0 ? (
              <p className="accounting-empty">Ton catalogue est vide. Ajoute ton premier produit.</p>
            ) : products.map((product) => (
              <div className="accounting-list-row" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {formatFCFA(product.price)} · {product.cc.toFixed(3)} CC / unité
                  </span>
                  <span>
                    Stock : {product.stock} · Seuil d'alerte : {product.minStock}
                  </span>
                  <span>
                    {product.stock === 0
                      ? 'Rupture de stock'
                      : product.stock <= product.minStock
                        ? 'Stock faible'
                        : 'Stock disponible'}
                  </span>
                </div>

                <div className="accounting-row-actions">
                  <button type="button" onClick={() => editProduct(product)}>Modifier</button>
                  <button
                    type="button"
                    className="danger-action"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="accounting-panel">
          <div className="accounting-panel-title">
            <span className="eyebrow">ENREGISTREMENT</span>
            <h2>Nouvelle vente</h2>
            <p>Le stock, les montants et les crédits CC sont actualisés automatiquement.</p>
          </div>

          <form className="accounting-form" onSubmit={saveSale}>
            <label htmlFor="sale-product">Produit vendu</label>
            <select
              id="sale-product"
              value={saleProduct}
              onChange={(event) => setSaleProduct(event.target.value)}
              required
            >
              <option value="">Choisir un produit</option>
              {products.map((product) => (
                <option value={product.id} key={product.id} disabled={product.stock === 0}>
                  {product.name} — {product.stock} disponible(s)
                </option>
              ))}
            </select>

            <label htmlFor="sale-quantity">Quantité</label>
            <input
              id="sale-quantity"
              type="number"
              min="1"
              step="1"
              value={saleQuantity}
              onChange={(event) => setSaleQuantity(event.target.value)}
              required
            />

            <label htmlFor="sale-client">Nom du client (facultatif)</label>
            <input
              id="sale-client"
              value={saleClient}
              onChange={(event) => setSaleClient(event.target.value)}
              placeholder="Nom du client"
            />

            <label htmlFor="sale-date">Date de la vente</label>
            <input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(event) => setSaleDate(event.target.value)}
              required
            />

            {(() => {
              const product = products.find((item) => item.id === saleProduct)
              const quantity = Number(saleQuantity) || 0

              return product ? (
                <div className="sale-preview">
                  <span>Stock disponible : <strong>{product.stock}</strong></span>
                  <span>Total estimé : <strong>{formatFCFA(product.price * quantity)}</strong></span>
                  <span>CC générés : <strong>{(product.cc * quantity).toFixed(3)} CC</strong></span>
                  {quantity > product.stock && (
                    <span>Attention : quantité supérieure au stock disponible.</span>
                  )}
                </div>
              ) : null
            })()}

            <button
              className="accounting-primary"
              type="submit"
              disabled={products.length === 0}
            >
              Enregistrer la vente
            </button>
          </form>
        </section>

        <section className="accounting-panel">
          <div className="accounting-panel-title">
            <span className="eyebrow">CHARGES</span>
            <h2>Nouvelle dépense</h2>
            <p>Enregistre les frais liés à ton activité.</p>
          </div>

          <form className="accounting-form" onSubmit={saveExpense}>
            <label htmlFor="expense-label">Libellé de la dépense</label>
            <input
              id="expense-label"
              value={expenseLabel}
              onChange={(event) => setExpenseLabel(event.target.value)}
              placeholder="Ex. Livraison client"
              required
            />

            <label htmlFor="expense-category">Catégorie</label>
            <select
              id="expense-category"
              value={expenseCategory}
              onChange={(event) => setExpenseCategory(event.target.value)}
            >
              <option>Transport</option>
              <option>Livraison</option>
              <option>Achat de produits</option>
              <option>Communication</option>
              <option>Autre</option>
            </select>

            <label htmlFor="expense-amount">Montant (FCFA)</label>
            <input
              id="expense-amount"
              type="number"
              min="1"
              step="1"
              value={expenseAmount}
              onChange={(event) => setExpenseAmount(event.target.value)}
              placeholder="Ex. 2000"
              required
            />

            <label htmlFor="expense-date">Date de la dépense</label>
            <input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
            />

            <button className="accounting-primary" type="submit">
              Enregistrer la dépense
            </button>
          </form>
        </section>

        <section className="accounting-panel accounting-history">
          <div className="accounting-panel-title">
            <span className="eyebrow">HISTORIQUE</span>
            <h2>Dernières ventes</h2>
          </div>

          {sales.length === 0 ? (
            <p className="accounting-empty">Aucune vente enregistrée pour le moment.</p>
          ) : (
            <div className="accounting-table-wrap">
              <table className="accounting-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Total</th>
                    <th>CC</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.date}</td>
                      <td>
                        {sale.productName}
                        <small>{sale.client}</small>
                      </td>
                      <td>{sale.quantity}</td>
                      <td>{formatFCFA(sale.total)}</td>
                      <td>{Number(sale.ccTotal).toFixed(3)}</td>
                      <td>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => deleteSale(sale.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="accounting-panel accounting-history">
          <div className="accounting-panel-title">
            <span className="eyebrow">HISTORIQUE</span>
            <h2>Dernières dépenses</h2>
          </div>

          {expenses.length === 0 ? (
            <p className="accounting-empty">Aucune dépense enregistrée pour le moment.</p>
          ) : expenses.map((expense) => (
            <div className="accounting-list-row" key={expense.id}>
              <div>
                <strong>{expense.label}</strong>
                <span>{expense.date} · {expense.category}</span>
              </div>
              <div className="accounting-row-actions">
                <strong>{formatFCFA(expense.amount)}</strong>
                <button
                  type="button"
                  className="danger-action"
                  onClick={() => deleteExpense(expense.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </section>
  )
}

export default Accounting
