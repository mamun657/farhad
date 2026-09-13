import farhadLogoUrl from '../../logu/Farhad Logo.svg'

function HeroVideoPreloader({ visible = true }) {
  return (
    <div
      className={`hero-video-preloader ${visible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!visible}
    >
      <div className="hero-video-preloader-shell" aria-label="Loading Farhad Global Trade">
        <div className="hero-video-preloader-glow" />
        <div className="hero-video-preloader-core" />
        <div className="hero-video-preloader-orbit hero-video-preloader-orbit-primary" aria-hidden="true">
          <span className="hero-video-preloader-dot" />
        </div>
        <div className="hero-video-preloader-orbit hero-video-preloader-orbit-secondary" aria-hidden="true" />
        <img
          src={farhadLogoUrl}
          alt="Farhad Global Trade"
          className="hero-video-preloader-logo"
        />
      </div>
    </div>
  )
}

export default HeroVideoPreloader
