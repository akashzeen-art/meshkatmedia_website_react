import { useEffect, useRef, useState } from 'react'
import SignalRingCanvas from './SignalRingCanvas.jsx'
import Reveal from './Reveal.jsx'

const stages = [
  {
    id: 'connect',
    num: '01 / 03',
    tag: 'Connect',
    title: (
      <>
        Networks that
        <br />
        never sleep.
      </>
    ),
    body: 'End-to-end telecom platforms, messaging, and carrier partnerships — a living ring of connections across 18 countries.',
    stats: [
      { n: '18', l: 'Countries' },
      { n: '25+', l: 'Years' },
      { n: '∞', l: 'Signals' },
    ],
  },
  {
    id: 'create',
    num: '02 / 03',
    tag: 'Create',
    title: (
      <>
        Content with
        <br />
        a pulse.
      </>
    ),
    body: 'Digital marketing, social, and branded storytelling built for attention — designed to move with the same energy as the networks we run.',
    align: 'right',
  },
  {
    id: 'grow',
    num: '03 / 03',
    tag: 'Grow',
    title: (
      <>
        From signal
        <br />
        to scale.
      </>
    ),
    body: 'Hover the lantern to peel its paper shell and reveal the luminous wireframe within. Scroll to orbit through Meshkat’s world — connect, create, grow.',
    features: [
      'Telecom platforms · VAS · messaging',
      '360° digital & social marketing',
      'Content systems for brand growth',
      'Realtime creative experiences',
    ],
  },
]

/**
 * Sticky 3D lantern backdrop from hero through the rest of the page.
 * Pass remaining homepage sections as children.
 */
export default function SignalExperience({ children }) {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const panels = [...section.querySelectorAll('.signal-panel')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = Number(entry.target.dataset.idx || 0)
          setActive(idx)
        }
      },
      { threshold: 0.35, rootMargin: '-10% 0px -10% 0px' },
    )
    panels.forEach((p) => io.observe(p))

    return () => {
      io.disconnect()
    }
  }, [])

  return (
    <section className="signal-experience" ref={sectionRef} aria-label="Lantern experience">
      <div className="signal-sticky">
        <SignalRingCanvas sectionRef={sectionRef} />
        <div className="signal-hud" aria-hidden="true">
          <div className="signal-hud-corner signal-hud-tl" />
          <div className="signal-hud-corner signal-hud-br" />
          <div className="signal-stage-dots">
            {stages.map((s, i) => (
              <span key={s.id} className={`signal-dot${i === active ? ' is-active' : ''}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="signal-scroll">
        <div className="signal-hero-panel" aria-label="Hero">
          <div className="hero-content signal-hero-content">
            <h1 className="hero-presents-title" aria-label="Meshkat Media Presents">
              <span className="hero-presents-line">MESHKAT MEDIA</span>
              <span className="hero-presents-line hero-presents-line--sub">PRESENTS</span>
            </h1>

            <p className="hero-pillars">
              Digital Infrastructure <span aria-hidden="true">·</span> Growth{' '}
              <span aria-hidden="true">·</span> Innovation
            </p>

            <ul className="hero-focus-list" role="list">
              <li>DCB Enablement</li>
              <li>Digital Marketing</li>
              <li>Enterprise Solutions</li>
              <li>Technology Platforms</li>
            </ul>
          </div>
        </div>

        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`signal-panel${stage.align === 'right' ? ' is-right' : ''}`}
            data-idx={index}
            id={`signal-${stage.id}`}
          >
            <div className="signal-panel-inner">
              <Reveal as="p" className="signal-num">
                {stage.num}
              </Reveal>
              <Reveal as="p" className="signal-tag" delay={40}>
                {stage.tag}
              </Reveal>
              <Reveal as="h2" className="signal-heading" delay={80}>
                {stage.title}
              </Reveal>
              <Reveal as="p" className="signal-body" delay={120}>
                {stage.body}
              </Reveal>

              {stage.stats ? (
                <Reveal as="div" className="signal-stats" delay={160}>
                  {stage.stats.map((stat) => (
                    <div key={stat.l} className="signal-stat">
                      <span className="signal-stat-n">{stat.n}</span>
                      <span className="signal-stat-l">{stat.l}</span>
                    </div>
                  ))}
                </Reveal>
              ) : null}

              {stage.features ? (
                <Reveal as="ul" className="signal-features" delay={160}>
                  {stage.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </Reveal>
              ) : null}
            </div>
          </div>
        ))}

        <div className="signal-rest">{children}</div>
      </div>
    </section>
  )
}
