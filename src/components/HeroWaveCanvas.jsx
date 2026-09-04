import { useEffect, useRef } from 'react'

const VS = `
attribute vec2 a;
void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`

/* Photo-like desert: pale blue sky + beige dunes, sharp horizon, no sea */
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

/* Rolling dune silhouette height along x (matches photo horizon) */
float duneHorizon(float x) {
  float h = 0.02;
  h += 0.11 * sin(x * 1.15 + 0.4);
  h += 0.07 * sin(x * 2.35 - 1.1);
  h += 0.035 * sin(x * 4.1 + 0.7);
  h += 0.04 * (fbm(vec2(x * 1.4, 0.3)) - 0.5);
  return h;
}

/* Soft dune heightfield on sand plane */
float duneHeight(vec2 p) {
  float d = 0.0;
  d += 0.55 * sin(p.x * 1.6 + p.y * 0.35);
  d += 0.35 * sin(p.x * 2.8 - p.y * 0.6 + 1.2);
  d += 0.22 * sin(p.x * 0.9 + p.y * 1.1 - 0.5);
  d += 0.45 * (fbm(p * 1.1) - 0.45);
  return d;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = (fc - 0.5 * uR) / uR.y;
  float aspect = uR.x / uR.y;
  float t = uT;
  float h = uv.y;

  /* Sir’s reference: saturated cobalt / electric azure */
  vec3 skyTop  = vec3(0.08, 0.32, 0.78);
  vec3 skyMid  = vec3(0.12, 0.48, 0.92);
  vec3 skyHori = vec3(0.22, 0.58, 0.96);

  /* Warm light desert beige / tan */
  vec3 sandLit  = vec3(0.91, 0.80, 0.62);
  vec3 sandMid  = vec3(0.84, 0.70, 0.50);
  vec3 sandShade= vec3(0.72, 0.56, 0.38);

  vec2 mUv = (uMouse - 0.5) * vec2(aspect, 1.0);
  float mouseActive = uMouseActive;

  /* Sharp dune crest against sky — ~mid frame like reference */
  float baseH = 0.02;
  float horizon = baseH + duneHorizon(uv.x * 1.05);
  float inSky = smoothstep(horizon - 0.004, horizon + 0.004, h);

  /* ----- Sky ----- */
  float skyH = sat((h - horizon) / 0.85);
  vec3 sky = mix(skyHori, skyMid, smoothstep(0.0, 0.4, skyH));
  sky = mix(sky, skyTop, smoothstep(0.2, 1.0, skyH));
  /* Keep blue rich — no pale wash */
  sky = min(vec3(1.0), sky * vec3(1.02, 1.04, 1.08));

  /* Nearly clear sky like the reference (minimal haze only) */
  vec2 cUV = vec2(uv.x * 0.9 + t * 0.008, skyH * 1.8 + 0.15);
  float haze = smoothstep(0.72, 0.95, fbm(cUV * 2.2)) * smoothstep(0.35, 0.0, skyH) * 0.08;
  sky = mix(sky, skyHori * 1.05, haze);

  /* ----- Sand dunes (fills everything below horizon — no gap / no sea) ----- */
  float py = max(0.02, horizon - h);
  float persp = 1.0 / (py + 0.04);
  vec2 sUV = vec2(uv.x * persp * 0.7, persp * 0.55);

  float dh = duneHeight(sUV);
  float dhR = duneHeight(sUV + vec2(0.04, 0.0));
  float dhU = duneHeight(sUV + vec2(0.0, 0.04));
  vec3 N = normalize(vec3(dh - dhR, 0.35, dh - dhU));
  vec3 L = normalize(vec3(-0.35, 0.85, 0.25));
  float ndl = sat(dot(N, L) * 0.55 + 0.45);

  vec3 sand = mix(sandShade, sandLit, ndl);
  sand = mix(sand, sandMid, 0.25 + 0.2 * fbm(sUV * 2.0));

  /* Wind ripples — dry sand texture, stronger in foreground */
  float close = smoothstep(0.05, -0.7, h);
  float ripples = sin(sUV.x * 28.0 + sUV.y * 6.0 + dh * 4.0) * 0.5 + 0.5;
  ripples *= smoothstep(0.35, 0.75, fbm(sUV * 8.0));
  sand = mix(sand, sand * 0.9 + sandLit * 0.1, ripples * close * 0.35);
  sand += (noise(sUV * 55.0) - 0.5) * 0.04 * close;

  /* Soft ridge highlight on dune crests */
  float ridge = pow(sat(1.0 - abs(dh) * 1.8), 3.0);
  sand = mix(sand, sandLit * 1.05, ridge * 0.2 * (0.4 + close * 0.6));

  /* Keep bright high-key like the photo */
  sand = max(sand, sandMid * 0.92);

  /* Mouse grain on sand */
  float sandRegion = 1.0 - inSky;
  vec2 d = (uv - mUv) * vec2(1.0, 1.2);
  float dist = length(d);
  float radius = 0.15;
  float influence = exp(-dist * dist / (radius * radius)) * mouseActive * sandRegion;
  vec2 push = normalize(d + vec2(0.0001)) * influence * 0.05;
  vec2 grainUV = sUV + push * persp * 2.0;
  float movedGrain = noise(grainUV * 65.0);
  sand = mix(sand, sand * (0.85 + movedGrain * 0.3), influence * 0.75);
  sand += sandLit * influence * noise(grainUV * 110.0) * 0.3;

  vec3 col = mix(sand, sky, inSky);

  /* Crisp dune edge against sky */
  float edge = exp(-abs(h - horizon) * 90.0);
  col = mix(col, mix(sandLit, skyHori, 0.35), edge * 0.15);

  col = pow(max(col, vec3(0.0)), vec3(0.94));

  /* Barely any vignette — keep sky bright */
  float vig = smoothstep(1.6, 0.5, length(uv * vec2(0.7, 1.0)));
  col *= 0.98 + 0.02 * vig;

  /* Soft left darken for text — mainly on sand, not sky */
  float scrim = smoothstep(0.7 * aspect, -0.15 * aspect, uv.x);
  scrim *= smoothstep(0.15, -0.55, h) * 0.28;
  col = mix(col, col * vec3(0.08, 0.09, 0.12), scrim);

  col += (hash(fc + floor(t * 18.0)) - 0.5) * 0.01;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

function compile(gl, type, src) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Desert shader:', gl.getShaderInfoLog(shader))
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
    let fpsA = 0
    let fpsN = 0
    let lowT = 0

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
      const overSand = my < 0.48
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

      smx += (mx - smx) * (1 - Math.exp(-dt * 16))
      smy += (my - smy) * (1 - Math.exp(-dt * 16))

      if (now - lastMoveAt > 80) moving = false
      if (touching || moving) mouseActive = Math.min(1, Math.max(mouseActive, 0.85) + dt * 2)
      else mouseActive = Math.max(0, mouseActive - dt * 1.1)

      gl.uniform1f(uT, (now - t0) / 1000)
      gl.uniform1f(uS, 0.0)
      gl.uniform2f(uMouse, smx, smy)
      gl.uniform1f(uMouseActive, mouseActive)
      gl.uniform1f(uQ, quality)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    window.addEventListener('mousemove', onMove, { passive: true })
    wrap.addEventListener('mouseleave', onLeave)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
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
