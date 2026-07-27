import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <main style={{ paddingTop: '80px' }}>

      <div className="breadcumb-wrapper">
        <div className="container">
          <h1 className="breadcumb-title">About Us</h1>
        </div>
      </div>

      {/* About Intro */}
      <section className="about-intro-section">
        <div className="container">
          <div className="about-intro-grid">
            <div className="about-intro-text" data-aos="fade-right">
              <span className="text-primary fw-semibold d-block mb-2">Professional & Differentiated</span>
              <h2>Setting New Standards in Digital Solutions</h2>
              <p>We are not just another VAS or digital marketing company. We are a new-generation digital partner built to solve the industry's most pressing challenges. In a landscape dominated by outdated, recycled services and non-compliant advertising practices, we set a new standard.</p>
              <div className="mission-box">
                <div className="mission-icon">
                  <img src="/img/icon/history_1_1.svg" alt="Mission" />
                </div>
                <div>
                  <h5>Our Mission</h5>
                  <p>To lead the transformation of VAS and digital advertising by delivering innovative, ethical, and performance-driven solutions that raise the standards of the entire industry.</p>
                </div>
              </div>
            </div>
            <div className="about-intro-image" data-aos="fade-left">
              <img src="/img/bg/team.jpg" alt="About Meshkat Media" />
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="who-section">
        <div className="container">
          <div className="who-grid">
            <div className="who-image" data-aos="fade-right">
              <img src="/img/bg/meeting.jpg" alt="Who We Are" />
            </div>
            <div className="who-text" data-aos="fade-left">
              <span className="section-badge">Who We Are</span>
              <h2>Global Team of Digital Experts</h2>
              <p>Backed by a unique blend of experience across telecom operations, regulatory environments, and digital advertising, we are a global team of telecom and digital experts with over 15 years of proven success.</p>
              <p>Our expertise spans Value-Added Services (VAS), premium content creation and licensing, mobile payments, and fully compliant digital advertising.</p>
              <p>We also provide international aggregation services and cutting-edge IT solutions tailored to meet evolving market demands.</p>
              <p>Our mission is to deliver innovative, scalable, and ethical digital services that empower telcos, enterprises, and merchants across the globe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="about-value-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '48px' }} data-aos="fade-up">
            <span className="section-badge">Our Value Proposition</span>
            <h2>Tailored Solutions for Every Need</h2>
          </div>
          <div className="about-value-grid">
            {[
              {
                img: '/img/icon/feature_1_1.svg',
                title: 'For Telcos & Aggregators',
                desc: "We recognized the growing gap in the telecom industry - where consumers are disengaged, and operators are stuck with legacy VAS. That's why we design and deliver next-generation VAS products that are not only innovative and high quality, but also aligned with consumer needs and telco brand values. We don't recycle old content - we redefine the VAS experience."
              },
              {
                img: '/img/icon/feature_1_2.svg',
                title: 'For Merchants & Advertisers',
                desc: "The digital ad space is flooded with low-quality, fraudulent traffic and short-term results. We stand out by offering clean, compliant, and brand-safe advertising solutions. We leverage advanced adtech, AI, and transparent global partnerships to drive high ARPU and long-term user value, not just clicks."
              },
              {
                img: '/img/icon/feature_1_3.svg',
                title: 'For Enterprises',
                desc: "In a rapidly evolving digital economy, enterprises need more than off-the-shelf solutions—they need strategic, scalable, and future-ready digital ecosystems. We help enterprises unlock innovation through AI-driven platforms, real-time analytics, and customized digital tools that solve real business challenges."
              },
            ].map((card, i) => (
              <div className="about-value-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <img src={card.img} alt={card.title} />
                <h5>{card.title}</h5>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="expertise-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '48px' }} data-aos="fade-up">
            <span className="section-badge">Our Expertise</span>
            <h2>Comprehensive Digital Solutions</h2>
          </div>
          <div className="expertise-grid">
            {[
              { img: '/img/icon/history_1_1.svg', title: 'Value-Added Services (VAS)', desc: 'Premium content creation and licensing with innovative VAS solutions tailored for modern consumers.' },
              { img: '/img/icon/history_1_2.svg', title: 'Mobile Payments', desc: 'Secure and efficient mobile payment solutions integrated with cutting-edge technology.' },
              { img: '/img/icon/history_1_3.svg', title: 'Digital Advertising', desc: 'Compliant, brand-safe advertising solutions powered by advanced AI and analytics.' },
            ].map((item, i) => (
              <div className="expertise-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="expertise-icon"><img src={item.img} alt={item.title} /></div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 0', background: '#fff' }} data-aos="zoom-in">
        <div className="container">
          <div className="about-cta-card">
            <div>
              <h2>Ready to Work With Us?</h2>
              <p>Let's build something great together.</p>
            </div>
            <Link to="/contact" className="cta-btn-white">Get In Touch</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
