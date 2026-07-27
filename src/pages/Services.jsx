import { Link } from 'react-router-dom'
import './Services.css'

const services = [
  {
    img: '/img/bg/service1.jpg',
    title: 'For Telecom Operators',
    desc: "We deliver next-generation VAS solutions that go beyond the traditional. Our offerings include high-quality, innovative, and fully compliant digital content designed to enhance user engagement, build customer loyalty, and elevate your brand image. We partner with operators to replace outdated VAS with value-driven services that resonate with today's digital consumers—reinventing the telecom experience."
  },
  {
    img: '/img/bg/service2.png',
    title: 'For Merchants',
    desc: "We offer clean, transparent, and ROI-driven digital advertising and user acquisition services. By harnessing the power of advanced adtech platforms, AI, and global partnerships, we ensure fraud-free, premium traffic and exceptional campaign performance. Our solutions are optimized for high Average Revenue Per User (ARPU), extended customer Lifetime Value (LTV), and sustainable growth in competitive markets."
  },
  {
    img: '/img/bg/service3.jpg',
    title: 'For Enterprises',
    desc: "We provide enterprise-grade digital solutions tailored to the unique challenges of each industry. Combining artificial intelligence, advanced analytics, and custom technology stacks, we help enterprises unlock new growth opportunities, optimize operations, and drive innovation. Whether you're in fintech, retail, health, or travel, we build the future-ready digital tools your business needs to thrive."
  },
]

export default function Services() {
  return (
    <main style={{ paddingTop: '80px' }}>

      <div className="breadcumb-wrapper">
        <div className="container">
          <h1 className="breadcumb-title">Our Services</h1>
        </div>
      </div>

      <section className="services-section">
        <div className="container">
          <div className="text-center services-header" data-aos="fade-up">
            <span className="section-badge">What We're Offering</span>
            <h2>Next-Generation Digital Solutions</h2>
            <p>We deliver innovative digital services designed to enhance user engagement, drive growth, and transform businesses across multiple industries.</p>
          </div>

          <div className="services-grid">
            {services.map((s, i) => (
              <div className="service-item-card" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <div className="service-item-img">
                  <img src={s.img} alt={s.title} />
                </div>
                <div className="service-item-body">
                  <h5>{s.title}</h5>
                  <p>{s.desc}</p>
                  <Link to="/contact" className="btn-outline-primary-sm">Know More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 0', background: '#f8faff' }} data-aos="zoom-in">
        <div className="container">
          <div className="services-cta-card">
            <div>
              <h2>Ready to Get Started?</h2>
              <p>Contact us today and let's build something great together.</p>
            </div>
            <Link to="/contact" className="cta-btn-white">Contact Us</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
