import farhadLogoUrl from '../../logu/Farhad Logo.svg'

function HeroVideoPreloader({ visible = true }) {
  return (
    <div
      className={`hero-video-preloader ${visible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!visible}
    >
      <div className="hero-video-preloader-shell" aria-hidden="true">
        <div className="hero-video-preloader-glow" />
        <div className="hero-video-preloader-orbit hero-video-preloader-orbit-primary">
          <span className="hero-video-preloader-dot" />
        </div>
        <div className="hero-video-preloader-orbit hero-video-preloader-orbit-secondary" />
        <div className="hero-video-preloader-core" />
        <img
          src={farhadLogoUrl}
          alt="Farhad Global Trade"
          className="hero-video-preloader-logo"
        />
      </div>

      <div className="hero-video-preloader-copy" aria-live="polite">
        <span className="hero-video-preloader-brand">FARHAD GLOBAL TRADE</span>
        <span className="hero-video-preloader-tag">GLOBAL CONNECTIONS</span>
      </div>
    </div>
  )
}

export default HeroVideoPreloader
