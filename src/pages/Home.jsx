import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import AnimatedCounter from '../components/AnimatedCounter.jsx'
import MagneticButton from '../components/MagneticButton.jsx'
import Reveal from '../components/Reveal.jsx'
import { brand, home, services, stats } from '../data/content.js'

const SignalExperience = lazy(() => import('../components/SignalExperience.jsx'))

export default function Home() {
  return (
    <Suspense fallback={<div className="signal-experience signal-experience-fallback" aria-hidden="true" />}>
      <SignalExperience>
        <section className="section-block on-signal" id="about" aria-label="About">
          <Reveal as="p" className="section-label">
            About
          </Reveal>
          <div className="about-copy-block">
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
        </section>

        <section className="section-block mid on-signal" aria-label="Digital Marketing">
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

        <section className="section-block on-signal" id="services" aria-label="Services">
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

        <section className="manifesto on-signal" aria-label="Belief">
          <Reveal as="blockquote" className="manifesto-text">
            Technology has revolutionized the world,
            <br />
            and at Meshkat Media we believe
            <br />
            in revolutionizing technology.
          </Reveal>
        </section>

        <section className="section-block on-signal" aria-label="Platform and Content">
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

        <section className="section-block mid on-signal" aria-label="Achievements">
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

        <section className="section-block on-signal" id="contact" aria-label="Contact">
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
      </SignalExperience>
    </Suspense>
  )
}
