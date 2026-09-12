import { useEffect, useRef, useState } from 'react'
import './App.css'
import Chatbot from './chatbot/Chatbot'

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
  { label: 'Licensed', href: '#credentials', className: 'licensed-nav-link' },
]

const productCards = [
  {
    image: '/images/Automotive.png',
    category: 'AUTOMOTIVE',
    title: 'Automotive',
    description: 'Imported vehicles and automotive products sourced for the Bangladesh market.',
    tags: 'VEHICLES • AUTOMOTIVE PRODUCTS',
    alt: 'Farhad Global Trade automotive vehicles and products',
    tone: 'navy',
  },
  {
    image: '/images/Engine.png',
    category: 'ENGINE & SPARE PARTS',
    title: 'Engine & Spare Parts',
    description: 'Car engines, spare parts and essential automotive components sourced from international markets.',
    tags: 'ENGINES • SPARE PARTS • COMPONENTS',
    alt: 'Farhad Global Trade car engines and spare parts',
    tone: 'teal',
  },
  {
    image: '/images/Electronics.png',
    category: 'CONSUMER ELECTRONICS',
    title: 'Consumer Electronics',
    description: 'Everyday electronic products and accessories for modern consumers and businesses.',
    tags: 'CHARGERS • HEADPHONES • EARPHONES',
    alt: 'Farhad Global Trade consumer electronics',
    tone: 'stone',
  },
  {
    image: '/images/Fruits.png',
    category: 'FRESH FRUITS',
    title: 'Fresh Fruits',
    description: 'Fresh produce including apples, oranges/malta and grapes for the Bangladesh market.',
    tags: 'APPLES • ORANGES • GRAPES',
    alt: 'Farhad Global Trade fresh fruits',
    tone: 'sunset',
  },
  {
    image: '/images/Cattle.png',
    category: 'CATTLE FEED',
    title: 'Cattle Feed',
    description: 'Feed-related products including wheat bran and cattle-feed products for livestock needs.',
    tags: 'WHEAT BRAN • CATTLE FEED',
    alt: 'Farhad Global Trade cattle feed',
    tone: 'olive',
  },
  {
    image: '/images/Lubricants.png',
    category: 'AUTOMOTIVE LUBRICANTS & ACCESSORIES',
    title: 'Automotive Lubricants & Accessories',
    description: 'Motor oils, lubricants and essential automotive accessories for cars, motorcycles and everyday vehicle maintenance.',
    tags: 'ENGINE OIL • GEAR OIL • FILTERS',
    alt: 'Farhad Global Trade automotive lubricants and accessories',
    tone: 'lubricants',
  },
]

const processSteps = [
  { number: '01', title: 'Global Sourcing', description: 'Connecting with relevant international product sources.' },
  { number: '02', title: 'Import', description: 'Focused import coordination for selected categories.' },
  { number: '03', title: 'Bangladesh', description: 'Adapting supply to local market demand and needs.' },
  { number: '04', title: 'Distribution', description: 'Supporting onward movement into the market network.' },
  { number: '05', title: 'Customer / Dealer', description: 'Serving business, dealer and customer supply requirements.' },
]

const whyItems = [
  'Global Sourcing',
  'Import Focus',
  'Multi-Category Supply',
  'Market Connection',
  'Business-Focused Service',
  'Growing With Demand',
]

const credentialItems = [
  { image: '/certificate/pic1.jpg', title: 'Membership Certificate' },
  { image: '/certificate/pic2.jpg', title: 'Import Registration Certificate' },
  { image: '/certificate/pic3.jpg', title: 'E-Trade License' },
]

const farhadAddress = 'Oriant Tower (7th flood), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh'
const farhadMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farhadAddress)}`

function ProductImage({ item }) {
  return <img src={item.image} alt={item.alt} />
}

function App() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [activeCredential, setActiveCredential] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!activeCredential) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveCredential(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activeCredential])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const tryPlayback = () => {
      video.play().catch(() => {})
    }

    tryPlayback()
    video.addEventListener('canplay', tryPlayback)
    return () => video.removeEventListener('canplay', tryPlayback)
  }, [])

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-on-scroll')
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        currentObserver.unobserve(entry.target)
      })
    }, { threshold: 0.12 })

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="page-shell">
      <header className={`topbar ${navScrolled ? 'scrolled' : ''}`}>
        <div className="brand-block">
          <span className="brand-name">FARHAD</span>
          <span className="brand-sub">GLOBAL TRADE</span>
        </div>

        <nav className={`nav desktop-nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.label} className={item.className} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" className="menu-toggle" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero-video-section" id="home">
          <div className="hero-video-stage">
            <div className="hero-video-shell">
              <video ref={videoRef} className="hero-video" autoPlay muted loop playsInline preload="metadata" poster="/media/farhad-global-trade-poster.svg" aria-label="Farhad Global Trade sourcing and supply video" onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)}>
                <source src="/media/farhad-global-trade-hero.mp4" type="video/mp4" />
              </video>
              <div className="hero-video-overlay" />
              <div className="video-status">
                  <span className="video-status-dot" aria-hidden="true" />
                <span>{videoPlaying ? 'PLAYING' : 'PAUSED'}</span>
              </div>
            </div>

            <div className="hero-video-copy">
              <p className="eyebrow">FARHAD GLOBAL TRADE</p>
              <h1>GLOBAL CONNECTIONS.<br />LOCAL OPPORTUNITIES.</h1>
              <p className="hero-supporting">Import • Supply • Connect</p>
              <div className="button-row">
                <a className="button button-primary" href="#products">EXPLORE OUR PRODUCTS</a>
                <a className="button button-secondary dark-cta" href="#contact">CONTACT US</a>
              </div>
            </div>
          </div>
        </section>

        <section className="collection-intro section-shell reveal-on-scroll" id="about">
          <div className="section-head">
            <p className="section-label">SMALL BUSINESS. GLOBAL CONNECTIONS.</p>
            <h2>Connecting Global Sourcing With Bangladesh.</h2>
            <p>
              Farhad Global Trade is an import and supply business focused on connecting internationally sourced products with the needs of the Bangladeshi market. From automotive products and electronics to fresh fruits and cattle-feed products, our goal is to create reliable connections between global sourcing and local demand.
            </p>
          </div>
        </section>

        <section className="process section-shell reveal-on-scroll" id="services">
          <div className="section-head dark-head">
            <p className="section-label">OUR BUSINESS MODEL</p>
            <h2>From Global Sourcing to Local Supply</h2>
          </div>

          <div className="process-grid">
            {processSteps.map((step) => (
              <div className="step-card reveal-on-scroll" key={step.number} style={{ '--reveal-delay': `${Number(step.number) * 45}ms` }}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>

          <p className="process-summary">
            “We connect overseas sourcing with local market needs through a focused import and supply process.”
          </p>
        </section>

        <section className="featured section-shell reveal-on-scroll" id="products">
          <div className="section-head">
            <p className="section-label">OUR PRODUCT CATEGORIES</p>
            <h2>Products That Connect Markets.</h2>
            <p>Farhad Global Trade works across selected product categories that serve automotive, consumer, agricultural and everyday market needs.</p>
          </div>

          <div className="product-grid">
            {productCards.map((item, index) => (
              <article className={`product-card product-card-${item.tone} reveal-on-scroll`} key={item.title} style={{ '--reveal-delay': `${index * 70}ms` }}>
                <div className="product-image">
                  <ProductImage item={item} />
                </div>
                <div className="product-content">
                  <p className="product-tag">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span>{item.tags}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="why-farhad section-shell reveal-on-scroll">
          <div className="why-farhad-content">
            <div className="why-farhad-copy">
              <div className="section-head">
                <p className="section-label">WHY FARHAD GLOBAL TRADE</p>
                <h2>Focused On The Connection.</h2>
              </div>

              <div className="feature-list" aria-label="Why choose Farhad Global Trade">
                {whyItems.map((feature) => (
                  <div className="feature-list-item" key={feature}>
                    <span className="feature-list-marker" aria-hidden="true" />
                    <h3>{feature}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="why-farhad-video-shell">
              <video className="why-farhad-video" autoPlay muted loop playsInline preload="metadata" aria-label="Farhad Global Trade business video">
                <source src="/video/habibi.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        <section className="credentials-section section-shell reveal-on-scroll" id="credentials">
          <div className="section-head credentials-head">
            <p className="section-label">OFFICIAL BUSINESS CREDENTIALS</p>
            <h2>Registered &amp; Licensed.</h2>
            <p>Official registrations and business credentials supporting Farhad Global Trade&apos;s operations in Bangladesh.</p>
          </div>

          <div className="credential-grid">
            {credentialItems.map((credential, index) => (
              <button
                type="button"
                className="credential-card reveal-on-scroll"
                key={credential.image}
                style={{ '--reveal-delay': `${index * 120}ms` }}
                onClick={() => setActiveCredential(credential)}
                aria-label={`View ${credential.title}`}
              >
                <span className="credential-preview">
                  <img src={credential.image} alt={`Farhad Global Trade official business credential document ${index + 1}`} loading="lazy" />
                </span>
                <span className="credential-content">
                  <span className="credential-label">OFFICIAL DOCUMENT</span>
                  <strong>{credential.title}</strong>
                  <span className="credential-view">View document <span aria-hidden="true">&rarr;</span></span>
                </span>
              </button>
            ))}
          </div>
          <p className="credential-trust-line">Official registrations &amp; business credentials</p>
        </section>

        <section className="contact-section section-shell reveal-on-scroll" id="contact">
          <div className="visiting-hours-card">
            <div className="visiting-hours-heading">
              <span className="visiting-hours-icon" aria-hidden="true">▤</span>
              <div>
                <p className="section-label">BUSINESS AVAILABILITY</p>
                <h2>Visiting Hours</h2>
                <p>Contact us before visiting to confirm current availability.</p>
              </div>
            </div>
            <div className="hours-summary">OPEN SAT – THU: 10:00 AM – 9:30 PM <span>•</span> FRIDAY: CLOSED</div>
            <div className="hours-grid">
              {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
                <div className="hours-day" key={day}>
                  <strong>{day}</strong>
                  <span>10:00 AM – 9:30 PM</span>
                </div>
              ))}
              <div className="hours-day hours-day-closed">
                <strong>Friday</strong>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {activeCredential && (
        <div className="credential-modal" role="presentation" onClick={() => setActiveCredential(null)}>
          <div className="credential-modal-dialog" role="dialog" aria-modal="true" aria-label={activeCredential.title} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="credential-modal-close" onClick={() => setActiveCredential(null)} aria-label="Close document viewer">&times;</button>
            <img src={activeCredential.image} alt={`${activeCredential.title} full document`} />
          </div>
        </div>
      )}

      <footer className="site-footer section-shell">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="brand-block footer-block">
              <span className="brand-name">FARHAD</span>
              <span className="brand-sub">GLOBAL TRADE</span>
            </div>
            <p className="footer-description">Global Connections</p>
            <p className="footer-copy">Import, sourcing and supply across selected product categories for the Bangladesh market.</p>
          </div>

          <div className="footer-links">
            <p className="footer-kicker">VISIT / CONTACT</p>
            <a href="#location">⌖ Oriant Tower (7th flood),<br />Laldighir Uttar Par,<br />Kotwali, Chittagong,<br />Bangladesh</a>
            <a href="tel:+8801884821475">☎ +880 1884 821475</a>
            <a href="mailto:miafarhad01636@gmail.com">✉ miafarhad01636@gmail.com</a>
          </div>

          <div className="footer-links">
            <p className="footer-kicker">EXPLORE</p>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#products">Products</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
            <a href="#credentials">Licensed</a>
          </div>

          <div className="footer-links">
            <p className="footer-kicker">FARHAD GLOBAL TRADE</p>
            <span>Automotive</span>
            <span>Engine &amp; Spare Parts</span>
            <span>Electronics</span>
            <span>Fresh Fruits</span>
            <span>Cattle Feed</span>
            <span>Automotive Lubricants &amp; Accessories</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Farhad Global Trade. All rights reserved.</span>
          <span>GLOBAL • SOURCED • SUPPLIED</span>
        </div>
      </footer>

      <Chatbot />
    </div>
  )
}

export default App
