import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import './Home.css'

export default function Home() {
  const dotsRef = useRef(null)

  useEffect(() => {
    if (dotsRef.current) {
      dotsRef.current.innerHTML = ''
      for (let i = 0; i < 40; i++) {
        const dot = document.createElement('div')
        dot.className = 'hero-dot'
        dot.style.left = `${Math.random() * 100}%`
        dot.style.top = `${Math.random() * 100}%`
        dot.style.animationDelay = `${Math.random() * 5}s`
        dot.style.animationDuration = `${5 + Math.random() * 10}s`
        dotsRef.current.appendChild(dot)
      }
    }
  }, [])

  return (
    <main style={{ paddingTop: '80px' }}>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="hero-dots" ref={dotsRef}></div>
        </div>
        <div className="container hero-container">
          {/* Desktop */}
          <div className="hero-content" data-aos="fade-up">
            <h1 className="hero-title">
              Transforming <span className="text-gradient">Digital</span><br />Experiences
            </h1>
            <p className="hero-text">
              We are not just another VAS or digital marketing company. We deliver innovative, ethical, and performance-driven solutions that raise the standards of the entire industry.
            </p>
            <div className="hero-buttons">
              <Link to="/services" className="project-btn">Explore Services <i className="bi bi-arrow-right"></i></Link>
              <Link to="/contact" className="btn-outline">Get in Touch</Link>
            </div>
          </div>
          <div className="hero-image-col" data-aos="fade-up" data-aos-delay="200">
            <div className="hero-image-wrapper">
              <div className="hero-image-bg"></div>
              <img src="/img/bg/header1.png" alt="Digital Solutions" className="hero-image" />
              <div className="floating-card card-1">
                <div className="floating-card-icon"><i className="bi bi-graph-up-arrow"></i></div>
                <div className="floating-card-text">
                  <span className="floating-card-value">15+</span>
                  <span className="floating-card-label">Years Experience</span>
                </div>
              </div>
              <div className="floating-card card-2">
                <div className="floating-card-icon"><i className="bi bi-shield-check"></i></div>
                <div className="floating-card-text">
                  <span className="floating-card-value">100%</span>
                  <span className="floating-card-label">Compliance</span>
                </div>
              </div>
              <div className="floating-card card-3">
                <div className="floating-card-icon"><i className="bi bi-globe"></i></div>
                <div className="floating-card-text">
                  <span className="floating-card-value">Global</span>
                  <span className="floating-card-label">Reach</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,186.7C672,213,768,235,864,224C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* About Cards */}
      <section className="about-section" style={{ background: '#fff', padding: '80px 0' }}>
        <div className="container">
          <div className="section-header text-center" data-aos="fade-up">
            <span className="section-badge">About Us</span>
            <h2 style={{ color: '#0b59db' }}>Professional & Differentiated</h2>
            <p className="section-sub">In a landscape dominated by outdated, recycled services and non-compliant advertising practices,<br /> we set a new standard.</p>
          </div>
          <div className="about-cards-grid">
            {[
              { icon: 'bi-rocket-takeoff', title: 'Our Mission', front: 'To lead the transformation of VAS and digital advertising through innovation.', back: 'Innovative, ethical, and performance-driven solutions that raise the standards of the entire industry.', link: '/about', label: 'Learn More' },
              { icon: 'bi-people', title: 'Who We Are', front: 'A global team with over 15 years of telecom and digital success.', back: 'Experts in telecom operations, regulatory environments, and digital advertising.', link: '/contact', label: 'Connect Now' },
              { icon: 'bi-graph-up-arrow', title: 'Our Expertise', front: 'VAS, content licensing, mobile payments & compliant advertising.', back: 'We deliver scalable, compliant digital services that drive engagement and ROI.', link: '/services', label: 'Our Services' },
            ].map((card, i) => (
              <div className="about-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="about-card-inner">
                  <div className="about-card-front">
                    <div className="icon-wrapper"><i className={`bi ${card.icon}`}></i></div>
                    <h5>{card.title}</h5>
                    <p>{card.front}</p>
                  </div>
                  <div className="about-card-back">
                    <h5>{card.title}</h5>
                    <p>{card.back}</p>
                    <Link to={card.link} className="btn-outline-light-sm">{card.label}</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="value-section" data-aos="fade-up">
        <div className="container">
          <div className="value-cards-grid">
            {[
              { icon: 'bi-broadcast-pin', title: 'For Telcos & Aggregators', desc: 'We design and deliver next-generation VAS products that are innovative, high quality, and aligned with consumer needs and telco brand values.', items: ['Innovative VAS solutions', 'Enhanced user engagement', 'Increased revenue streams'] },
              { icon: 'bi-shop', title: 'For Merchants & Advertisers', desc: 'We offer clean, compliant, and brand-safe advertising solutions leveraging advanced adtech, AI, and transparent global partnerships.', items: ['Fraud-free traffic', 'High ARPU & long-term value', 'Brand-safe advertising'] },
              { icon: 'bi-building', title: 'For Enterprises', desc: 'We help enterprises unlock innovation through AI-driven platforms, real-time analytics, and customized digital tools that solve real business challenges.', items: ['Strategic digital solutions', 'AI-powered analytics', 'Future-ready technology'] },
            ].map((card, i) => (
              <div className="value-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="value-card-accent"></div>
                <div className="value-icon"><i className={`bi ${card.icon}`}></i></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <ul>
                  {card.items.map((item, j) => (
                    <li key={j}><i className="bi bi-check-circle-fill"></i> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="whatwedo-section">
        <div className="container">
          <div className="whatwedo-grid">
            <div className="whatwedo-text" data-aos="fade-right">
              <span className="section-badge">Our Services</span>
              <h2 style={{ color: '#0b59db' }}>What We Do</h2>
              <p>We deliver next-generation digital solutions tailored to the unique needs of telecom operators, merchants, and enterprises.</p>
              <p className="text-muted">From strategic consulting to scalable cloud infrastructure, Meshkat Media empowers businesses with innovative tools, smart automation, and seamless integration.</p>
              <ul className="check-list">
                <li><i className="bi bi-check-circle-fill"></i> We deliver next-generation VAS solutions</li>
                <li><i className="bi bi-check-circle-fill"></i> Clean, transparent, ROI-driven digital advertising</li>
                <li><i className="bi bi-check-circle-fill"></i> Enterprise-grade digital transformation services</li>
              </ul>
              <Link to="/contact" className="project-btn" style={{ marginTop: '24px', display: 'inline-flex' }}>
                Get in Touch <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="whatwedo-image" data-aos="fade-left">
              <div className="img-border-gradient">
                <img src="/img/bg/boy.jpg" alt="Services" />
              </div>
            </div>
          </div>

          {/* Service Cards */}
          <div className="service-cards-grid">
            {[
              { icon: 'bi-broadcast-pin', title: 'For Telecom Operators', desc: 'We deliver next-generation VAS solutions that go beyond the traditional. Our offerings include high-quality, innovative, and fully compliant digital content designed to enhance user engagement, build customer loyalty, and elevate your brand image.' },
              { icon: 'bi-shop', title: 'For Merchants', desc: 'We offer clean, transparent, and ROI-driven digital advertising and user acquisition services. By harnessing the power of advanced adtech platforms, AI, and global partnerships, we ensure fraud-free, premium traffic and exceptional campaign performance.' },
              { icon: 'bi-building', title: 'For Enterprises', desc: 'We provide enterprise-grade digital solutions tailored to the unique challenges of each industry. Combining artificial intelligence, advanced analytics, and custom technology stacks, we help enterprises unlock new growth opportunities.' },
            ].map((card, i) => (
              <div className="service-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="service-icon"><i className={`bi ${card.icon}`}></i></div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <Link to="/contact" className="project-btn">Connect Now <i className="bi bi-arrow-right"></i></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="container">
          <div className="why-grid">
            <div className="why-image" data-aos="fade-right">
              <div className="img-border-gradient">
                <img src="/img/bg/man.jpg" alt="Why Choose Us" />
              </div>
            </div>
            <div className="why-text" data-aos="fade-left">
              <span className="section-badge">Why Choose Us</span>
              <h2>Modern, Measurable & Meaningful</h2>
              <p>We provide enterprise-grade digital solutions tailored to the unique challenges of each industry. Combining artificial intelligence, advanced analytics, and custom technology stacks, we help enterprises unlock new growth opportunities.</p>
              <ul className="check-list">
                <li><i className="bi bi-check-circle-fill"></i> Business-aligned strategies</li>
                <li><i className="bi bi-check-circle-fill"></i> Scalable & AI-powered solutions</li>
                <li><i className="bi bi-check-circle-fill"></i> Real-time performance tracking</li>
              </ul>
              <Link to="/contact" className="project-btn" style={{ marginTop: '24px', display: 'inline-flex' }}>
                Start a Project <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" data-aos="zoom-in">
        <div className="container">
          <div className="cta-card">
            <div className="cta-text">
              <h2>Ready to Transform Your Digital Strategy?</h2>
              <p>Partner with us to craft innovative, ethical, and high-performance solutions tailored for your business growth.</p>
            </div>
            <Link to="/contact" className="cta-btn">Contact Us Today</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
