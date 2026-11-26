import './Splash.css'
import SamaLogo from './SamaLogo'

function Splash() {
  return (
    <main className="splash-screen">
      <div className="splash-glow splash-glow-one" />
      <div className="splash-glow splash-glow-two" />

      <div className="splash-content">
        <div className="splash-logo">
          <SamaLogo size={82} withBackground={false} />
        </div>

        <h1>SAMA <strong>FBO</strong></h1>

        <div className="splash-line" />

        <p>ÉTUDES · RIGUEUR · CROISSANCE</p>
        <span className="splash-loading">VOTRE ESPACE DE RÉUSSITE</span>
      </div>
    </main>
  )
}

export default Splash

