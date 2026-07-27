import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className="mm-header">
        <div className="mm-header-inner">
          <div className="mm-logo">
            <NavLink to="/"><img src="/img/icon/meshkat-media-logo.jpeg" alt="Meshkat Media" /></NavLink>
          </div>
          <nav className="mm-main-nav mm-desktop-nav">
            <ul>
              <li><NavLink to="/" className={({isActive}) => 'mm-nav-link' + (isActive ? ' active' : '')}>Home</NavLink></li>
              <li><NavLink to="/about" className={({isActive}) => 'mm-nav-link' + (isActive ? ' active' : '')}>About Us</NavLink></li>
              <li><NavLink to="/services" className={({isActive}) => 'mm-nav-link' + (isActive ? ' active' : '')}>What We Do</NavLink></li>
              <li><NavLink to="/contact" className={({isActive}) => 'mm-nav-link' + (isActive ? ' active' : '')}>Contact Us</NavLink></li>
            </ul>
          </nav>
          <div className="mm-header-cta mm-desktop-nav">
            <NavLink to="/contact" className="mm-btn">Get In Touch <i className="bi bi-arrow-right"></i></NavLink>
          </div>
          <button className="mm-mobile-toggle" onClick={() => setMenuOpen(true)}>
            <i className="bi bi-list"></i>
          </button>
        </div>
      </header>

      <div className={`mm-menu-backdrop${menuOpen ? ' active' : ''}`} onClick={closeMenu}></div>

      <div className={`mm-mobile-menu${menuOpen ? ' active' : ''}`}>
        <div className="mm-mobile-menu-header">
          <img src="/img/icon/meshkat-media-logo.jpeg" alt="Meshkat Media" />
          <h3>Meshkat Media</h3>
        </div>
        <div className="mm-mobile-menu-close">
          <button onClick={closeMenu}><i className="bi bi-x"></i></button>
        </div>
        <ul className="mm-mobile-nav">
          <li><NavLink to="/" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}><i className="bi bi-house"></i> Home</NavLink></li>
          <li><NavLink to="/about" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}><i className="bi bi-info-circle"></i> About Us</NavLink></li>
          <li><NavLink to="/services" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}><i className="bi bi-gear"></i> What We Do</NavLink></li>
          <li><NavLink to="/contact" onClick={closeMenu} className={({isActive}) => isActive ? 'active' : ''}><i className="bi bi-envelope"></i> Contact Us</NavLink></li>
        </ul>
        <div className="mm-mobile-cta">
          <NavLink to="/contact" className="mm-mobile-btn" onClick={closeMenu}>Get In Touch <i className="bi bi-arrow-right"></i></NavLink>
        </div>
      </div>
    </>
  )
}
