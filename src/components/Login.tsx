
import { useState, type FormEvent } from 'react'
import {
  signInWithPopup,
} from 'firebase/auth'
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Moon,
  Sun,
  UserRound,
  Leaf,
  X,
} from 'lucide-react'
import './Login.css'
import SamaLogo from './SamaLogo'
import { auth, googleProvider } from '../lib/firebase'

type LoginProps = {
  onLogin: (identifier: string) => void
}

type Theme = 'dark' | 'light'

function GoogleIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.7-3.5-11.3-8.2H5.8v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.7 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.9-5.2Z" />
      <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.9 5.2c1.6-4.7 6.1-8.2 11.3-8.2Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.875 11.85v-8.38H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953h-1.513c-1.49 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.38A12.002 12.002 0 0 0 24 12Z" />
    </svg>
  )
}

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
  const [googleLoading, setGoogleLoading] = useState(false)

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

  async function handleGoogleLogin() {
    if (googleLoading) return

    setGoogleLoading(true)
    setError('')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const userIdentifier = user.email || user.uid

      setIdentifier(userIdentifier)

      if (rememberMe) {
        localStorage.setItem('sama-fbo-remembered-user', userIdentifier)
      }

      onLogin(userIdentifier)
    } catch (error) {
      const code = (error as { code?: string }).code

      if (code === 'auth/popup-closed-by-user') {
        setNotice('La fenêtre de connexion Google a été fermée avant la fin de la connexion.')
      } else if (code === 'auth/popup-blocked') {
        setNotice('Ton navigateur a bloqué la fenêtre Google. Autorise les fenêtres pop-up puis réessaie.')
      } else if (code === 'auth/unauthorized-domain') {
        setNotice('Ce domaine n’est pas encore autorisé dans Firebase Authentication. Vérifie les domaines autorisés.')
      } else if (code === 'auth/operation-not-allowed') {
        setNotice('La connexion Google n’est pas activée dans Firebase Authentication. Vérifie le fournisseur Google.')
      } else {
        setNotice('La connexion Google n’a pas abouti. Vérifie ta connexion Internet et réessaie.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  function handleSocialLogin(provider: 'Facebook') {
    setNotice(
      `La connexion avec ${provider} sera activée après la configuration de ce fournisseur dans Firebase.`,
    )
  }

  return (
    <main className="login-page" data-theme={theme}>
      <style>{`
        .login-social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-top: 18px;
        }

        .login-social-button {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 59px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          padding: 12px 15px;
          border: 1px solid rgba(91, 190, 139, 0.28);
          border-radius: 17px;
          color: var(--login-text, #f5f7f5);
          background: linear-gradient(145deg, rgba(24, 48, 36, 0.92), rgba(5, 15, 10, 0.96));
          box-shadow:
            0 8px 22px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.09);
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease;
        }

        .login-social-button::before {
          content: "";
          position: absolute;
          z-index: -1;
          inset: -60%;
          background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.13) 50%, transparent 65%);
          transform: translateX(-70%) rotate(15deg);
          transition: transform 650ms ease;
        }

        .login-social-button:hover:not(:disabled) {
          transform: translateY(-4px);
          border-color: rgba(52, 211, 153, 0.72);
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.28),
            0 0 22px rgba(52, 211, 153, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .login-social-button:hover::before {
          transform: translateX(70%) rotate(15deg);
        }

        .login-social-button:active:not(:disabled) {
          transform: translateY(-1px) scale(.98);
        }

        .login-social-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .login-social-logo {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 11px;
          background: rgba(255,255,255,.08);
          box-shadow: 0 0 15px rgba(255,255,255,.045);
        }

        .login-page[data-theme="light"] .login-social-button {
          color: #183526;
          background: linear-gradient(145deg, #ffffff, #eaf3ed);
          border-color: rgba(39, 125, 84, .22);
          box-shadow: 0 7px 20px rgba(45, 75, 55, .10), inset 0 1px 0 #fff;
        }

        .login-page[data-theme="light"] .login-social-button:hover:not(:disabled) {
          border-color: rgba(22, 134, 83, .55);
          box-shadow: 0 12px 25px rgba(22, 134, 83, .13), 0 0 18px rgba(22, 134, 83, .10);
        }

        @media (max-width: 360px) {
          .login-social-buttons {
            gap: 8px;
          }
          .login-social-button {
            gap: 7px;
            padding: 10px 7px;
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-social-button,
          .login-social-button::before {
            transition: none !important;
          }
        }
      `}</style>

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
                'La connexion actuelle par identifiant et PIN est une démonstration locale. La récupération du PIN sera configurée séparément.',
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
          <p>OU CONTINUER AVEC</p>
          <span />
        </div>

        <div className="login-social-buttons">
          <button
            type="button"
            className="login-social-button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            aria-label="Continuer avec Google"
          >
            <span className="login-social-logo"><GoogleIcon /></span>
            <span>{googleLoading ? 'Connexion...' : 'Google'}</span>
          </button>

          <button
            type="button"
            className="login-social-button"
            onClick={() => handleSocialLogin('Facebook')}
            aria-label="Continuer avec Facebook"
          >
            <span className="login-social-logo"><FacebookIcon /></span>
            <span>Facebook</span>
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
