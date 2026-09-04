import { useEffect, useRef } from 'react'

/**
 * Ember-themed canvas atmosphere for the hero —
 * layered mouse-reactive waves inspired by the breathe visual.
 */
export default function HeroWaveCanvas() {
  const bgRef = useRef(null)
  const fxRef = useRef(null)
  const topRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const bgC = bgRef.current
    const fxC = fxRef.current
    const tpC = topRef.current
    if (!wrap || !bgC || !fxC || !tpC) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const bgX = bgC.getContext('2d')
    const fxX = fxC.getContext('2d')
    const tpX = tpC.getContext('2d')
    if (!bgX || !fxX || !tpX) return undefined

    let W = 0
    let H = 0
    let raf = 0
    let last = performance.now()

    let mx = 0.5
    let my = 0.5
    let rmx = 0.5
    let rmy = 0.5
    let pmx = 0.5
    let pmy = 0.5
    let mvx = 0
    let mvy = 0
    let clickImpulse = 0
    let dragEnergy = 0
    let isDragging = false
    const clickRipples = []

    // Soft ambient "breath" pulse so waves feel alive without a session
    let breath = 0.28

    const AR = 200
    const AG = 101
    const AB = 42

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      W = Math.max(1, Math.floor(rect.width))
      H = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ;[bgC, fxC, tpC].forEach((c) => {
        c.width = W * dpr
        c.height = H * dpr
        c.style.width = `${W}px`
        c.style.height = `${H}px`
        const ctx = c.getContext('2d')
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
      })
    }

    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect()
      pmx = mx
      pmy = my
      mx = (e.clientX - rect.left) / Math.max(rect.width, 1)
      my = (e.clientY - rect.top) / Math.max(rect.height, 1)
      mvx = (mx - pmx) * 60
      mvy = (my - pmy) * 60
      if (isDragging) {
        dragEnergy = Math.min(dragEnergy + Math.hypot(mvx, mvy) * 0.04, 1.5)
        if (Math.random() < 0.08) {
          clickRipples.push({
            x: mx,
            y: my,
            t: 0,
            strength: 0.4 + dragEnergy * 0.3,
          })
          if (clickRipples.length > 8) clickRipples.shift()
        }
      }
    }

    const onDown = (e) => {
      const rect = wrap.getBoundingClientRect()
      isDragging = true
      clickImpulse = 1
      clickRipples.push({
        x: (e.clientX - rect.left) / Math.max(rect.width, 1),
        y: (e.clientY - rect.top) / Math.max(rect.height, 1),
        t: 0,
        strength: 1,
      })
      if (clickRipples.length > 6) clickRipples.shift()
    }

    const onUp = () => {
      isDragging = false
    }

    const wv = (ctx, t, yc, amp, fm, sp, ph2, chaos, mouseAmp) => {
      const ma = mouseAmp || 0
      const yB = H * yc + H * (rmy - 0.5) * ma * 0.06
      ctx.beginPath()
      for (let x = 0; x <= W; x += 3) {
        const nx = x / W
        const ph = t * sp
        const mouseWarp =
          (rmx - 0.5) * ma * amp * 0.5 * Math.sin(nx * Math.PI * 2 + 0.5)
        const dragWarp =
          dragEnergy *
          amp *
          0.3 *
          Math.sin(nx * Math.PI * 3 + t * 0.003 + (rmx - 0.5) * 4)
        let rippleWarp = 0
        for (const r of clickRipples) {
          const dx = nx - r.x
          const age = r.t
          const wavefront = age * 0.6
          const dist = Math.abs(dx)
          const spread = 0.12 + age * 0.2
          rippleWarp +=
            r.strength *
            amp *
            0.22 *
            Math.exp(-((dist - wavefront) ** 2) / (spread * spread)) *
            Math.exp(-age * 0.9) *
            Math.sin((dist - wavefront) * 18)
        }
        let y =
          yB +
          mouseWarp +
          dragWarp +
          rippleWarp +
          Math.sin(nx * Math.PI * 2 * fm + ph * 7) * amp * (1 + ma * 0.4) +
          Math.sin(nx * Math.PI * 3 * fm * 0.73 + ph * 5.2 + ph2) * amp * 0.4
        if (chaos > 0.04) {
          y += Math.sin(nx * Math.PI * 8 * fm + ph * 16 + ph2) * amp * chaos * 0.55
          y += Math.sin(nx * Math.PI * 14 * fm + ph * 24) * amp * chaos * 0.22
        }
        if (x === 0) ctx.moveTo(0, y)
        else ctx.lineTo(x, y)
      }
    }

    const drawMouseWave = (t, alpha) => {
      const yBase = H * (0.3 + rmy * 0.4)
      const wAmp =
        H *
        (0.03 + breath * 0.05) *
        (1 + rmx * 0.8 + Math.abs(rmy - 0.5) * 0.6) *
        (1 + dragEnergy * 0.8)
      const velSkew = mvx * 0.003
      for (let layer = 0; layer < 4; layer++) {
        const phOff = layer * 1.1
        tpX.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W
          let y =
            yBase +
            Math.sin(
              nx * Math.PI * 2 * (1 + rmx * 0.8) + t * 0.000045 * 7 + phOff + velSkew * nx,
            ) *
              wAmp +
            Math.sin(nx * Math.PI * 3.7 + t * 0.000028 * 5 + phOff) * wAmp * 0.38 +
            (rmx - 0.5) * H * 0.06 * Math.sin(nx * Math.PI + layer) +
            mvx * wAmp * 0.08 * Math.sin(nx * Math.PI * 3 + phOff) +
            mvy * wAmp * 0.05 * Math.cos(nx * Math.PI * 2 + layer)
          for (const r of clickRipples) {
            const dx = nx - r.x
            const age = r.t
            const wavefront = age * 0.55
            const spread = 0.1 + age * 0.15
            y +=
              r.strength *
              H *
              0.016 *
              Math.exp(-((Math.abs(dx) - wavefront) ** 2) / (spread * spread)) *
              Math.exp(-age) *
              Math.sin((Math.abs(dx) - wavefront) * 22)
          }
          if (x === 0) tpX.moveTo(0, y)
          else tpX.lineTo(x, y)
        }
        tpX.strokeStyle = `rgba(${AR},${AG},${AB},${
          (alpha - 0.01 * layer) * (0.45 + breath * 0.65 + clickImpulse * 0.35)
        })`
        tpX.lineWidth = 1.4 - layer * 0.25
        tpX.stroke()
      }
    }

    const draw = (t, bs) => {
      bgX.fillStyle = '#0a0908'
      bgX.fillRect(0, 0, W, H)

      const gr = bgX.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, W * 0.72)
      gr.addColorStop(0, `rgba(${AR},${AG},${AB},${0.08 + bs * 0.25})`)
      gr.addColorStop(0.42, `rgba(135,48,8,${0.04 + bs * 0.12})`)
      gr.addColorStop(1, 'transparent')
      bgX.fillStyle = gr
      bgX.fillRect(0, 0, W, H)

      const mGlowX = W * (rmx + mvx * 0.02)
      const mGlowY = H * (rmy + mvy * 0.02)
      const gr2 = bgX.createRadialGradient(
        mGlowX,
        mGlowY,
        0,
        mGlowX,
        mGlowY,
        W * (0.45 + dragEnergy * 0.18),
      )
      gr2.addColorStop(0, `rgba(210,72,18,${0.06 + bs * 0.12 + dragEnergy * 0.08})`)
      gr2.addColorStop(0.35, `rgba(150,45,10,${0.03 + bs * 0.06})`)
      gr2.addColorStop(1, 'transparent')
      bgX.fillStyle = gr2
      bgX.fillRect(0, 0, W, H)

      if (clickImpulse > 0.05) {
        clickRipples.forEach((r) => {
          const g2 = bgX.createRadialGradient(
            r.x * W,
            r.y * H,
            0,
            r.x * W,
            r.y * H,
            W * 0.18 * r.strength,
          )
          g2.addColorStop(
            0,
            `rgba(${AR},${AG},${AB},${r.strength * 0.08 * Math.exp(-r.t * 1.5)})`,
          )
          g2.addColorStop(1, 'transparent')
          bgX.fillStyle = g2
          bgX.fillRect(0, 0, W, H)
        })
      }

      const layers = [
        [0.82, 115, 0.78, 0.000082, 20, 65, 10, 0.56],
        [0.76, 95, 1.02, 0.000115, 24, 68, 13, 0.47],
        [0.7, 76, 1.28, 0.000152, 21, 62, 16, 0.39],
        [0.64, 60, 1.58, 0.000192, 27, 60, 19, 0.32],
        [0.58, 48, 1.98, 0.000238, 19, 56, 22, 0.26],
        [0.53, 38, 2.48, 0.000285, 23, 52, 25, 0.2],
        [0.48, 28, 3.2, 0.000338, 20, 49, 28, 0.15],
        [0.44, 20, 4.1, 0.000398, 22, 45, 31, 0.11],
        [0.4, 13, 5.3, 0.000468, 18, 41, 34, 0.08],
      ]

      layers.forEach(([yc, a, fm, sp, hue, sat, lit, op], i) => {
        wv(bgX, t, yc, a * (0.62 + 0.38 * bs), fm, sp, i, 0.08 + bs * 0.12, 0.7)
        bgX.lineTo(W, H)
        bgX.closePath()
        bgX.fillStyle = `hsla(${hue},${sat}%,${lit + bs * 15}%,${op + bs * 0.1})`
        bgX.fill()
      })

      fxX.clearRect(0, 0, W, H)
      tpX.clearRect(0, 0, W, H)

      const mxBias = rmx - 0.5
      const myBias = rmy - 0.5
      const lines = [
        [0.65, 0.062, 1.28, 0.000048, 0.2, 1.0],
        [0.55, 0.04, 2.0, 0.000065, 0.15, 0.7],
        [0.72, 0.048, 0.98, 0.000036, 0.13, 0.6],
        [0.48, 0.026, 2.7, 0.000082, 0.11, 0.5],
        [0.6, 0.068, 0.8, 0.000033, 0.16, 0.9],
        [0.78, 0.036, 1.5, 0.000043, 0.11, 0.55],
      ]

      lines.forEach(([yc, a, fm, sp, op, w], li) => {
        const mouseYShift = myBias * H * 0.18 * (1 - li * 0.08)
        const yB = H * yc + mouseYShift
        const mxAmpBoost =
          1 + Math.abs(mxBias) * 1.8 + dragEnergy * 1.2 + Math.abs(myBias) * 0.6
        const amp = H * a * (0.52 + 0.48 * bs) * mxAmpBoost
        const ph = t * sp
        const fmMod = fm * (1 + mxBias * 0.5 + mvx * 0.04)
        fxX.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const nx = x / W
          let y =
            yB +
            Math.sin(nx * Math.PI * 2 * fmMod + ph * 6 + mxBias * nx * 3) * amp +
            Math.sin(nx * Math.PI * 4 * fmMod * 0.6 + ph * 3.8 + myBias * 2) * amp * 0.35 +
            mxBias * amp * 0.5 * Math.sin(nx * Math.PI * 1.5 + li) +
            mvx * amp * 0.06 * Math.sin(nx * Math.PI * 2.5 + ph * 2) +
            mvy * amp * 0.05 * Math.cos(nx * Math.PI * 2 + li)
          for (const r of clickRipples) {
            const dx = nx - r.x
            const age = r.t
            const wf = age * 0.55
            const sp2 = 0.1 + age * 0.15
            y +=
              r.strength *
              amp *
              0.28 *
              Math.exp(-((Math.abs(dx) - wf) ** 2) / (sp2 * sp2)) *
              Math.exp(-age) *
              Math.sin((Math.abs(dx) - wf) * 20)
          }
          if (x === 0) fxX.moveTo(0, y)
          else fxX.lineTo(x, y)
        }
        const distToMouse = Math.abs(rmy - yc)
        const proximityBoost = Math.exp(-distToMouse * 3) * 0.4
        fxX.strokeStyle = `rgba(245,232,212,${(op + proximityBoost) * (0.45 + 0.55 * bs)})`
        fxX.lineWidth = w * (1 + proximityBoost * 1.5)
        fxX.stroke()
      })

      drawMouseWave(t, 0.12)

      // Soft vignette
      const vig = bgX.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.75)
      vig.addColorStop(0, 'transparent')
      vig.addColorStop(0.7, 'rgba(10,9,8,0.15)')
      vig.addColorStop(1, 'rgba(10,9,8,0.72)')
      bgX.fillStyle = vig
      bgX.fillRect(0, 0, W, H)
    }

    const tick = (now) => {
      const dt = Math.min(now - last, 50)
      last = now

      rmx += (mx - rmx) * 0.04
      rmy += (my - rmy) * 0.04
      clickImpulse *= 0.94
      dragEnergy *= 0.97
      mvx *= 0.88
      mvy *= 0.88
      for (let i = clickRipples.length - 1; i >= 0; i--) {
        clickRipples[i].t += 0.016
        if (clickRipples[i].t > 2.5) clickRipples.splice(i, 1)
      }

      breath = 0.22 + 0.18 * (0.5 + 0.5 * Math.sin(now * 0.00068))
      draw(now, breath)
      raf = requestAnimationFrame(tick)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    wrap.addEventListener(
      'touchstart',
      (e) => {
        const t = e.touches[0]
        if (!t) return
        onDown(t)
      },
      { passive: true },
    )
    wrap.addEventListener(
      'touchmove',
      (e) => {
        const t = e.touches[0]
        if (!t) return
        onMove(t)
      },
      { passive: true },
    )
    wrap.addEventListener('touchend', onUp)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div className="hero-wave" ref={wrapRef} aria-hidden="true">
      <canvas ref={bgRef} className="hero-wave-bg" />
      <canvas ref={fxRef} className="hero-wave-fx" />
      <canvas ref={topRef} className="hero-wave-top" />
      <div className="hero-wave-grain" />
      <div className="hero-wave-vig" />
    </div>
  )
}
