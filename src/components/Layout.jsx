import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { brand, navItems } from '../data/content.js'
import Atmosphere from './Atmosphere.jsx'

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <Link to="/" className="logo" aria-label="Meshkat Media home">
        <img
          className="logo-img"
          src="/img/MeshkatMediaLogo.png"
          alt="Meshkat Media"
          width={180}
          height={72}
        />
      </Link>

      <nav className="nav-desktop" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.href === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className={`menu-toggle${open ? ' is-open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`nav-mobile${open ? ' open' : ''}`} aria-label="Mobile navigation">
        {navItems.map((item) => (
          <NavLink key={item.href} to={item.href} end={item.href === '/'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <span className="footer-text">© {year} {brand.name}</span>
      <span className="footer-text">United Arab Emirates</span>
      <a className="footer-text" href={brand.emailHref}>
        {brand.email}
      </a>
    </footer>
  )
}

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="site-shell">
      <Atmosphere />
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
