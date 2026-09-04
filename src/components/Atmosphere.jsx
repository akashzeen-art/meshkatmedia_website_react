import { useEffect, useRef } from 'react'

export default function Atmosphere() {
  const glowRef = useRef(null)
  const dotRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const glow = useRef({ x: 0, y: 0 })
  const raf = useRef(0)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches
    if (!finePointer) return undefined

    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`
        dotRef.current.style.top = `${e.clientY}px`
      }
      document.body.classList.add('cursor-active')
    }

    const onLeave = () => {
      document.body.classList.remove('cursor-active')
    }

    const animate = () => {
      glow.current.x += (mouse.current.x - glow.current.x) * 0.06
      glow.current.y += (mouse.current.y - glow.current.y) * 0.06
      if (glowRef.current) {
        glowRef.current.style.left = `${glow.current.x}px`
        glowRef.current.style.top = `${glow.current.y}px`
      }
      raf.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    raf.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
      document.body.classList.remove('cursor-active')
    }
  }, [])

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
    </>
  )
}
