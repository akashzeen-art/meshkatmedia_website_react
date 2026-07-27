import { useState } from 'react'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: '', company: '', email: '', message: '' })
  }

  return (
    <main style={{ paddingTop: '80px' }}>

      <div className="breadcumb-wrapper">
        <div className="container">
          <h1 className="breadcumb-title">Contact Us</h1>
        </div>
      </div>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-infobox" data-aos="fade-right">
              <span className="section-badge">Work With Us</span>
              <h2>Contact Information</h2>
              <p>
                Thank you for your interest in Meshkat Media. We're excited to hear from
                you and discuss how we can help grow your digital presence.
              </p>

              <div className="contact-details">
                <div className="contact-detail-item">
                  <div className="contact-detail-icon"><i className="bi bi-headphones"></i></div>
                  <div>
                    <span className="contact-detail-label">Call Us For Query</span>
                    <a href="tel:+971529692827">+971 529692827</a>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <div className="contact-detail-icon"><i className="bi bi-envelope-open"></i></div>
                  <div>
                    <span className="contact-detail-label">Email Us Anytime</span>
                    <a href="mailto:digital@meshkatmedia.com">digital@meshkatmedia.com</a>
                  </div>
                </div>
                <div className="contact-detail-item">
                  <div className="contact-detail-icon"><i className="bi bi-geo-alt"></i></div>
                  <div>
                    <span className="contact-detail-label">Visit Our Office</span>
                    <span>Business Centre, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-col" data-aos="fade-left">
              {submitted ? (
                <div className="contact-success">
                  <i className="bi bi-check-circle-fill"></i>
                  <h3>Thank You!</h3>
                  <p>Your message has been received. We'll get back to you soon.</p>
                  <button type="button" className="project-btn" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Company Name"
                        value={form.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Your Message"
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="project-btn contact-submit">
                    Submit Now <i className="bi bi-send"></i>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
