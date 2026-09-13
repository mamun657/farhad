import { useEffect, useRef, useState } from 'react'
import './App.css'
import Chatbot from './chatbot/Chatbot'
import HeroVideoPreloader from './components/HeroVideoPreloader'
import partnerImage from './assets/partner.png'

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
    category: 'MOBILE ACCESSORIES',
    title: 'Mobile Accessories',
    description: 'Mobile chargers, earphones, headphones, protective screen glass and small electronic accessories for everyday mobile use.',
    tags: 'CHARGERS • EARPHONES • SCREEN GLASS',
    alt: 'Farhad Global Trade mobile accessories and electronic accessories',
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

const farhadAddress = 'Oriant Tower (7th floor), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh'
const farhadMapsUrl = 'https://maps.app.goo.gl/oDcrJf3x8gV6qAk87?g_st=aw'
const farhadPhoneNumber = '+880 1884 821475'
const farhadPhoneNumberRaw = '+8801884821475'
const farhadWhatsAppNumber = '8801531581749'
const farhadEmail = 'miafarhad01636@gmail.com'
const productCategories = [
  'Automotive',
  'Engine & Spare Parts',
  'Mobile Accessories',
  'Fresh Fruits',
  'Cattle Feed',
  'Automotive Lubricants & Accessories',
  'Other / General Inquiry',
]

const officeHours = [
  { day: 'Saturday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Sunday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Monday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Tuesday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Wednesday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Thursday', hours: '9:30 AM – 10:00 PM', closed: false },
  { day: 'Friday', hours: 'Closed', closed: true },
]

const irhamPhone = '+88 01815-677521'
const irhamEmail = 'enterpriseirham@gmail.com'
const irhamLocation = '7th Floor, Orient Tower, North Laldigi, Kotowali, Chattogram.'

function LocationPinIcon() {
  return <span className="location-pin-icon" aria-hidden="true"><span /></span>
}

function ClockIcon() {
  return <span className="clock-icon" aria-hidden="true"><span /><i /></span>
}

function ProductImage({ item }) {
  return <img src={item.image} alt={item.alt} />
}

function App() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [minimumTimeComplete, setMinimumTimeComplete] = useState(false)
  const [showPreloader, setShowPreloader] = useState(true)
  const [activeCredential, setActiveCredential] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Automotive',
    quantity: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const videoRef = useRef(null)
  const reducedMotion = useRef(false)

  const minimumPreloaderMs = 900
  const failsafePreloaderMs = 8500

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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reducedMotion.current = true
    }
  }, [])

  useEffect(() => {
    const minimumTimer = window.setTimeout(() => {
      setMinimumTimeComplete(true)
    }, minimumPreloaderMs)

    const failsafeTimer = window.setTimeout(() => {
      setShowPreloader(false)
    }, failsafePreloaderMs)

    return () => {
      window.clearTimeout(minimumTimer)
      window.clearTimeout(failsafeTimer)
    }
  }, [])

  useEffect(() => {
    if (!showPreloader) return
    if (videoReady && minimumTimeComplete) {
      const hideTimer = window.setTimeout(() => setShowPreloader(false), 450)
      return () => window.clearTimeout(hideTimer)
    }
  }, [showPreloader, videoReady, minimumTimeComplete])

  useEffect(() => {
    const heroSection = document.querySelector('.hero-video-section')
    if (!heroSection) return
    if (!showPreloader && videoReady) {
      heroSection.classList.add('is-video-visible')
      return
    }
    heroSection.classList.remove('is-video-visible')
  }, [showPreloader, videoReady])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const handleLoadedMetadata = () => {
      video.muted = true
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.preload = 'auto'
    }

    const handleCanPlay = () => {
      setVideoReady(true)
    }

    const handlePlaying = () => {
      setVideoPlaying(true)
      setVideoReady(true)
    }

    const handlePause = () => {
      setVideoPlaying(false)
    }

    const handleWaiting = () => {
      setVideoReady(false)
    }

    const handleError = () => {
      console.error('[Hero video] Failed to load or play the Farhad hero video.')
      setVideoReady(false)
      setShowPreloader(false)
    }

    const tryPlayback = async () => {
      if (!video) return
      video.muted = true
      try {
        await video.play()
      } catch (error) {
        console.warn('[Hero video] Autoplay was blocked or unavailable:', error?.message || error)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('error', handleError)

    tryPlayback()
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('error', handleError)
    }
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

  const handleInquiryFieldChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => ({ ...current, [name]: '' }))
  }

  const validateInquiryForm = () => {
    const nextErrors = {}
    if (!formData.name.trim()) nextErrors.name = 'Please enter your name.'
    if (!formData.phone.trim()) nextErrors.phone = 'Please enter your phone or WhatsApp number.'
    if (!formData.category.trim()) nextErrors.category = 'Please select a product category.'
    if (!formData.message.trim()) nextErrors.message = 'Please describe your requirement.'
    return nextErrors
  }

  const handleInquirySubmit = (event) => {
    event.preventDefault()

    const nextErrors = validateInquiryForm()
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setInquirySent(false)
      return
    }

    const message = [
      'Hello Farhad Global Trade,',
      '',
      'I would like to make an inquiry.',
      '',
      `Name: ${formData.name.trim()}`,
      `Phone/WhatsApp: ${formData.phone.trim()}`,
      `Product/Category: ${formData.category}`,
      `Quantity/Requirement: ${formData.quantity.trim() || 'Not specified'}`,
      '',
      'Message:',
      formData.message.trim(),
      '',
      'Thank you.',
    ].join('\n')

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${farhadWhatsAppNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setInquirySent(true)
    setFormData({ name: '', phone: '', category: 'Automotive', quantity: '', message: '' })
    setFormErrors({})
  }

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
              <video
                ref={videoRef}
                className="hero-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label="Farhad Global Trade sourcing and supply video"
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
              >
                <source src="/media/farhad-global-trade-hero.mp4" type="video/mp4" />
              </video>
              <div className="hero-video-overlay" />
              <div className="video-status">
                <span className="video-status-dot" aria-hidden="true" />
                <span>{videoPlaying ? 'PLAYING' : 'PAUSED'}</span>
              </div>
            </div>

            <HeroVideoPreloader visible={showPreloader} />

            <div className="hero-video-copy">
              <p className="eyebrow">FARHAD GLOBAL TRADE</p>
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
                <source src="/media/farhad-global-trade-hero.mp4" type="video/mp4" />
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

        <section className="partner-network-section section-shell reveal-on-scroll" id="partners">
          <div className="partner-network-layout">
            <div className="partner-network-intro">
              <p className="partner-eyebrow"><span /> OUR BUSINESS NETWORK</p>
              <div className="partner-relationship-lockup" aria-label="Farhad Global Trade strategic business partner Irham Enterprise">
                <span>FARHAD GLOBAL TRADE</span>
                <b aria-hidden="true">×</b>
                <span>IRHAM ENTERPRISE</span>
              </div>
              <h2>IRHAM<br />ENTERPRISE</h2>
              <p className="partner-relationship">STRATEGIC BUSINESS PARTNER</p>
              <p className="partner-short-description">Irham Enterprise supports Farhad Global Trade through bidding, import-export and supplier activities across global trade.</p>

              <div className="partner-information">
                <p className="partner-capability-line">AUCTION BIDDER <span>•</span> EXPORT <span>•</span> IMPORT <span>•</span> SUPPLIER</p>

                <div className="partner-details-grid">
                  <div className="partner-detail-block">
                    <span className="partner-detail-label">CONTACT</span>
                    <a href="tel:+8801815677521">{irhamPhone}</a>
                    <a href={`mailto:${irhamEmail}`}>{irhamEmail}</a>
                  </div>
                  <div className="partner-detail-block partner-detail-founder">
                    <span className="partner-detail-label">FOUNDER</span>
                    <strong>Omar Fayaj Chy <small>· Founder</small></strong>
                  </div>
                  <div className="partner-detail-block partner-detail-location">
                    <span className="partner-detail-label">LOCATION</span>
                    <small>{irhamLocation}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="partner-visual-shell">
              <img
                className="partner-visual"
                src={partnerImage}
                alt="Strategic business partnership illustration for Irham Enterprise"
                loading="eager"
              />
            </div>
          </div>
        </section>

        <section className="quote-section section-shell reveal-on-scroll" id="contact">
          <div className="quote-card">
            <p className="section-label">IMPORT • SOURCING • SUPPLY • BUSINESS INQUIRIES</p>
            <h2>Request a Product or Supply Quote</h2>
            <p className="quote-subtitle">Tell us what you are looking for. Share your product requirement and contact details, and Farhad Global Trade will get back to you.</p>

            <form className="quote-form" onSubmit={handleInquirySubmit} noValidate>
              <div className="quote-field-row">
                <div className="quote-field">
                  <label htmlFor="inquiry-name">Your Name *</label>
                  <input
                    id="inquiry-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInquiryFieldChange}
                    placeholder="e.g. Your full name"
                    aria-invalid={Boolean(formErrors.name)}
                  />
                  {formErrors.name && <span className="quote-error">{formErrors.name}</span>}
                </div>

                <div className="quote-field">
                  <label htmlFor="inquiry-phone">Phone / WhatsApp Number *</label>
                  <input
                    id="inquiry-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInquiryFieldChange}
                    placeholder="+880..."
                    aria-invalid={Boolean(formErrors.phone)}
                  />
                  {formErrors.phone && <span className="quote-error">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="quote-field-row">
                <div className="quote-field">
                  <label htmlFor="inquiry-category">Product / Category *</label>
                  <select
                    id="inquiry-category"
                    name="category"
                    value={formData.category}
                    onChange={handleInquiryFieldChange}
                    aria-invalid={Boolean(formErrors.category)}
                  >
                    {productCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.category && <span className="quote-error">{formErrors.category}</span>}
                </div>

                <div className="quote-field">
                  <label htmlFor="inquiry-quantity">Quantity / Requirement</label>
                  <input
                    id="inquiry-quantity"
                    name="quantity"
                    type="text"
                    value={formData.quantity}
                    onChange={handleInquiryFieldChange}
                    placeholder="e.g. quantity, model, specification, packaging..."
                  />
                </div>
              </div>

              <div className="quote-field quote-field-full">
                <label htmlFor="inquiry-message">Your Message / Requirement *</label>
                <textarea
                  id="inquiry-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInquiryFieldChange}
                  placeholder="Tell us about the product, quantity, specification, destination or business requirement..."
                  aria-invalid={Boolean(formErrors.message)}
                />
                {formErrors.message && <span className="quote-error">{formErrors.message}</span>}
              </div>

              {inquirySent && (
                <p className="quote-success">Your inquiry is ready to send via WhatsApp. A new message window will open with your requirement details.</p>
              )}

              <button type="submit" className="quote-submit">Send Inquiry Via WhatsApp <span aria-hidden="true">→</span></button>

              <div className="quote-contact-grid">
                <div className="quote-contact-item">
                  <span>Direct Contact</span>
                  <a href={`tel:${farhadPhoneNumberRaw}`}>{farhadPhoneNumber}</a>
                </div>
                <div className="quote-contact-item">
                  <span>Email</span>
                  <a href={`mailto:${farhadEmail}`}>{farhadEmail}</a>
                </div>
                <div className="quote-contact-item quote-contact-address">
                  <span>Location</span>
                  <p>{farhadAddress}</p>
                </div>
                <div className="quote-contact-tag">CHITTAGONG • BANGLADESH</div>
              </div>
            </form>
          </div>
        </section>

        <section className="location-hours-section section-shell reveal-on-scroll" id="location">
          <article className="location-panel">
            <div className="location-panel-copy">
              <p className="location-eyebrow">OUR OFFICE LOCATION</p>
              <div className="location-panel-main">
                <div className="location-icon-shell"><LocationPinIcon /></div>
                <div>
                  <h2>Oriant Tower (7th floor), Laldighir Uttar Par, Kotwali, Chittagong-4000, Bangladesh</h2>
                  <p>Visit our office for business discussions, product inquiries or import &amp; supply consultation.</p>
                </div>
              </div>
            </div>
            <a className="maps-button location-maps-button" href={farhadMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Farhad Global Trade office location in Google Maps">OPEN IN GOOGLE MAPS <span aria-hidden="true">→</span></a>
          </article>

          <article className="hours-panel" id="office-hours">
            <div className="hours-panel-header">
              <div className="hours-heading-group">
                <div className="hours-icon-shell"><ClockIcon /></div>
                <div>
                  <p className="location-eyebrow">OFFICE HOURS</p>
                  <h2>Office Visiting Hours</h2>
                  <p>You can visit our office during the following hours.</p>
                </div>
              </div>
              <div className="hours-summary" aria-label="Office hours summary">Open Sat – Thu: 9:30 AM – 10:00 PM <span aria-hidden="true">•</span> Friday: Closed</div>
            </div>
            <div className="hours-divider" />
            <div className="hours-grid" aria-label="Weekly office hours">
              {officeHours.map((item) => (
                <div className={`hours-day ${item.closed ? 'hours-day-closed' : ''}`} key={item.day}>
                  <strong>{item.day}</strong>
                  <span>{item.hours}</span>
                </div>
              ))}
            </div>
          </article>
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
            <a href="#location">⌖ Oriant Tower (7th floor),<br />Laldighir Uttar Par,<br />Kotwali, Chittagong-4000,<br />Bangladesh</a>
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
