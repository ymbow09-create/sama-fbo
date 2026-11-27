
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './lib/firebase'
import SamaLogo from './components/SamaLogo'
import Login from './components/Login'
import Navigation, { type PageName } from './components/Navigation'
import Accounting from './components/Accounting'
import Stock from './components/Stock'
import Prospects from './components/Prospects'
import Planning from './components/Planning'
import SamaAI from './components/SamaAI'
import Splash from './components/Splash'
import './App.css'
import './components/Navigation.css'

type DashboardStats = {
  revenue: number
  creditsCC: number
  expenses: number
  result: number
}

function getDashboardStats(): DashboardStats {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  const month = new Date(date.getTime() - offset * 60000).toISOString().slice(0, 7)

  try {
    const sales = JSON.parse(localStorage.getItem('sama-fbo-sales') || '[]')
    const expenses = JSON.parse(localStorage.getItem('sama-fbo-expenses') || '[]')

    const monthlySales = Array.isArray(sales)
      ? sales.filter((sale) => sale.date?.startsWith(month))
      : []

    const monthlyExpenses = Array.isArray(expenses)
      ? expenses.filter((expense) => expense.date?.startsWith(month))
      : []

    const revenue = monthlySales.reduce(
      (sum, sale) => sum + (Number(sale.total) || 0), 0,
    )

    const creditsCC = monthlySales.reduce(
      (sum, sale) => sum + (Number(sale.ccTotal) || 0), 0,
    )

    const expensesTotal = monthlyExpenses.reduce(
      (sum, expense) => sum + (Number(expense.amount) || 0), 0,
    )

    return {
      revenue,
      creditsCC,
      expenses: expensesTotal,
      result: revenue - expensesTotal,
    }
  } catch {
    return { revenue: 0, creditsCC: 0, expenses: 0, result: 0 }
  }
}

function formatFCFA(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [user, setUser] = useState('')
  const [authReady, setAuthReady] = useState(false)
  const [activePage, setActivePage] = useState<PageName>('Accueil')
  const [stats, setStats] = useState<DashboardStats>(getDashboardStats)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(
          firebaseUser.email ||
          firebaseUser.displayName ||
          firebaseUser.uid
        )
      } else {
        setUser('')
      }

      setAuthReady(true)
    })

    return unsubscribe
  }, [])

  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
    }

    setUser('')
    setActivePage('Accueil')
  }

  function navigateToPage(page: PageName) {
    if (page === 'Accueil') {
      setStats(getDashboardStats())
    }
    setActivePage(page)
  }

  if (showSplash || !authReady) {
    return <Splash />
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const pageDescriptions: Record<PageName, string> = {
    'Accueil': 'Votre espace de gestion et de suivi.',
    'Comptabilité & CC': 'Suivez vos ventes, dépenses, bénéfices et crédits CC.',
    'Stock': 'Contrôlez vos produits, vos entrées et vos sorties.',
    'Planning': 'Organisez vos cours, votre travail et vos activités.',
    'Prospects & Clients': 'Gérez vos contacts, vos clients et vos relances.',
    'SAMA IA': 'Votre assistant intelligent pour apprendre et progresser.',
  }

  return (
    <>
      <Navigation activePage={activePage} onNavigate={navigateToPage} />

      <main className="dashboard">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><SamaLogo size={38} /></div>
            <div>
              <h2>SAMA FBO</h2>
              <span>ÉTUDES · RIGUEUR · CROISSANCE</span>
            </div>
          </div>

          <div className="profile">
            <span>{user}</span>
            <div className="avatar">{user.charAt(0).toUpperCase()}</div>
            <button className="logout-button" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </header>

        {activePage === 'Accueil' ? (
          <>
            <section className="welcome">
              <span className="eyebrow">VOTRE ESPACE PERSONNEL</span>
              <h1>Construisez votre réussite.</h1>
              <p>Organisez vos études, développez votre activité Forever et avancez vers vos objectifs.</p>
            </section>

            <section className="stats">
              <article className="stat-card">
                <span>Chiffre d'affaires</span>
                <strong>{formatFCFA(stats.revenue)}</strong>
                <small>Ce mois-ci</small>
              </article>
              <article className="stat-card">
                <span>Crédits CC</span>
                <strong>{stats.creditsCC.toFixed(3)} CC</strong>
                <small>Ce mois-ci</small>
              </article>
              <article className="stat-card">
                <span>Dépenses</span>
                <strong>{formatFCFA(stats.expenses)}</strong>
                <small>Ce mois-ci</small>
              </article>
              <article className="stat-card">
                <span>Résultat estimé</span>
                <strong>{formatFCFA(stats.result)}</strong>
                <small>Ventes moins dépenses</small>
              </article>
            </section>

            <section className="section-heading">
              <div>
                <span className="eyebrow">VOTRE ORGANISATION</span>
                <h2>Accès rapide</h2>
              </div>
            </section>

            <section className="quick-grid">
              {([
                ['Comptabilité & CC', 'Suivez vos ventes, dépenses, bénéfices et crédits CC.'],
                ['Stock', 'Suivez vos produits et vos mouvements de stock.'],
                ['Planning', 'Organisez vos cours, votre travail et vos activités.'],
                ['Prospects & Clients', 'Gérez vos contacts et vos relances commerciales.'],
                ['SAMA IA', 'Votre assistant intelligent pour apprendre et progresser.'],
              ] as [PageName, string][]).map(([page, description], index) => (
                <button
                  className="quick-card"
                  key={page}
                  onClick={() => navigateToPage(page)}
                >
                  <span className="quick-number">0{index + 1}</span>
                  <h3>{page}</h3>
                  <p>{description}</p>
                </button>
              ))}
            </section>
          </>
        ) : activePage === 'Comptabilité & CC' ? (
          <Accounting />
        ) : activePage === 'Stock' ? (
          <Stock />
        ) : activePage === 'Prospects & Clients' ? (
          <Prospects />
        ) : activePage === 'Planning' ? (
          <Planning />
        ) : activePage === 'SAMA IA' ? (
          <SamaAI />
        ) : (
          <section className="module-page">
            <span className="eyebrow">ESPACE DE TRAVAIL</span>
            <h1>{activePage}</h1>
            <p>{pageDescriptions[activePage]}</p>
            <div className="module-placeholder">
              <h2>Votre espace est en préparation</h2>
              <p>Nous allons construire les fonctionnalités de cette rubrique progressivement.</p>
              <button onClick={() => navigateToPage('Accueil')}>
                Retour à l'accueil
              </button>
            </div>
          </section>
        )}

        <footer>SAMA FBO · Études · Rigueur · Croissance</footer>
      </main>
    </>
  )
}

export default App
