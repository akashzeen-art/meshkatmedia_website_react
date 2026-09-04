import { useEffect, useRef } from 'react'

const settings = {
  cellSize: 3,
  startText: 'Meshkatmedia',
  hiddenLines: [
    'Revolutionizing technology for enhanced communication solutions.',
    'End-to-end communication platforms, marketing, and content for a connected world.',
  ],
  releaseTestsPerFrame: 1500,
  releaseChance: 0.022,
  gravity: 850,
  airDrag: 0.992,
  settleStepsPerFrame: 5,
  pileHoldSeconds: 0.55,
  hiddenFadeInSeconds: 0.4,
  reformDurationSeconds: 1.85,
  reformStaggerSeconds: 0.55,
  revealHoldSeconds: 1.15,
  revealFadeSeconds: 0.55,
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

export default function SandPreloader({ onComplete }) {
  const canvasRef = useRef(null)
  const onCompleteRef = useRef(onComplete)
  const finishRef = useRef(null)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      onCompleteRef.current?.()
      return undefined
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const timer = window.setTimeout(() => onCompleteRef.current?.(), 400)
      return () => window.clearTimeout(timer)
    }

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let cols = 0
    let rows = 0
    let fixedCodepen = new Uint8Array(0)
    let pile = new Uint8Array(0)
    let codepenCells = []
    let looseCells = []
    let falling = []
    let reforming = []
    let hiddenAlpha = 0
    let phase = 'codepen'
    let phaseTime = 0
    let lastTime = performance.now()
    let raf = 0
    let finished = false

    const index = (col, row) => row * cols + col
    const colFromIndex = (i) => i % cols
    const rowFromIndex = (i) => Math.floor(i / cols)
    const inBounds = (col, row) => col >= 0 && col < cols && row >= 0 && row < rows

    const finish = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)
      onCompleteRef.current?.()
    }
    finishRef.current = finish

    const buildCodepenText = () => {
      const maskCanvas = document.createElement('canvas')
      const maskCtx = maskCanvas.getContext('2d')
      if (!maskCtx) return

      maskCanvas.width = w
      maskCanvas.height = h

      const fontSize = Math.min(w * 0.11, h * 0.16, 108)

      maskCtx.clearRect(0, 0, w, h)
      maskCtx.fillStyle = '#fff'
      maskCtx.textAlign = 'center'
      maskCtx.textBaseline = 'middle'
      maskCtx.font = `900 ${fontSize}px "Bodoni Moda", Georgia, serif`
      maskCtx.fillText(settings.startText, w / 2, h * 0.38)

      const image = maskCtx.getImageData(0, 0, w, h).data
      codepenCells = []
      looseCells = []

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = Math.floor(col * settings.cellSize + settings.cellSize / 2)
          const y = Math.floor(row * settings.cellSize + settings.cellSize / 2)
          const pixelIndex = (y * w + x) * 4
          const alpha = image[pixelIndex + 3]

          if (alpha > 35) {
            const i = index(col, row)
            fixedCodepen[i] = 1
            codepenCells.push(i)
            looseCells.push(i)
          }
        }
      }

      shuffle(looseCells)
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight

      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(w / settings.cellSize)
      rows = Math.ceil(h / settings.cellSize)

      fixedCodepen = new Uint8Array(cols * rows)
      pile = new Uint8Array(cols * rows)
      codepenCells = []
      looseCells = []
      falling = []
      reforming = []
      hiddenAlpha = 0
      phase = 'codepen'
      phaseTime = 0

      buildCodepenText()
    }

    const releaseOneGrain = (cellIndex) => {
      const col = colFromIndex(cellIndex)
      const row = rowFromIndex(cellIndex)
      fixedCodepen[cellIndex] = 0

      falling.push({
        x: col * settings.cellSize,
        y: row * settings.cellSize,
        vx: rand(-22, 22),
        vy: rand(40, 150),
        drift: rand(-55, 55),
        driftTarget: rand(-85, 85),
        driftTimer: rand(0.18, 0.9),
      })
    }

    const releaseCodepen = () => {
      if (looseCells.length === 0) {
        phase = 'falling'
        phaseTime = 0
        return
      }

      for (let i = 0; i < settings.releaseTestsPerFrame; i++) {
        if (looseCells.length === 0) break

        const listIndex = randInt(0, looseCells.length - 1)
        const cellIndex = looseCells[listIndex]

        if (fixedCodepen[cellIndex] === 0) {
          looseCells.splice(listIndex, 1)
          continue
        }

        const col = colFromIndex(cellIndex)
        const row = rowFromIndex(cellIndex)

        const belowEmpty =
          row >= rows - 1 || fixedCodepen[index(col, Math.min(row + 1, rows - 1))] === 0

        const sideEmpty =
          col <= 0 ||
          col >= cols - 1 ||
          fixedCodepen[index(Math.max(col - 1, 0), row)] === 0 ||
          fixedCodepen[index(Math.min(col + 1, cols - 1), row)] === 0

        const edgeMultiplier = belowEmpty || sideEmpty ? 3.3 : 1

        if (Math.random() < settings.releaseChance * edgeMultiplier) {
          releaseOneGrain(cellIndex)
          looseCells.splice(listIndex, 1)
        }
      }
    }

    const pileSolid = (col, row) => {
      if (row >= rows) return true
      if (col < 0 || col >= cols) return true
      return pile[index(col, row)] === 1
    }

    const setPile = (col, row) => {
      if (!inBounds(col, row)) return
      pile[index(col, row)] = 1
    }

    const settleFallingParticle = (p) => {
      let col = Math.floor(p.x / settings.cellSize)
      let row = Math.floor(p.y / settings.cellSize)
      col = Math.max(0, Math.min(cols - 1, col))
      row = Math.max(0, Math.min(rows - 1, row))

      if (!pileSolid(col, row)) {
        setPile(col, row)
        return
      }
      if (!pileSolid(col - 1, row)) {
        setPile(col - 1, row)
        return
      }
      if (!pileSolid(col + 1, row)) {
        setPile(col + 1, row)
        return
      }
      for (let y = row - 1; y >= 0; y--) {
        if (!pileSolid(col, y)) {
          setPile(col, y)
          return
        }
      }
    }

    const updateFalling = (dt) => {
      for (let i = falling.length - 1; i >= 0; i--) {
        const p = falling[i]
        p.driftTimer -= dt

        if (p.driftTimer <= 0) {
          p.driftTarget = rand(-85, 85)
          p.driftTimer = rand(0.25, 1.2)
        }

        p.drift += (p.driftTarget - p.drift) * dt * 2
        p.vx += p.drift * dt
        p.vy += settings.gravity * dt
        p.vx *= settings.airDrag
        p.vy *= settings.airDrag
        p.x += p.vx * dt
        p.y += p.vy * dt

        const col = Math.floor(p.x / settings.cellSize)
        const nextRow = Math.floor((p.y + settings.cellSize) / settings.cellSize)

        if (p.x < -60) p.x = 0
        if (p.x > w + 60) p.x = w - settings.cellSize

        if (nextRow >= rows || pileSolid(col, nextRow)) {
          settleFallingParticle(p)
          falling.splice(i, 1)
        }
      }

      if (phase === 'falling' && falling.length === 0) {
        phase = 'pile'
        phaseTime = 0
      }
    }

    const settlePileCell = (col, row) => {
      const current = index(col, row)
      if (pile[current] !== 1) return

      if (!pileSolid(col, row + 1)) {
        pile[index(col, row + 1)] = 1
        pile[current] = 0
        return
      }

      const preferLeft = Math.random() > 0.5
      if (preferLeft) {
        if (!pileSolid(col - 1, row + 1)) {
          pile[index(col - 1, row + 1)] = 1
          pile[current] = 0
          return
        }
        if (!pileSolid(col + 1, row + 1)) {
          pile[index(col + 1, row + 1)] = 1
          pile[current] = 0
        }
      } else {
        if (!pileSolid(col + 1, row + 1)) {
          pile[index(col + 1, row + 1)] = 1
          pile[current] = 0
          return
        }
        if (!pileSolid(col - 1, row + 1)) {
          pile[index(col - 1, row + 1)] = 1
          pile[current] = 0
        }
      }
    }

    const settlePile = () => {
      const leftToRight = Math.random() > 0.5
      for (let row = rows - 2; row >= 0; row--) {
        if (leftToRight) {
          for (let col = 1; col < cols - 1; col++) settlePileCell(col, row)
        } else {
          for (let col = cols - 2; col >= 1; col--) settlePileCell(col, row)
        }
      }
    }

    const collectPileCells = () => {
      const cells = []
      for (let row = rows - 1; row >= 0; row--) {
        for (let col = 0; col < cols; col++) {
          const i = index(col, row)
          if (pile[i] === 1) cells.push(i)
        }
      }
      return cells
    }

    const startReform = () => {
      const pileCells = collectPileCells()
      const targets = codepenCells.slice()
      pile.fill(0)

      pileCells.sort((a, b) => rowFromIndex(b) - rowFromIndex(a))
      targets.sort((a, b) => rowFromIndex(b) - rowFromIndex(a))

      const count = Math.min(pileCells.length, targets.length)
      reforming = []

      for (let i = 0; i < count; i++) {
        const source = pileCells[i]
        const target = targets[i]
        const sx = colFromIndex(source) * settings.cellSize
        const sy = rowFromIndex(source) * settings.cellSize
        const tx = colFromIndex(target) * settings.cellSize
        const ty = rowFromIndex(target) * settings.cellSize

        reforming.push({
          sx,
          sy,
          tx,
          ty,
          x: sx,
          y: sy,
          delay: rand(0, settings.reformStaggerSeconds),
          duration: rand(
            settings.reformDurationSeconds * 0.75,
            settings.reformDurationSeconds * 1.15,
          ),
          wave: rand(-18, 18),
          phaseOffset: rand(0, Math.PI * 2),
        })
      }

      phase = 'reform'
      phaseTime = 0
    }

    const updateReform = () => {
      hiddenAlpha = 1
      let allArrived = true

      for (const p of reforming) {
        const localTime = phaseTime - p.delay
        if (localTime <= 0) {
          p.x = p.sx
          p.y = p.sy
          allArrived = false
          continue
        }

        const t = clamp01(localTime / p.duration)
        const eased = easeInOutCubic(t)
        const arc = Math.sin(eased * Math.PI)
        const wobble = Math.sin(eased * Math.PI * 2 + p.phaseOffset) * p.wave * arc

        p.x = p.sx + (p.tx - p.sx) * eased + wobble
        p.y = p.sy + (p.ty - p.sy) * eased - arc * h * 0.08

        if (t < 1) allArrived = false
      }

      if (allArrived) {
        for (const cell of codepenCells) fixedCodepen[cell] = 1
        reforming = []
        phase = 'hiddenHold'
        phaseTime = 0
        hiddenAlpha = 1
      }
    }

    const updatePhase = (dt) => {
      phaseTime += dt

      if (phase === 'codepen') releaseCodepen()

      if (phase === 'pile' && phaseTime >= settings.pileHoldSeconds) {
        phase = 'hiddenFadeIn'
        phaseTime = 0
        hiddenAlpha = 0
      }

      if (phase === 'hiddenFadeIn') {
        hiddenAlpha = Math.min(1, phaseTime / settings.hiddenFadeInSeconds)
        if (hiddenAlpha >= 1) {
          hiddenAlpha = 1
          startReform()
        }
      }

      if (phase === 'reform') updateReform()

      if (phase === 'hiddenHold') {
        hiddenAlpha = 1
        if (phaseTime >= settings.revealHoldSeconds) {
          phase = 'exit'
          phaseTime = 0
        }
      }

      if (phase === 'exit' && phaseTime >= settings.revealFadeSeconds) {
        finish()
      }
    }

    const drawHiddenText = () => {
      if (hiddenAlpha <= 0) return

      const lines = settings.hiddenLines
      const fontSize = Math.min(15, Math.max(11, w * 0.012))
      const lineHeight = fontSize * 1.55
      const startY = h - 36 - ((lines.length - 1) * lineHeight) / 2

      ctx.save()
      ctx.globalAlpha = hiddenAlpha
      ctx.fillStyle = 'rgb(255, 232, 168)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `700 ${fontSize}px "Space Mono", monospace`

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], w / 2, startY + i * lineHeight)
      }

      ctx.restore()
    }

    const drawCells = (getter) => {
      ctx.fillStyle = 'rgb(236, 204, 116)'
      const size = settings.cellSize
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (!getter(col, row)) continue
          ctx.fillRect(col * size, row * size, size, size)
        }
      }
    }

    const draw = () => {
      const exitFade =
        phase === 'exit' ? 1 - clamp01(phaseTime / settings.revealFadeSeconds) : 1

      ctx.fillStyle = '#0a0908'
      ctx.fillRect(0, 0, w, h)

      // Subtle vignette matching site
      const gradient = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, h * 1.1)
      gradient.addColorStop(0, '#20242b')
      gradient.addColorStop(0.72, '#0f1115')
      gradient.addColorStop(1, '#0a0908')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.globalAlpha = exitFade

      drawHiddenText()
      drawCells((col, row) => fixedCodepen[index(col, row)] === 1)

      ctx.fillStyle = 'rgb(236, 204, 116)'
      for (const p of falling) {
        ctx.fillRect(p.x, p.y, settings.cellSize, settings.cellSize)
      }

      drawCells((col, row) => pile[index(col, row)] === 1)

      for (const p of reforming) {
        ctx.fillRect(p.x, p.y, settings.cellSize, settings.cellSize)
      }

      ctx.restore()
    }

    const tick = (now) => {
      if (finished) return
      const dt = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now

      updatePhase(dt)
      updateFalling(dt)

      if (phase !== 'reform' && phase !== 'hiddenHold' && phase !== 'exit') {
        for (let i = 0; i < settings.settleStepsPerFrame; i++) settlePile()
      }

      draw()
      raf = requestAnimationFrame(tick)
    }

    const onSkip = (event) => {
      if (event.key === 'Escape' || event.type === 'click') finish()
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', onSkip)
    canvas.addEventListener('click', onSkip)

    const start = () => {
      if (finished) return
      resize()
      lastTime = performance.now()
      raf = requestAnimationFrame(tick)
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(start).catch(start)
    } else {
      start()
    }

    // Safety timeout so the site never stays blocked
    const safety = window.setTimeout(finish, 18000)

    return () => {
      finished = true
      finishRef.current = null
      cancelAnimationFrame(raf)
      window.clearTimeout(safety)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onSkip)
      canvas.removeEventListener('click', onSkip)
    }
  }, [])

  return (
    <div className="sand-preloader" role="status" aria-live="polite" aria-label="Loading Meshkatmedia">
      <canvas id="sandCanvas" ref={canvasRef} />
      <button
        type="button"
        className="sand-skip"
        onClick={() => finishRef.current?.()}
      >
        Skip
      </button>
    </div>
  )
}
