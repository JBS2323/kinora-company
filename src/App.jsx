import { useEffect, useRef, useState } from 'react'
import './App.css'

const PLAYLIST = [
  '/audio/winelight.mp3',
]

export default function App() {
  const [lit, setLit] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const matchRef = useRef(null)
  const vinylRef = useRef(null)
  const musicRef = useRef(null)
  const [trackIndex, setTrackIndex] = useState(0)

  const unlockAudio = () => {
    if (audioUnlocked) return
    ;[matchRef, vinylRef, musicRef].forEach((ref) => {
      const el = ref.current
      if (!el) return
      el.muted = true
      el.play().then(() => {
        el.pause()
        el.currentTime = 0
        el.muted = false
      }).catch(() => {})
    })
    setAudioUnlocked(true)
  }

  const fadeAudio = (el, from, to, duration, onDone) => {
    if (!el) return
    const steps = 30
    const stepTime = duration / steps
    let i = 0
    el.volume = from
    const id = setInterval(() => {
      i++
      const v = from + (to - from) * (i / steps)
      el.volume = Math.max(0, Math.min(1, v))
      if (i >= steps) {
        clearInterval(id)
        onDone?.()
      }
    }, stepTime)
  }

  const handleClick = () => {
    if (lit) return
    setLit(true)
    if (matchRef.current) {
      matchRef.current.volume = 1
      matchRef.current.play().catch(() => {})
    }
    setTimeout(() => {
      const v = vinylRef.current
      if (!v) return
      v.volume = 1
      v.loop = true
      v.play().catch(() => {})
    }, 600)
    setTimeout(() => {
      const m = musicRef.current
      if (!m) return
      m.volume = 0
      m.play().catch(() => {})
      fadeAudio(m, 0, 0.35, 3000)
      fadeAudio(vinylRef.current, 1, 0, 3000, () => {
        vinylRef.current?.pause()
      })
    }, 2800)
  }

  useEffect(() => {
    const el = musicRef.current
    if (!el || PLAYLIST.length === 0) return
    const onEnd = () => setTrackIndex((i) => (i + 1) % PLAYLIST.length)
    el.addEventListener('ended', onEnd)
    return () => el.removeEventListener('ended', onEnd)
  }, [])

  return (
    <div className={`stage ${bgLoaded ? 'loaded' : ''}`} onPointerDown={unlockAudio} onKeyDown={unlockAudio}>
      <picture>
        <source media="(max-width: 640px)" srcSet="/KINORA-LANDING-mobile.svg" />
        <img
          className={`bg ${lit ? 'fade-out' : ''}`}
          src="/KINORA-LANDING.svg"
          alt="Kinora"
          onLoad={() => setBgLoaded(true)}
        />
      </picture>
      <picture>
        <source media="(max-width: 640px)" srcSet="/KINORA-LANDING-2-mobile.svg" />
        <img
          className={`bg ${lit ? 'fade-in' : 'hidden'}`}
          src="/KINORA-LANDING-2.svg"
          alt="Kinora — currently gathering"
        />
      </picture>

      <button
        className="logo-hotspot"
        aria-label="Light the candle"
        onClick={handleClick}
      />

      <div className={`links ${lit ? 'visible' : ''}`}>
        <a href="mailto:info@kinoraco.com">REQUEST AN INTRODUCTION</a>
        <span className="sep">·</span>
        <a href="mailto:circle@kinoraco.com">ENTER THE CONVERSATION</a>
      </div>

      <audio ref={matchRef} src="/audio/match-strike.mp3" preload="auto" />
      <audio ref={vinylRef} src="/audio/vinyl-static.mp3" preload="auto" />
      {PLAYLIST.length > 0 && (
        <audio ref={musicRef} src={PLAYLIST[trackIndex]} preload="auto" loop />
      )}
    </div>
  )
}
