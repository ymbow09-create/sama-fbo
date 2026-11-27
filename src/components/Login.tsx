
import { useState, type FormEvent } from 'react'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Mail,
  LockKeyhole,
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
type AuthMode = 'login' | 'register' | 'reset'

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

function getAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code

  const messages: Record<string, string> = {
    'auth/invalid-email': 'Cette adresse e-mail est invalide.',
    'auth/user-not-found': 'Aucun compte ne correspond à cette adresse.',
    'auth/wrong-password': 'Le mot de passe est incorrect.',
    'auth/invalid-credential': 'Adresse e-mail ou mot de passe incorrect.',
    'auth/email-already-in-use': 'Cette adresse e-mail possède déjà un compte.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie un peu plus tard.',
    'auth/network-request-failed': 'Connexion Internet indisponible. Vérifie ton réseau.',
    'auth/popup-closed-by-user': 'La fenêtre Google a été fermée avant la fin de la connexion.',
    'auth/popup-blocked': 'Ton navigateur a bloqué la fenêtre Google. Autorise les fenêtres pop-up.',
    'auth/unauthorized-domain': 'Ce domaine doit être autorisé dans Firebase Authentication.',
    'auth/operation-not-allowed': 'Ce mode de connexion n’est pas activé dans Firebase.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
  }

  return messages[code || ''] || 'Une erreur est survenue. Vérifie les informations et réessaie.'
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState(
    () => localStorage.getItem('sama-fbo-remembered-user') || '',
  )
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem('sama-fbo-remembered-user')),
  )
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('sama-fbo-login-theme') as Theme) || 'dark',
  )
  const [mode, setMode] = useState<AuthMode>('login')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function preparePersistence() {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    )
  }

  function saveRememberedEmail(value: string) {
    if (rememberMe) {
      localStorage.setItem('sama-fbo-remembered-user', value)
    } else {
      localStorage.removeItem('sama-fbo-remembered-user')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setError('')
    setNotice('')

    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Veuillez saisir votre adresse e-mail.')
      return
    }

    if (mode === 'reset') {
      setLoading(true)
      try {
        await sendPasswordResetEmail(auth, cleanEmail)
        setNotice('Un lien de réinitialisation vient d’être envoyé à ton adresse e-mail. Vérifie également tes courriers indésirables.')
      } catch (err) {
        setError(getAuthError(err))
      } finally {
        setLoading(false)
      }
      return
    }

    if (!password) {
      setError('Veuillez saisir votre mot de passe.')
      return
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
        return
      }

      if (password !== confirmPassword) {
        setError('Les deux mots de passe ne correspondent pas.')
        return
      }
    }

    setLoading(true)

    try {
      await preparePersistence()

      const result = mode === 'register'
        ? await createUserWithEmailAndPassword(auth, cleanEmail, password)
        : await signInWithEmailAndPassword(auth, cleanEmail, password)

      saveRememberedEmail(cleanEmail)
      onLogin(result.user.email || result.user.uid)
    } catch (err) {
      setError(getAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (loading) return

    setLoading(true)
    setError('')
    setNotice('')

    try {
      await preparePersistence()
      const result = await signInWithPopup(auth, googleProvider)
      const userIdentifier = result.user.email || result.user.uid
      saveRememberedEmail(userIdentifier)
      onLogin(userIdentifier)
    } catch (err) {
      setError(getAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('sama-fbo-login-theme', nextTheme)
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
  }

  function handleFacebookLogin() {
    setNotice(
      'La connexion Facebook sera disponible après la configuration de ce fournisseur dans Firebase.',
    )
  }

  const heading = mode === 'register'
    ? 'Créer un compte'
    : mode === 'reset'
      ? 'Mot de passe oublié'
      : 'Bienvenue'

  const description = mode === 'register'
    ? 'Rejoins ton espace SAMA FBO'
    : mode === 'reset'
      ? 'Nous allons t’envoyer un lien de récupération'
      : 'Connecte-toi à ton espace'

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
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.09);
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition: transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease;
        }

        .login-social-button:hover:not(:disabled) {
          transform: translateY(-4px);
          border-color: rgba(52, 211, 153, 0.72);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28), 0 0 22px rgba(52, 211, 153, 0.16);
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
        }

        .login-page[data-theme="light"] .login-social-button {
          color: #183526;
          background: linear-gradient(145deg, #ffffff, #eaf3ed);
          border-color: rgba(39, 125, 84, .22);
        }

        .login-auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          padding: 5px;
          margin: 0 0 22px;
          border: 1px solid rgba(91,190,139,.22);
          border-radius: 14px;
          background: rgba(100,130,110,.08);
        }

        .login-auth-tabs button {
          min-height: 42px;
          border: 0;
          border-radius: 10px;
          color: var(--login-text, #f5f7f5);
          background: transparent;
          font-weight: 700;
          cursor: pointer;
        }

        .login-auth-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #16764d, #239b67);
          box-shadow: 0 4px 14px rgba(22,118,77,.25);
        }

        .login-auth-link {
          border: 0;
          padding: 4px 0;
          color: #42bd83;
          background: transparent;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .login-auth-secondary {
          margin: 17px 0 0;
          text-align: center;
          font-size: 13px;
          color: var(--login-muted, #a8b6ad);
        }

        .login-auth-password {
          position: relative;
        }

        .login-auth-password input {
          padding-right: 48px;
        }

        .login-auth-eye {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          border: 0;
          color: inherit;
          background: transparent;
          cursor: pointer;
        }

        .login-auth-back {
          display: block;
          margin: 0 auto 18px;
          border: 0;
          color: #42bd83;
          background: transparent;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 360px) {
          .login-social-buttons { gap: 8px; }
          .login-social-button { gap: 7px; padding: 10px 7px; font-size: 12px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-social-button { transition: none !important; }
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
          <h1>{heading}<span>.</span></h1>
          <p>{description}</p>
        </div>

        {mode === 'login' && (
          <div className="login-auth-tabs">
            <button type="button" className="active">Connexion</button>
            <button type="button" onClick={() => changeMode('register')}>Créer un compte</button>
          </div>
        )}

        {mode === 'register' && (
          <button
            type="button"
            className="login-auth-back"
            onClick={() => changeMode('login')}
          >
            Retour à la connexion
          </button>
        )}

        {mode === 'reset' && (
          <button
            type="button"
            className="login-auth-back"
            onClick={() => changeMode('login')}
          >
            Retour à la connexion
          </button>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field-group">
            <label htmlFor="login-email">Adresse e-mail</label>
            <div className="login-input-wrap">
              <Mail className="login-input-icon" size={19} />
              <input
                id="login-email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError('')
                }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="login-field-group">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="login-input-wrap login-auth-password">
                <LockKeyhole className="login-input-icon" size={19} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Au moins 6 caractères"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError('')
                  }}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="login-auth-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="login-field-group">
              <label htmlFor="login-confirm-password">Confirmer le mot de passe</label>
              <div className="login-input-wrap">
                <LockKeyhole className="login-input-icon" size={19} />
                <input
                  id="login-confirm-password"
                  type="password"
                  placeholder="Saisir à nouveau le mot de passe"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setError('')
                  }}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
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
                onClick={() => changeMode('reset')}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}

          {notice && <p className="login-success" role="status">{notice}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            <span>
              {loading
                ? 'Veuillez patienter...'
                : mode === 'register'
                  ? 'Créer mon compte'
                  : mode === 'reset'
                    ? 'Envoyer le lien'
                    : 'Accéder à mon espace'}
            </span>
            <span className="login-submit-icon"><ArrowRight size={19} /></span>
          </button>
        </form>

        {mode === 'login' && (
          <>
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
                disabled={loading}
                aria-label="Continuer avec Google"
              >
                <span className="login-social-logo"><GoogleIcon /></span>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="login-social-button"
                onClick={handleFacebookLogin}
                disabled={loading}
                aria-label="Continuer avec Facebook"
              >
                <span className="login-social-logo"><FacebookIcon /></span>
                <span>Facebook</span>
              </button>
            </div>
          </>
        )}

        {mode === 'register' && (
          <p className="login-auth-secondary">
            En créant ton compte, tu pourras retrouver ton espace sur tes appareils.
          </p>
        )}

        <p className="login-footer">ÉTUDES <i /> RIGUEUR <i /> CROISSANCE</p>
      </section>

      {notice && mode === 'login' && (
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


