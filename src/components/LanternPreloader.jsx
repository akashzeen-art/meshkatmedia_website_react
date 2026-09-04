import { useEffect, useRef, useState } from 'react'

const LANTERN_MS = 6000

const WELCOMES = [
  { text: 'Welcome', lang: 'en', dir: 'ltr' },
  { text: 'Bienvenue', lang: 'fr', dir: 'ltr' },
  { text: 'Bienvenido', lang: 'es', dir: 'ltr' },
  { text: 'مرحباً', lang: 'ar', dir: 'rtl' },
  { text: 'स्वागत है', lang: 'hi', dir: 'ltr' },
]

const BLINK_MS = 520
const HOLD_AFTER_MS = 1400

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInQuad(t) {
  return t * t
}

export default function LanternPreloader({ onComplete }) {
  const canvasRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const finishRef = useRef(null)
  const timersRef = useRef([])

  const [phase, setPhase] = useState('lantern') // lantern | welcome | done
  const [welcomeStep, setWelcomeStep] = useState('enter') // enter | cycle | brand | tagline
  const [welcomeIndex, setWelcomeIndex] = useState(0)
  const [blinkOn, setBlinkOn] = useState(true)
  const [showBrand, setShowBrand] = useState(false)
  const [showTagline, setShowTagline] = useState(false)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  const schedule = (fn, ms) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }

  const finish = () => {
    clearTimers()
    setPhase('done')
    onCompleteRef.current?.()
  }

  /* Welcome sequence after lantern */
  useEffect(() => {
    if (phase !== 'welcome') return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setWelcomeStep('tagline')
      setWelcomeIndex(0)
      setBlinkOn(true)
      setShowBrand(true)
      setShowTagline(true)
      schedule(finish, 900)
      return () => clearTimers()
    }

    setWelcomeStep('enter')
    setWelcomeIndex(0)
    setBlinkOn(true)
    setShowBrand(false)
    setShowTagline(false)

    /* After BL → center: Welcome once, then FR / ES / AR / HI, then logo */
    schedule(() => {
      setWelcomeStep('cycle')

      let i = 0
      const nextLang = () => {
        setBlinkOn(false)
        schedule(() => {
          i += 1
          if (i < WELCOMES.length) {
            setWelcomeIndex(i)
            setBlinkOn(true)
            schedule(nextLang, BLINK_MS)
          } else {
            setBlinkOn(false)
            setWelcomeStep('brand')
            setShowBrand(true)
            schedule(() => {
              setWelcomeStep('tagline')
              setShowTagline(true)
              schedule(finish, HOLD_AFTER_MS)
            }, 700)
          }
        }, 100)
      }

      /* Hold English Welcome once, then cycle other languages */
      schedule(nextLang, BLINK_MS + 200)
    }, 1100)

    return () => clearTimers()
  }, [phase])

  /* Lantern canvas */
  useEffect(() => {
    if (phase !== 'lantern') return undefined

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      setPhase('welcome')
      return undefined
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const timer = window.setTimeout(() => setPhase('welcome'), 400)
      return () => window.clearTimeout(timer)
    }

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let finished = false
    let startTime = 0
    let lastTime = 0

    const stars = []
    const sparks = []
    const trail = []
    const embers = []

    let lanternY = 0
    let lanternX = 0
    let cameraY = 0
    let flamePulse = 0
    let launched = false

    const endLantern = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      setPhase('welcome')
    }
    finishRef.current = () => {
      finished = true
      cancelAnimationFrame(raf)
      finish()
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      lanternX = w * 0.5
      if (!launched) {
        lanternY = h * 0.78
        cameraY = 0
      }

      if (stars.length === 0) {
        const count = Math.floor((w * h) / 4500)
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h * 3.2 - h * 0.4,
            r: rand(0.4, 1.8),
            a: rand(0.15, 0.85),
            tw: rand(0.4, 2.2),
            ph: Math.random() * Math.PI * 2,
          })
        }
      }
    }

    const spawnSpark = (x, y, intensity) => {
      const count = Math.floor(rand(2, 5) * intensity)
      for (let i = 0; i < count; i++) {
        sparks.push({
          x: x + rand(-8, 8),
          y: y + rand(0, 12),
          vx: rand(-55, 55),
          vy: rand(40, 160),
          life: rand(0.35, 1.1),
          age: 0,
          size: rand(1.2, 3.4),
          hue: rand(18, 48),
        })
      }
    }

    const spawnTrail = (x, y, intensity) => {
      trail.push({
        x: x + rand(-6, 6),
        y: y + rand(4, 18),
        vx: rand(-18, 18),
        vy: rand(20, 90),
        life: rand(0.5, 1.4),
        age: 0,
        size: rand(6, 18) * intensity,
      })
    }

    const spawnEmber = (x, y) => {
      embers.push({
        x: x + rand(-10, 10),
        y: y + rand(0, 20),
        vx: rand(-20, 20),
        vy: rand(30, 120),
        life: rand(0.8, 2.2),
        age: 0,
        size: rand(0.8, 2.2),
      })
    }

    const lanternProgress = (t) => {
      if (t < 0.18) return 0
      if (t < 0.22) return easeInQuad((t - 0.18) / 0.04) * 0.02
      const climb = (t - 0.22) / 0.78
      return 0.02 + easeInOutCubic(Math.min(1, climb)) * 0.98
    }

    const update = (dt, elapsed) => {
      const t = Math.min(1, elapsed / LANTERN_MS)
      flamePulse += dt * 14

      const progress = lanternProgress(t)
      const startY = h * 0.78
      const endY = -h * 1.15
      lanternY = startY + (endY - startY) * progress
      lanternX = w * 0.5 + Math.sin(elapsed * 0.0018) * (6 + progress * 10)

      if (t >= 0.18) launched = true

      const finale = t > 0.8 ? easeOutCubic(Math.min(1, (t - 0.8) / 0.12)) : 0

      let intensity =
        t < 0.18
          ? 0.35 + Math.sin(flamePulse) * 0.08
          : t < 0.25
            ? 0.7 + (t - 0.18) * 4
            : 0.95 + Math.sin(flamePulse * 1.4) * 0.12

      intensity = intensity + finale * 3.8

      const riseSpeed = launched ? 1 + progress * 2.2 : 0.35
      const sparkChance = 0.55 + intensity * 0.4 + finale * 0.9
      const trailChance = (launched ? 0.7 : 0) + finale * 1.2
      const emberChance = 0.4 + intensity * 0.35 + finale * 0.85

      if (Math.random() < Math.min(1, sparkChance)) {
        spawnSpark(lanternX, lanternY + 28, intensity * riseSpeed * (1 + finale * 2))
      }
      if (finale > 0.05) {
        for (let k = 0; k < 3 + Math.floor(finale * 8); k++) {
          spawnSpark(lanternX + rand(-20, 20), lanternY + rand(10, 50), intensity * 2.5)
          spawnTrail(lanternX + rand(-16, 16), lanternY + rand(20, 70), intensity * (1.5 + finale))
          spawnEmber(lanternX + rand(-24, 24), lanternY + rand(8, 60))
        }
      }
      if (launched && Math.random() < Math.min(1, trailChance)) {
        spawnTrail(lanternX, lanternY + 32, intensity * (1 + finale * 1.5))
      }
      if (Math.random() < Math.min(1, emberChance)) {
        spawnEmber(lanternX, lanternY + 24)
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        p.age += dt
        p.x += p.vx * dt
        p.y += p.vy * dt * (1 + finale * 0.5)
        p.vy += 40 * dt
        p.vx *= 0.985
        if (p.age >= p.life) sparks.splice(i, 1)
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.age += dt
        p.x += p.vx * dt
        p.y += p.vy * dt * (1 + finale * 0.6)
        p.vy += 25 * dt
        p.size *= 0.992
        if (p.age >= p.life) trail.splice(i, 1)
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i]
        p.age += dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vy += 20 * dt
        if (p.age >= p.life) embers.splice(i, 1)
      }

      const targetCam = Math.min(0, lanternY - h * 0.55)
      cameraY += (targetCam - cameraY) * Math.min(1, dt * 3.2)
    }

    const drawSky = (elapsed) => {
      const g = ctx.createLinearGradient(0, cameraY - h * 0.3, 0, cameraY + h * 1.4)
      g.addColorStop(0, '#05060c')
      g.addColorStop(0.35, '#0a0c16')
      g.addColorStop(0.7, '#10131f')
      g.addColorStop(1, '#1a1420')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      const hg = ctx.createRadialGradient(w * 0.5, h * 1.05 + cameraY * 0.15, 0, w * 0.5, h * 1.05, w * 0.7)
      hg.addColorStop(0, 'rgba(80, 40, 20, 0.22)')
      hg.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = hg
      ctx.fillRect(0, 0, w, h)

      for (const s of stars) {
        const sy = s.y - cameraY * 0.35
        if (sy < -20 || sy > h + 20) continue
        const twinkle = 0.55 + 0.45 * Math.sin(elapsed * 0.001 * s.tw + s.ph)
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 236, 210, ${s.a * twinkle})`
        ctx.arc(s.x, sy, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawParticles = () => {
      for (const p of trail) {
        const a = 1 - p.age / p.life
        const screenY = p.y - cameraY
        const rg = ctx.createRadialGradient(p.x, screenY, 0, p.x, screenY, p.size)
        rg.addColorStop(0, `rgba(255, 210, 120, ${0.55 * a})`)
        rg.addColorStop(0.35, `rgba(255, 120, 40, ${0.35 * a})`)
        rg.addColorStop(1, 'rgba(80, 20, 0, 0)')
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.arc(p.x, screenY, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const p of sparks) {
        const a = 1 - p.age / p.life
        const screenY = p.y - cameraY
        ctx.beginPath()
        ctx.fillStyle = `hsla(${p.hue}, 100%, ${55 + a * 25}%, ${a})`
        ctx.arc(p.x, screenY, p.size * a, 0, Math.PI * 2)
        ctx.fill()
      }

      for (const p of embers) {
        const a = 1 - p.age / p.life
        const screenY = p.y - cameraY
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, ${140 + a * 80}, 60, ${a * 0.9})`
        ctx.arc(p.x, screenY, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawFlame = (lx, ly, intensity) => {
      const flicker = 1 + Math.sin(flamePulse) * 0.08 + Math.sin(flamePulse * 2.3) * 0.05
      const base = 22 * intensity * flicker
      const plumeH = 55 * intensity * flicker
      const plumeW = 18 * Math.min(intensity, 4.5)

      const plume = ctx.createRadialGradient(lx, ly + 18, 2, lx, ly + plumeH * 0.9, Math.max(70, 40 * intensity))
      plume.addColorStop(0, `rgba(255, 250, 210, ${Math.min(1, 0.85 * intensity)})`)
      plume.addColorStop(0.2, `rgba(255, 180, 60, ${Math.min(1, 0.55 * intensity)})`)
      plume.addColorStop(0.55, `rgba(255, 80, 20, ${Math.min(0.9, 0.28 * intensity)})`)
      plume.addColorStop(1, 'rgba(40, 10, 0, 0)')
      ctx.fillStyle = plume
      ctx.beginPath()
      ctx.ellipse(lx, ly + plumeH * 0.7, plumeW, plumeH, 0, 0, Math.PI * 2)
      ctx.fill()

      if (intensity > 2) {
        const burst = ctx.createRadialGradient(lx, ly + 50, 4, lx, ly + 90, 120 + intensity * 30)
        burst.addColorStop(0, `rgba(255, 220, 120, ${0.45})`)
        burst.addColorStop(0.4, `rgba(255, 90, 20, ${0.25})`)
        burst.addColorStop(1, 'rgba(40, 0, 0, 0)')
        ctx.fillStyle = burst
        ctx.beginPath()
        ctx.arc(lx, ly + 70, 100 + intensity * 25, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < 3; i++) {
        const ox = Math.sin(flamePulse * 1.5 + i) * (3 + i)
        const oy = 14 + i * 10
        const rg = ctx.createRadialGradient(lx + ox, ly + oy, 0, lx + ox, ly + oy, base * (1 - i * 0.2))
        rg.addColorStop(0, `rgba(255, 245, 200, ${Math.min(1, 0.9 - i * 0.2)})`)
        rg.addColorStop(0.4, `rgba(255, 150, 40, ${Math.min(1, 0.55 - i * 0.1)})`)
        rg.addColorStop(1, 'rgba(180, 40, 0, 0)')
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.arc(lx + ox, ly + oy, base * (1 - i * 0.15), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawLantern = (elapsed, t) => {
      const lx = lanternX
      const ly = lanternY - cameraY
      const scale = Math.min(1.15, 0.85 + (w / 1400) * 0.3)
      const bob = launched ? 0 : Math.sin(elapsed * 0.003) * 3
      const sway = Math.sin(elapsed * 0.0022) * (launched ? 0.04 : 0.02)

      const finale = t > 0.8 ? easeOutCubic(Math.min(1, (t - 0.8) / 0.12)) : 0
      let intensity =
        t < 0.18
          ? 0.4 + Math.sin(flamePulse) * 0.1
          : Math.min(1.35, 0.75 + (t - 0.18) * 1.5)
      intensity += finale * 3.5

      ctx.save()
      ctx.translate(lx, ly + bob)
      ctx.rotate(sway)
      ctx.scale(scale, scale)

      const bloom = ctx.createRadialGradient(0, 10, 5, 0, 20, 160 + finale * 120)
      bloom.addColorStop(0, `rgba(255, 170, 60, ${Math.min(0.85, 0.35 * intensity)})`)
      bloom.addColorStop(0.45, `rgba(200, 90, 20, ${Math.min(0.5, 0.12 * intensity)})`)
      bloom.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = bloom
      ctx.beginPath()
      ctx.arc(0, 20, 160 + finale * 100, 0, Math.PI * 2)
      ctx.fill()

      drawFlame(0, 28, intensity)

      ctx.fillStyle = '#2a1c12'
      ctx.beginPath()
      ctx.moveTo(-22, -38)
      ctx.quadraticCurveTo(0, -52, 22, -38)
      ctx.lineTo(18, -32)
      ctx.quadraticCurveTo(0, -42, -18, -32)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#c89a4a'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, -32, 20, 4, 0, 0, Math.PI * 2)
      ctx.stroke()

      const body = ctx.createLinearGradient(-28, -30, 28, 40)
      body.addColorStop(0, '#5a3018')
      body.addColorStop(0.35, `rgba(255, ${140 + intensity * 40}, 50, 0.95)`)
      body.addColorStop(0.55, `rgba(255, 200, 110, ${0.75 + intensity * 0.2})`)
      body.addColorStop(0.75, `rgba(255, ${120 + intensity * 50}, 40, 0.9)`)
      body.addColorStop(1, '#3a1a0c')

      ctx.fillStyle = body
      ctx.beginPath()
      ctx.moveTo(-26, -30)
      ctx.quadraticCurveTo(-32, 5, -24, 38)
      ctx.quadraticCurveTo(0, 46, 24, 38)
      ctx.quadraticCurveTo(32, 5, 26, -30)
      ctx.quadraticCurveTo(0, -38, -26, -30)
      ctx.closePath()
      ctx.fill()

      const inner = ctx.createRadialGradient(0, 8, 2, 0, 10, 36)
      inner.addColorStop(0, `rgba(255, 240, 180, ${0.55 * intensity})`)
      inner.addColorStop(0.5, `rgba(255, 140, 40, ${0.25 * intensity})`)
      inner.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = inner
      ctx.beginPath()
      ctx.ellipse(0, 8, 18, 28, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(90, 50, 20, ${0.55})`
      ctx.lineWidth = 1.2
      ;[-14, 0, 14].forEach((x) => {
        ctx.beginPath()
        ctx.moveTo(x * 0.85, -30)
        ctx.quadraticCurveTo(x, 5, x * 0.75, 38)
        ctx.stroke()
      })
      ctx.beginPath()
      ctx.ellipse(0, 4, 27, 6, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = '#b8893f'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(0, 38, 24, 5, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = '#8a6a3a'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 42)
      ctx.lineTo(0, 52)
      ctx.stroke()

      ctx.restore()
    }

    const drawVignette = (t) => {
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.2, w * 0.5, h * 0.5, h * 0.85)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, w, h)

      if (t > 0.9) {
        const fade = easeOutCubic((t - 0.9) / 0.1)
        ctx.fillStyle = `rgba(7, 9, 13, ${fade})`
        ctx.fillRect(0, 0, w, h)
      }
    }

    const tick = (now) => {
      if (finished) return
      if (!startTime) {
        startTime = now
        lastTime = now
      }
      const elapsed = now - startTime
      const dt = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now
      const t = Math.min(1, elapsed / LANTERN_MS)

      update(dt, elapsed)
      drawSky(elapsed)
      drawParticles()
      drawLantern(elapsed, t)
      drawVignette(t)

      if (elapsed >= LANTERN_MS) {
        endLantern()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const onSkip = (event) => {
      if (event.key === 'Escape') finishRef.current?.()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', onSkip)

    raf = requestAnimationFrame(tick)
    const safety = window.setTimeout(endLantern, LANTERN_MS + 2000)

    return () => {
      finished = true
      finishRef.current = null
      cancelAnimationFrame(raf)
      window.clearTimeout(safety)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onSkip)
    }
  }, [phase])

  /* Skip during welcome */
  useEffect(() => {
    if (phase !== 'welcome') return undefined
    finishRef.current = finish
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  const current = WELCOMES[welcomeIndex]

  return (
    <div className="sand-preloader" role="status" aria-live="polite" aria-label="Loading Meshkat Media">
      {phase === 'lantern' ? (
        <canvas ref={canvasRef} className="lantern-preloader-canvas" />
      ) : (
        <div className="welcome-stage" aria-hidden={phase === 'done'}>
          <div
            className={`welcome-block${welcomeStep !== 'enter' ? ' is-centered' : ''}${
              welcomeStep === 'enter' ? ' is-entering' : ''
            }`}
          >
            <p
              className={`welcome-word${blinkOn ? ' is-on' : ' is-off'}${
                showBrand ? ' is-gone' : ''
              }${current.lang === 'ar' ? ' is-ar' : ''}${current.lang === 'hi' ? ' is-hi' : ''}`}
              lang={current.lang}
              dir={current.dir}
            >
              {current.text}
            </p>

            <h1 className={`welcome-brand${showBrand ? ' is-visible' : ''}`}>
              <img
                className="welcome-brand-logo"
                src="/img/MeshkatMediaLogo.png"
                alt="Meshkat Media"
              />
            </h1>

            <p className={`welcome-tagline${showTagline ? ' is-visible' : ''}`}>
              Connect <span aria-hidden="true">|</span> Create <span aria-hidden="true">|</span> Grow
            </p>
          </div>
        </div>
      )}

      <button type="button" className="sand-skip" onClick={() => finishRef.current?.()}>
        Skip
      </button>
    </div>
  )
}
