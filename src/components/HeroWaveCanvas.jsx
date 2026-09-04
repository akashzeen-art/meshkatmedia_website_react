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
  vec3 seaDeep   = mix(vec3(0.06, 0.20, 0.36), vec3(0.04, 0.34, 0.55), s);
  vec3 seaNear   = mix(vec3(0.16, 0.48, 0.54), vec3(0.10, 0.58, 0.64), s);
  vec3 drySand   = mix(vec3(0.82, 0.64, 0.42), vec3(0.90, 0.76, 0.54), s);
  vec3 wetSand   = mix(vec3(0.36, 0.28, 0.22), vec3(0.40, 0.34, 0.26), s);
  vec3 foamCol   = vec3(0.94, 0.96, 0.97);

  float horizon = 0.10;
  float shore   = -0.015;
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

  vec2 sunPos = vec2(-0.38 + s * 0.5, horizon + 0.10 + s * 0.24);
  float sd = length(uv - sunPos);
  sky += sunCol * exp(-sd * 16.0) * 0.6;
  sky += sunCol * exp(-sd * 5.5) * 0.25;
  sky += sunCol * smoothstep(0.032, 0.0, sd) * 1.5;
  sky += sunCol * exp(-abs(h - horizon) * 26.0) * 0.2;

  /* ----- Ocean (perspective) ----- */
  float pyO = max(0.0015, horizon - h);
  float perspO = 1.0 / (pyO + 0.07);
  vec2 wUV = vec2(uv.x * perspO * 0.5, perspO * 0.32 + t * 0.07);

  float swell = sin(wUV.x * 3.2 + t * 0.65) * 0.5 + 0.5;
  swell *= sin(wUV.y * 2.0 - t * 0.5) * 0.5 + 0.5;
  float chop = noise(wUV * 5.5 + t * 0.18);
  float wave = mix(swell, chop, 0.32);

  float depthGrad = sat((horizon - h) / max(0.001, horizon - shore));
  vec3 water = mix(seaDeep, seaNear, pow(1.0 - depthGrad, 0.85));
  water = mix(water, water * 1.14, wave * 0.2);
  water = mix(water, skyHori * 0.9, smoothstep(shore, horizon, h) * 0.42);
  water += sunCol * pow(noise(wUV * 12.0 + vec2(t * 0.35, 0.0)), 9.0) * 0.11 * (1.0 - depthGrad);

  float lines = sin(wUV.y * 16.0 - t * 1.5 + sin(wUV.x * 3.5) * 2.0);
  water = mix(water, foamCol, smoothstep(0.82, 1.0, lines) * (1.0 - depthGrad) * 0.16);

  /* Sun path reflection on water */
  float path = exp(-abs(uv.x - sunPos.x) * 7.0) * smoothstep(shore - 0.05, horizon, h);
  water += sunCol * path * 0.14 * (1.0 - depthGrad * 0.5);

  /* ----- Sand (perspective) ----- */
  float pyS = max(0.018, shore + 0.04 - h);
  float perspS = 1.0 / (pyS + 0.04);
  vec2 sUV = vec2(uv.x * perspS * 0.95, perspS * 0.6);

  float n1 = fbm(sUV * 2.2);
  float n2 = fbm(sUV * 8.0 + 9.0);
  float n3 = noise(sUV * 36.0);
  float n4 = noise(sUV * 85.0 + 4.0);

  float wet = sat(smoothstep(-0.32, 0.0, h - shore) + (n1 - 0.5) * 0.1);
  vec3 sand = mix(drySand, wetSand, wet);
  sand *= 0.80 + n1 * 0.24 + n2 * 0.12;
  sand *= 0.93 + n3 * 0.12;

  float close = smoothstep(0.0, -0.55, h);
  sand = mix(sand, sand * (0.88 + n4 * 0.24), close * 0.75);

  float ridges = sin(sUV.x * 6.5 + n1 * 2.5) * 0.5 + 0.5;
  sand = mix(sand, sand * 0.9, ridges * 0.12 * (1.0 - wet) * close);

  sand *= 0.62 + n2 * 0.18 + wet * 0.06;
  sand += sunCol * (1.0 - wet) * 0.07 * close;
  sand += skyHori * wet * 0.12;
  sand += sunCol * pow(noise(sUV * 18.0 + t * 0.08), 7.0) * wet * 0.1;

  /* Shore foam */
  float shoreY = shore + sin(uv.x * 5.5 + t * 0.85) * 0.014
               + sin(uv.x * 13.0 - t * 1.3) * 0.006;
  float foam = exp(-abs(h - shoreY) * 50.0);
  float foamPulse = 0.5 + 0.5 * sin(uv.x * 9.0 - t * 2.0 + n1 * 3.5);
  sand = mix(sand, foamCol, foam * foamPulse * 0.7);

  float wash = exp(-abs(h - shoreY + 0.028) * 36.0);
  wash *= 0.3 + 0.25 * sin(t * 1.4 + uv.x * 4.5);
  sand = mix(sand, mix(wetSand, foamCol, 0.35), wash * 0.45);

  /* Mouse: sand grains push away + soft crater (visible motion) */
  float sandRegion = smoothstep(0.08, -0.05, h);
  vec2 d = (uv - mUv) * vec2(1.0, 1.25);
  float dist = length(d);
  float radius = 0.16;
  float influence = exp(-dist * dist / (radius * radius)) * mouseActive * sandRegion;
  vec2 push = normalize(d + vec2(0.0001)) * influence * 0.055;
  vec2 grainUV = sUV + push * perspS * 2.5;
  float movedGrain = noise(grainUV * 70.0);
  float movedGrain2 = noise(grainUV * 120.0 + 2.0);
  sand = mix(sand, sand * (0.75 + movedGrain * 0.5), influence * 0.85);
  sand += vec3(0.14, 0.10, 0.05) * influence * movedGrain2;
  sand *= 1.0 - influence * 0.35 * (1.0 - smoothstep(0.0, radius * 0.55, dist));
  float rim = influence * exp(-pow((dist - radius * 0.4) * 14.0, 2.0));
  sand += drySand * rim * 0.55;
  sand += vec3(0.2, 0.14, 0.06) * influence * (1.0 - wet) * 0.4;

  /* ----- Compose bands ----- */
  float skyM = smoothstep(horizon - 0.012, horizon + 0.003, h);
  float sandM = 1.0 - smoothstep(shore - 0.03, shore + 0.025, h);
  float waterM = sat(1.0 - skyM - sandM);

  /* Soft shoreline merge */
  float blend = smoothstep(shore - 0.05, shore + 0.02, h) * smoothstep(shore + 0.04, shore - 0.02, h);
  vec3 shoreMix = mix(sand, water, 0.55);

  vec3 col = sky * skyM + water * waterM + sand * sandM;
  col = mix(col, shoreMix, blend * 0.5);

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
