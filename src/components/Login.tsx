import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  ScanLine,
  Sun,
  UserRound,
  UserPlus,
  Leaf,
  X,
} from 'lucide-react'
import './Login.css'
import SamaLogo from './SamaLogo'

type LoginProps = {
  onLogin: (identifier: string) => void
}

type Theme = 'dark' | 'light'

function Login({ onLogin }: LoginProps) {
  const [identifier, setIdentifier] = useState(
    () => localStorage.getItem('sama-fbo-remembered-user') || '',
  )
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem('sama-fbo-remembered-user')),
  )
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('sama-fbo-login-theme') as Theme) || 'dark',
  )
  const [notice, setNotice] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!identifier.trim()) {
      setError('Veuillez saisir votre identifiant.')
      return
    }

    if (!/^[0-9]{4,6}$/.test(pin)) {
      setError('Le code PIN doit contenir 4 à 6 chiffres.')
      return
    }

    if (rememberMe) {
      localStorage.setItem('sama-fbo-remembered-user', identifier.trim())
    } else {
      localStorage.removeItem('sama-fbo-remembered-user')
    }

    setError('')
    onLogin(identifier.trim())
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('sama-fbo-login-theme', nextTheme)
  }

  function enterDemo() {
    setError('')
    onLogin('Démo')
  }

  return (
    <main className="login-page" data-theme={theme}>
      <div className="login-atmosphere" aria-hidden="true">
        <div className="login-orbit login-orbit-one" />
        <div className="login-orbit login-orbit-two" />
        <div className="login-sphere login-sphere-one" />
        <div className="login-sphere login-sphere-two" />
        <div className="login-curve login-curve-one" />
        <div className="login-curve login-curve-two" />
      </div>

      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
      </button>

      <section className="login-panel">
        <div className="login-panel-topline" />

        <div className="login-identity">
          <div className="login-logo">
            <div className="login-logo-inner">
              <SamaLogo size={76} withBackground={false} />
            </div>
            <span className="login-logo-dot" />
          </div>

          <p className="login-brand">SAMA <span>FBO</span></p>
          <p className="login-signature">ÉTUDES <i /> RIGUEUR <i /> CROISSANCE</p>
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">VOTRE ESPACE PERSONNEL</span>
          <h1>Bienvenue<span>.</span></h1>
          <p>Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field-group">
            <label htmlFor="identifier">Identifiant ou adresse e-mail</label>
            <div className="login-input-wrap">
              <UserRound className="login-input-icon" size={19} />
              <input
                id="identifier"
                type="text"
                placeholder="Votre identifiant"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value)
                  setError('')
                }}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field-group">
            <label htmlFor="pin">Code PIN</label>
            <div className="login-input-wrap">
              <LockKeyhole className="login-input-icon" size={19} />
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                placeholder="Saisissez votre code PIN"
                value={pin}
                onChange={(event) => {
                  setPin(event.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                autoComplete="one-time-code"
              />
              <button
                type="button"
                className="login-eye-button"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? 'Masquer le code PIN' : 'Afficher le code PIN'}
              >
                {showPin ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              <span className="login-custom-check" />
              <span>Se souvenir de moi</span>
            </label>

            <button
              type="button"
              className="login-text-button"
              onClick={() => setNotice(
                'La connexion actuelle est une démonstration locale. Aucun PIN réel n’est enregistré. Pour accéder à l’application, saisis ton identifiant et un code de 4 à 6 chiffres, ou utilise le Mode Démo.',
              )}
            >
              PIN oublié ?
            </button>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="login-submit">
            <span>Accéder à mon espace</span>
            <span className="login-submit-icon"><ArrowRight size={19} /></span>
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>OU ACCÈS RAPIDE</p>
          <span />
        </div>

        <div className="login-shortcuts">
          <button type="button" className="login-shortcut" onClick={enterDemo}>
            <span className="login-shortcut-icon"><Leaf size={19} /></span>
            <span>Mode Démo</span>
          </button>

          <button
            type="button"
            className="login-shortcut"
            onClick={() => setNotice(
              'La création et la configuration des profils ne sont pas encore disponibles. Cette fonctionnalité sera ajoutée dans une prochaine version de SAMA FBO.',
            )}
          >
            <span className="login-shortcut-icon"><UserPlus size={19} /></span>
            <span>Mon profil</span>
          </button>

          <button
            type="button"
            className="login-shortcut"
            onClick={() => setNotice(
              'Le scanner de documents est en préparation. Il ne demande pas encore l’accès à votre appareil photo.',
            )}
          >
            <span className="login-shortcut-icon"><ScanLine size={19} /></span>
            <span>Scanner</span>
          </button>
        </div>

        <p className="login-footer">ÉTUDES <i /> RIGUEUR <i /> CROISSANCE</p>
      </section>

      {notice && (
        <div className="login-notice-backdrop" onClick={() => setNotice('')}>
          <section
            className="login-notice"
            role="dialog"
            aria-modal="true"
            aria-label="Information"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="login-notice-close"
              onClick={() => setNotice('')}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <div className="login-notice-icon"><Leaf size={25} /></div>
            <h2>Information</h2>
            <p>{notice}</p>
            <button
              type="button"
              className="login-notice-confirm"
              onClick={() => setNotice('')}
            >
              Compris
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default Login


