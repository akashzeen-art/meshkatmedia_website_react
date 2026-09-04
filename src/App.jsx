import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LanternPreloader from './components/LanternPreloader.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Content from './pages/Content.jsx'
import DigitalMarketing from './pages/DigitalMarketing.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Partners from './pages/Partners.jsx'
import Platform from './pages/Platform.jsx'
import Services from './pages/Services.jsx'
import SocialMediaMarketing from './pages/SocialMediaMarketing.jsx'

export default function App() {
  const [booting, setBooting] = useState(true)
  const [leaving, setLeaving] = useState(false)

  const handleComplete = useCallback(() => {
    setLeaving(true)
    window.setTimeout(() => setBooting(false), 650)
  }, [])

  return (
    <>
      {booting ? (
        <div className={`sand-preloader-shell${leaving ? ' is-leaving' : ''}`}>
          <LanternPreloader onComplete={handleComplete} />
        </div>
      ) : null}

      <div className={`site-boot${booting ? ' is-locked' : ''}`} aria-hidden={booting}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="digital-marketing" element={<DigitalMarketing />} />
              <Route path="social-media-marketing" element={<SocialMediaMarketing />} />
              <Route path="services" element={<Services />} />
              <Route path="platform" element={<Platform />} />
              <Route path="content" element={<Content />} />
              <Route path="partners" element={<Partners />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}
