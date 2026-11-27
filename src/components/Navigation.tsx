
import { useState } from 'react'
import SamaLogo from './SamaLogo'
import {
  Home,
  Calculator,
  Package,
  CalendarDays,
  Users,
  BrainCircuit,
  Menu,
  X,
} from 'lucide-react'

export type PageName =
  | 'Accueil'
  | 'Comptabilité & CC'
  | 'Stock'
  | 'Planning'
  | 'Prospects & Clients'
  | 'SAMA IA'

type NavigationProps = {
  activePage: PageName
  onNavigate: (page: PageName) => void
}

const menuItems = [
  { name: 'Accueil' as PageName, icon: Home },
  { name: 'Comptabilité & CC' as PageName, icon: Calculator },
  { name: 'Stock' as PageName, icon: Package },
  { name: 'Planning' as PageName, icon: CalendarDays },
  { name: 'Prospects & Clients' as PageName, icon: Users },
  { name: 'SAMA IA' as PageName, icon: BrainCircuit },
]

const mobileMainItems = menuItems.slice(0, 3)
const mobileMoreItems = menuItems.slice(3)

function Navigation({ activePage, onNavigate }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const hasMorePageActive = mobileMoreItems.some(
    (item) => item.name === activePage
  )

  function handleNavigate(page: PageName) {
    onNavigate(page)
    setMenuOpen(false)
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <SamaLogo size={38} />
          </div>
          <div>
            <strong>SAMA FBO</strong>
            <span>VOTRE ESPACE</span>
          </div>
        </div>

        <nav className="side-menu">
          <span className="menu-label">MENU PRINCIPAL</span>

          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? 'active' : ''}`}
                onClick={() => onNavigate(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <span>ÉTUDES · RIGUEUR</span>
          <span>CROISSANCE</span>
        </div>
      </aside>

      <nav className="mobile-nav" aria-label="Navigation principale">
        {mobileMainItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.name}
              className={`mobile-nav-item ${activePage === item.name ? 'active' : ''}`}
              onClick={() => handleNavigate(item.name)}
              aria-label={item.name}
              aria-current={activePage === item.name ? 'page' : undefined}
            >
              <Icon size={21} />
              <span>
                {item.name === 'Comptabilité & CC' ? 'Compta' : item.name}
              </span>
            </button>
          )
        })}

        <button
          className={`mobile-nav-item mobile-menu-toggle ${menuOpen || hasMorePageActive ? 'active' : ''}`}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
          <span>Menu</span>
        </button>

        {menuOpen && (
          <div className="mobile-menu-panel">
            <span className="mobile-menu-title">AUTRES RUBRIQUES</span>

            {mobileMoreItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.name}
                  className={`mobile-menu-item ${activePage === item.name ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.name)}
                >
                  <Icon size={19} />
                  <span>{item.name === 'Prospects & Clients' ? 'Contacts' : item.name}</span>
                </button>
              )
            })}
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation
