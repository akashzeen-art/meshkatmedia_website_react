import { useEffect, useRef } from 'react'

const VS = `
attribute vec2 a;
void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`

const FS = `
precision highp float;

uniform vec2  uR;
uniform float uT;
uniform float uS;
uniform vec2  uMouse;
uniform float uMouseActive;
uniform float uQ;

float sat(float x) { return clamp(x, 0.0, 1.0); }

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - 0.5 * uR) / uR.y;
  float aspect = uR.x / uR.y;
  float t = uT;
  float s = sat(uS);

  /* Warm cinematic palette — dawn easing toward soft midday */
  vec3 skyZenith = mix(vec3(0.16, 0.20, 0.40), vec3(0.30, 0.52, 0.82), s);
  vec3 skyMid    = mix(vec3(0.52, 0.40, 0.52), vec3(0.48, 0.70, 0.92), s);
  vec3 skyHori   = mix(vec3(1.00, 0.58, 0.32), vec3(0.90, 0.80, 0.62), s);
  vec3 sunCol    = mix(vec3(1.00, 0.70, 0.32), vec3(1.00, 0.95, 0.80), s);
  vec3 drySand   = mix(vec3(0.82, 0.64, 0.42), vec3(0.90, 0.76, 0.54), s);
  vec3 wetSand   = mix(vec3(0.36, 0.28, 0.22), vec3(0.40, 0.34, 0.26), s);
  vec3 duneFar   = mix(vec3(0.55, 0.38, 0.26), vec3(0.62, 0.48, 0.32), s);
  vec3 emberCol  = vec3(1.00, 0.55, 0.18);

  float horizon = 0.08;
  float duneLine = -0.02;
  float h = uv.y;

  vec2 mUv = (uMouse - 0.5) * vec2(aspect, 1.0);
  float mouseActive = uMouseActive;

  /* ----- Sky ----- */
  float skyH = sat((h - horizon) / 0.78);
  vec3 sky = mix(skyHori, skyMid, smoothstep(0.0, 0.42, skyH));
  sky = mix(sky, skyZenith, smoothstep(0.28, 1.0, skyH));

  vec2 cUV = vec2(uv.x * 1.35 + t * 0.01, skyH * 2.4);
  float clouds = smoothstep(0.50, 0.80, fbm(cUV * 1.7));
  clouds *= smoothstep(0.0, 0.32, skyH) * 0.22;
  sky = mix(sky, mix(sky, vec3(1.0, 0.93, 0.86), 0.55), clouds);

  vec2 sunPos = vec2(-0.22 + s * 0.35, horizon + 0.32 + s * 0.18);
  float sd = length(uv - sunPos);
  sky += sunCol * exp(-sd * 14.0) * 0.75;
  sky += sunCol * exp(-sd * 4.5) * 0.35;
  sky += sunCol * smoothstep(0.045, 0.0, sd) * 1.85;
  sky += sunCol * exp(-abs(h - sunPos.y) * 18.0) * exp(-abs(uv.x - sunPos.x) * 3.5) * 0.22;

  /* ----- Distant dunes (replaces sea) ----- */
  float farDune = 0.0;
  farDune += 0.045 * sin(uv.x * 2.1 + 0.3);
  farDune += 0.03 * sin(uv.x * 4.4 - 1.0);
  farDune += 0.02 * (fbm(vec2(uv.x * 2.0, 0.4)) - 0.5);
  float duneCrest = duneLine + farDune;
  float midBand = smoothstep(duneCrest - 0.02, duneCrest + 0.01, h) * (1.0 - smoothstep(horizon - 0.01, horizon + 0.004, h));
  vec3 mid = mix(duneFar, skyHori * 0.55, sat((h - duneCrest) / max(0.001, horizon - duneCrest)) * 0.35);

  /* ----- Sand (perspective) ----- */
  float pyS = max(0.018, duneCrest + 0.04 - h);
  float perspS = 1.0 / (pyS + 0.04);
  vec2 sUV = vec2(uv.x * perspS * 0.95, perspS * 0.6);

  float n1 = fbm(sUV * 2.2);
  float n2 = fbm(sUV * 8.0 + 9.0);
  float n3 = noise(sUV * 36.0);
  float n4 = noise(sUV * 85.0 + 4.0);

  vec3 sand = mix(wetSand, drySand, 0.55 + n1 * 0.35);
  sand *= 0.80 + n1 * 0.24 + n2 * 0.12;
  sand *= 0.93 + n3 * 0.12;

  float close = smoothstep(0.0, -0.55, h);
  sand = mix(sand, sand * (0.88 + n4 * 0.24), close * 0.75);

  float ridges = sin(sUV.x * 6.5 + n1 * 2.5) * 0.5 + 0.5;
  sand = mix(sand, sand * 0.9, ridges * 0.12 * close);
  sand *= 0.72 + n2 * 0.2;
  sand += sunCol * 0.08 * close;

  /* Mouse: dune sculpt on sand */
  float sandRegion = smoothstep(0.1, -0.05, h);
  vec2 d = (uv - mUv) * vec2(1.0, 1.25);
  float dist = length(d);
  float radius = 0.2;
  float influence = exp(-dist * dist / (radius * radius)) * mouseActive * sandRegion;
  float bowl = influence * (1.0 - dist / max(radius, 0.001));
  float rim = influence * exp(-pow((dist - radius * 0.42) * 12.0, 2.0));
  vec2 push = normalize(d + vec2(0.0001)) * influence * 0.07;
  vec2 grainUV = sUV + push * perspS * 2.8;
  float movedGrain = noise(grainUV * 70.0);
  float movedGrain2 = noise(grainUV * 120.0 + 2.0);
  float swirl = sin(atan(d.y, d.x) * 5.0 + dist * 36.0 - t * 5.0) * 0.5 + 0.5;
  sand = mix(sand, sand * (0.72 + movedGrain * 0.55), influence * 0.9);
  sand += vec3(0.16, 0.11, 0.05) * influence * movedGrain2;
  sand = mix(sand, wetSand * 0.85, bowl * 0.55);
  sand = mix(sand, drySand * 1.15, rim * 0.75);
  sand = mix(sand, drySand, swirl * influence * 0.28);
  sand *= 1.0 - influence * 0.32 * (1.0 - smoothstep(0.0, radius * 0.55, dist));
  sand += drySand * rim * 0.45;

  /* ----- Compose: sky | distant dunes | sand (no sea) ----- */
  float skyM = smoothstep(horizon - 0.012, horizon + 0.003, h);
  float sandM = 1.0 - smoothstep(duneCrest - 0.025, duneCrest + 0.02, h);
  float midM = sat(1.0 - skyM - sandM);

  vec3 col = sky * skyM + mid * midM + sand * sandM;
  col = mix(col, mix(sand, mid, 0.4), midBand * 0.25);

  /* ----- Floating lantern (replaces sea band) ----- */
  float bob = sin(t * 1.2) * 0.022;
  float sway = sin(t * 0.85) * 0.02;
  vec2 lan = vec2(0.38 + sway, -0.02 + bob);
  vec2 lp = (uv - lan) * vec2(0.95, 0.95);

  /* Wide ember glow across mid band */
  float halo = exp(-dot(lp * vec2(0.85, 1.1), lp * vec2(0.85, 1.1)) * 12.0);
  col += emberCol * halo * 0.7;
  col += vec3(1.0, 0.82, 0.4) * exp(-dot(lp, lp) * 48.0) * 0.55;

  /* Larger paper lantern body */
  float body = sat(1.0 - length(lp * vec2(1.9, 1.15) - vec2(0.0, 0.02)));
  body *= smoothstep(0.32, 0.1, abs(lp.y + 0.01));
  float cap = smoothstep(0.09, 0.0, length(lp * vec2(1.7, 2.8) + vec2(0.0, 0.14)));
  float base = smoothstep(0.08, 0.0, length(lp * vec2(1.85, 2.6) - vec2(0.0, 0.16)));
  float flame = exp(-length(lp * vec2(3.2, 1.6) - vec2(0.0, 0.02)) * 10.0);
  flame *= 0.65 + 0.35 * sin(t * 11.0 + lp.x * 18.0);

  /* Rib lines */
  float ribs = abs(sin(lp.x * 28.0)) * smoothstep(0.28, 0.05, abs(lp.y));
  ribs *= body;

  vec3 lanternCol = mix(vec3(0.28, 0.12, 0.04), vec3(1.0, 0.58, 0.2), body * 0.9);
  lanternCol = mix(lanternCol, vec3(0.85, 0.5, 0.2), sat(cap + base));
  lanternCol = mix(lanternCol, vec3(0.45, 0.2, 0.08), ribs * 0.35);
  lanternCol += vec3(1.0, 0.92, 0.55) * flame * 1.25;

  float lanMask = sat(body * 1.35 + cap + base + flame * 0.85);
  col = mix(col, lanternCol, lanMask * 0.98);
  col += emberCol * flame * 0.45;

  /* Embers rising from lantern */
  float sparks = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 sp = lan + vec2(sin(t * 1.4 + fi * 1.7) * 0.045, 0.08 + fract(t * 0.22 + fi * 0.18) * 0.28);
    sparks += exp(-length(uv - sp) * 75.0) * (1.0 - fract(t * 0.22 + fi * 0.18));
  }
  col += emberCol * sparks * 0.95;

  /* Second softer lantern further right */
  vec2 lan2 = vec2(0.72 + sin(t * 0.7) * 0.015, 0.08 + cos(t * 1.1) * 0.02);
  vec2 lp2 = (uv - lan2) * vec2(1.35, 1.35);
  float body2 = sat(1.0 - length(lp2 * vec2(2.4, 1.5))) * smoothstep(0.22, 0.06, abs(lp2.y));
  float flame2 = exp(-length(lp2 * vec2(5.0, 2.4)) * 16.0) * (0.7 + 0.3 * sin(t * 13.0));
  col += emberCol * exp(-dot(lp2, lp2) * 40.0) * 0.35;
  col = mix(col, mix(vec3(0.4, 0.18, 0.06), vec3(1.0, 0.6, 0.22), 0.7), body2 * 0.75);
  col += vec3(1.0, 0.9, 0.5) * flame2 * 0.55;

  /* Grade */
  col = pow(max(col, vec3(0.0)), vec3(0.94));
  col *= vec3(1.03, 0.99, 0.95);

  float vig = smoothstep(1.4, 0.3, length(uv * vec2(0.7, 1.05)));
  col *= 0.78 + 0.22 * vig;

  /* Left scrim so Meshkat type stays readable */
  float scrim = smoothstep(0.65 * aspect, -0.2 * aspect, uv.x);
  scrim *= smoothstep(0.5, -0.35, h) * 0.5;
  col *= 1.0 - scrim;

  col += (hash(fc + floor(t * 20.0)) - 0.5) * 0.016;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

function compile(gl, type, src) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Beach shader:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export default function HeroWaveCanvas() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
    })
    if (!gl) return undefined

    const vert = compile(gl, gl.VERTEX_SHADER, VS)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FS)
    if (!vert || !frag) return undefined

    const prog = gl.createProgram()
    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog))
      return undefined
    }

    gl.useProgram(prog)
    gl.disable(gl.DEPTH_TEST)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const ap = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(ap)
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0)

    const uR = gl.getUniformLocation(prog, 'uR')
    const uT = gl.getUniformLocation(prog, 'uT')
    const uS = gl.getUniformLocation(prog, 'uS')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const uMouseActive = gl.getUniformLocation(prog, 'uMouseActive')
    const uQ = gl.getUniformLocation(prog, 'uQ')

    const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches
    let quality = mobile ? 0.85 : 1
    const MAX_DPR = mobile ? 1.25 : 1.65

    let raf = 0
    const t0 = performance.now()
    let last = t0
    let mx = 0.5
    let my = 0.22
    let smx = 0.5
    let smy = 0.22
    let mouseActive = 0
    let touching = false
    let moving = false
    let lastMoveAt = 0
    let scrollT = 0
    let scrollS = 0
    let fpsA = 0
    let fpsN = 0
    let lowT = 0

    const updateScroll = () => {
      const hero = wrap.closest('.hero')
      const h = hero ? hero.offsetHeight : window.innerHeight
      scrollT = Math.min(1, Math.max(0, window.scrollY / Math.max(h * 1.4, 1)))
    }

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR) * quality
      const pw = Math.max(1, Math.round(w * dpr))
      const ph = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw
        canvas.height = ph
        gl.viewport(0, 0, pw, ph)
        gl.uniform2f(uR, pw, ph)
      }
    }

    const pointer = (cx, cy, active) => {
      const rect = wrap.getBoundingClientRect()
      if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) {
        if (!touching) moving = false
        return
      }
      mx = (cx - rect.left) / Math.max(rect.width, 1)
      my = 1 - (cy - rect.top) / Math.max(rect.height, 1)
      /* Sand occupies roughly lower half of the hero */
      const overSand = my < 0.58
      if (active && overSand) {
        moving = true
        lastMoveAt = performance.now()
        mouseActive = Math.min(1, mouseActive + 0.55)
      }
    }

    const onMove = (e) => pointer(e.clientX, e.clientY, true)
    const onLeave = () => {
      touching = false
      moving = false
    }
    const onTouchStart = (e) => {
      const touch = e.touches[0]
      if (!touch) return
      touching = true
      pointer(touch.clientX, touch.clientY, true)
    }
    const onTouchMove = (e) => {
      const touch = e.touches[0]
      if (!touch) return
      pointer(touch.clientX, touch.clientY, true)
    }
    const onTouchEnd = () => {
      touching = false
      moving = false
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      fpsA += dt
      fpsN++
      if (fpsA > 0.8) {
        const fps = fpsN / fpsA
        fpsA = 0
        fpsN = 0
        if (fps < 45) {
          lowT += 0.8
          if (lowT > 1.5 && quality > 0.7) {
            quality = Math.max(0.7, +(quality - 0.08).toFixed(2))
            lowT = 0
            resize()
          }
        } else lowT = 0
      }

      scrollS += (scrollT - scrollS) * (1 - Math.exp(-dt * 3.5))
      smx += (mx - smx) * (1 - Math.exp(-dt * 16))
      smy += (my - smy) * (1 - Math.exp(-dt * 16))

      if (now - lastMoveAt > 80) moving = false

      if (touching || moving) {
        mouseActive = Math.min(1, Math.max(mouseActive, 0.85) + dt * 2)
      } else {
        mouseActive = Math.max(0, mouseActive - dt * 1.1)
      }

      gl.uniform1f(uT, (now - t0) / 1000)
      gl.uniform1f(uS, scrollS)
      gl.uniform2f(uMouse, smx, smy)
      gl.uniform1f(uMouseActive, mouseActive)
      gl.uniform1f(uQ, quality)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    resize()
    updateScroll()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('scroll', updateScroll, { passive: true })
    /* Window-level tracking so hero overlays don't block sand hover */
    window.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      gl.deleteProgram(prog)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <div className="hero-wave hero-beach" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} className="hero-beach-canvas" />
      <div className="hero-wave-vig" />
      <div className="hero-beach-scrim" />
    </div>
  )
}
