
import SamaLogo from './SamaLogo'
import {
  Home,
  Calculator,
  Package,
  CalendarDays,
  Users,
  BrainCircuit,
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

function Navigation({ activePage, onNavigate }: NavigationProps) {
  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><SamaLogo size={38} /></div>
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

      <nav className="mobile-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              className={`mobile-nav-item ${activePage === item.name ? 'active' : ''}`}
              onClick={() => onNavigate(item.name)}
              aria-label={item.name}
              title={item.name}
            >
              <Icon size={21} />
              <span>
                {item.name === 'Comptabilité & CC' ? 'Compta' :
                  item.name === 'Prospects & Clients' ? 'Contacts' :
                  item.name === 'Accueil' ? 'Accueil' :
                  item.name === 'Planning' ? 'Planning' :
                  item.name === 'Stock' ? 'Stock' : 'SAMA IA'}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

export default Navigation
