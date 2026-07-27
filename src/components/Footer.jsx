import { NavLink } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mm-footer">
      <div className="mm-footer-main">
        <div className="container">
          <div className="mm-footer-grid">
            <div className="mm-footer-brand">
              <NavLink to="/" className="mm-footer-logo">
                <img src="/img/icon/meshkat-media-logo.jpeg" alt="Meshkat Media" />
              </NavLink>
              <p className="mm-footer-tagline">
                Empowering your digital presence with creative solutions and cutting-edge technology to drive real results.
              </p>
            </div>
            <div className="mm-footer-links">
              <h3 className="mm-footer-heading">Useful Links</h3>
              <ul className="mm-footer-menu">
                <li><NavLink to="/" className="mm-footer-link">Home</NavLink></li>
                <li><NavLink to="/about" className="mm-footer-link">About Us</NavLink></li>
                <li><NavLink to="/services" className="mm-footer-link">Our Services</NavLink></li>
                <li><NavLink to="/contact" className="mm-footer-link">Contact Us</NavLink></li>
              </ul>
            </div>
            <div className="mm-footer-contact">
              <h3 className="mm-footer-heading">Get In Touch</h3>
              <div className="mm-contact-info">
                <div className="mm-contact-item">
                  <div className="mm-contact-icon"><i className="bi bi-telephone-fill"></i></div>
                  <a href="tel:+971529692827" className="mm-contact-link">+971 529692827</a>
                </div>
                <div className="mm-contact-item">
                  <div className="mm-contact-icon"><i className="bi bi-envelope-fill"></i></div>
                  <a href="mailto:digital@meshkatmedia.com" className="mm-contact-link">digital@meshkatmedia.com</a>
                </div>
                <div className="mm-contact-item">
                  <div className="mm-contact-icon"><i className="bi bi-geo-alt-fill"></i></div>
                  <span className="mm-contact-link">Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mm-footer-copyright">
        <div className="container">
          <div className="mm-copyright-grid">
            <div className="mm-copyright-text">
              &copy; {year} <NavLink to="/" className="mm-copyright-link">Meshkat Media</NavLink>. All Rights Reserved.
            </div>
            <div className="mm-copyright-links">
              <NavLink to="/about" className="mm-copyright-link">Terms & Conditions</NavLink>
              <NavLink to="/about" className="mm-copyright-link">Careers</NavLink>
              <NavLink to="/about" className="mm-copyright-link">Privacy Policy</NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
