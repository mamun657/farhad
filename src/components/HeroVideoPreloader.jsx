import farhadLogoUrl from '../../logu/Farhad Logo.svg'

function HeroVideoPreloader({ visible = true }) {
  return (
    <div
      className={`hero-video-preloader ${visible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!visible}
    >
      <img
        src={farhadLogoUrl}
        alt="Farhad Global Trade"
        className="hero-video-preloader-logo"
      />
    </div>
  )
}

export default HeroVideoPreloader
