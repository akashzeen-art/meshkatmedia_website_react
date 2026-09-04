import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import HeroWaveCanvas from '../components/HeroWaveCanvas.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import Reveal from '../components/Reveal.jsx'
import { brand, home, services, stats } from '../data/content.js'

function TitleReveal() {
  const refs = useRef([])

  useEffect(() => {
    refs.current.forEach((el) => {
      if (!el) return
      const delay = Number(el.dataset.delay || 0)
      window.setTimeout(() => el.classList.add('in-view'), delay)
    })
  }, [])

  const segs = [
    { text: 'Mesh', delay: 0 },
    { text: 'kat', italic: true, delay: 120 },
    { text: 'media', delay: 240 },
  ]

  return (
    <h1 className="hero-title" aria-label="Meshkatmedia">
      {segs.map((seg, index) => (
        <span
          key={seg.text}
          ref={(node) => {
            refs.current[index] = node
          }}
          className={`title-seg reveal-line${seg.italic ? ' italic' : ''}`}
          data-delay={seg.delay}
        >
          {seg.text}
        </span>
      ))}
    </h1>
  )
}

export default function Home() {
  return (
    <>
      <section className="hero" aria-label="Hero">
        <HeroWaveCanvas />
        <div className="hero-frame" aria-hidden="true" />

        <div className="hero-content">
          <Reveal as="div" className="hero-meta">
            <span>Telecom · Digital · Content</span>
            <span className="meta-divider" aria-hidden="true">
              —
            </span>
            <span>Sharjah, UAE</span>
          </Reveal>

          <TitleReveal />

          <Reveal as="p" className="hero-sub" delay={500}>
            {brand.slogan}.
            <br />
            End-to-end communication platforms, marketing, and content for a connected world.
          </Reveal>

          <Reveal as="div" className="ticket-zone" delay={700}>
            <div className="ticket-counter">
              <span className="counter-number">30+</span>
              <span className="counter-label">Years of Experience</span>
            </div>
            <MagneticButton to="/contact">Get in Touch</MagneticButton>
            <MagneticButton to="/services">Explore Services</MagneticButton>
          </Reveal>
        </div>
      </section>

      <section className="section-block" id="about" aria-label="About">
        <Reveal as="p" className="section-label">
          About
        </Reveal>
        <div className="split-grid">
          <div>
            <Reveal as="h2" className="section-heading">
              {home.about.title}
            </Reveal>
            {home.about.paragraphs.map((text, index) => (
              <Reveal as="p" className="section-copy" delay={index * 80} key={text}>
                {text}
              </Reveal>
            ))}
            <Reveal as="div" className="split-actions" delay={200}>
              <MagneticButton to="/about">Know More</MagneticButton>
            </Reveal>
          </div>
          <Reveal as="div" className="media-frame" delay={120}>
            <img src="/img/about.jpg" alt="Meshkat Media" />
          </Reveal>
        </div>
      </section>

      <section className="section-block mid" aria-label="Digital Marketing">
        <Reveal as="p" className="section-label">
          Growth
        </Reveal>
        <Reveal as="h2" className="section-heading">
          {home.digitalMarketing.title}
        </Reveal>
        <Reveal as="p" className="section-copy">
          {home.digitalMarketing.text}
        </Reveal>
        <Reveal as="p" className="section-copy" delay={80}>
          {home.socialMedia.text}
        </Reveal>
        <Reveal as="div" className="split-actions" delay={160}>
          <MagneticButton to="/digital-marketing">Digital Marketing</MagneticButton>
          <MagneticButton to="/social-media-marketing">Social Media</MagneticButton>
        </Reveal>
      </section>

      <section className="section-block" id="services" aria-label="Services">
        <Reveal as="p" className="section-label">
          Services
        </Reveal>
        <ul className="artist-list" role="list">
          {services.items.map((item, index) => (
            <Reveal
              as="li"
              className="artist-item reveal-item"
              delay={index * 80}
              key={item.id}
            >
              <span className="artist-index">{String(index + 1).padStart(2, '0')}</span>
              <Link to={`/services#${item.id}`} className="artist-name">
                {item.title}
              </Link>
              <span className="artist-time">Know More →</span>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="manifesto" aria-label="Belief">
        <Reveal as="blockquote" className="manifesto-text">
          Technology has revolutionized the world,
          <br />
          and at Meshkat Media we believe
          <br />
          in revolutionizing technology.
        </Reveal>
      </section>

      <section className="section-block" aria-label="Platform and Content">
        <div className="split-grid">
          <div>
            <Reveal as="p" className="section-label">
              Platform
            </Reveal>
            <Reveal as="h2" className="section-heading">
              {home.platform.title}
            </Reveal>
            {home.platform.paragraphs.map((text) => (
              <Reveal as="p" className="section-copy" key={text}>
                {text}
              </Reveal>
            ))}
            <Reveal as="div" className="split-actions">
              <MagneticButton to="/platform">Know More</MagneticButton>
            </Reveal>
          </div>
          <div>
            <Reveal as="p" className="section-label">
              Content
            </Reveal>
            <Reveal as="h2" className="section-heading">
              {home.content.title}
            </Reveal>
            {home.content.paragraphs.map((text) => (
              <Reveal as="p" className="section-copy" key={text}>
                {text}
              </Reveal>
            ))}
            <Reveal as="div" className="split-actions">
              <MagneticButton to="/content">Know More</MagneticButton>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-block mid" aria-label="Achievements">
        <Reveal as="p" className="section-label">
          Impact
        </Reveal>
        <Reveal as="h2" className="section-heading">
          Our Achievements
        </Reveal>
        <div className="stats-grid">
          {stats.map((item) => (
            <AnimatedCounter
              key={item.label}
              end={item.end}
              label={item.label}
              suffix={item.suffix}
            />
          ))}
        </div>
      </section>

      <section className="section-block" id="contact" aria-label="Contact">
        <Reveal as="p" className="section-label">
          Contact
        </Reveal>
        <div className="cta-band">
          <div>
            <h2>Have an enquiry? Get in Touch!</h2>
            <p>
              {brand.legalName} · {brand.address}
            </p>
          </div>
          <MagneticButton to="/contact">Contact Us</MagneticButton>
        </div>
      </section>
    </>
  )
}
