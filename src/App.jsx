import { useEffect, useRef, useState } from 'react'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import MusicOffIcon from '@mui/icons-material/MusicOff'
import './App.css'

const PLAYLIST = [
  '/audio/winelight.mp3',
]

export default function App() {
  const [lit, setLit] = useState(false)
  const [bgLoaded, setBgLoaded] = useState(false)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const musicVolumeRef = useRef(0.18)
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
      fadeAudio(m, 0, 0.18, 3000, () => {
        musicVolumeRef.current = 0.18
        setMusicPlaying(true)
      })
      fadeAudio(vinylRef.current, 1, 0, 3000, () => {
        vinylRef.current?.pause()
      })
    }, 2800)
  }

  const toggleMute = () => {
    const m = musicRef.current
    if (!m) return
    if (muted) {
      m.volume = musicVolumeRef.current
      setMuted(false)
    } else {
      m.volume = 0
      setMuted(true)
    }
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
      <img
        className={`bg ${lit ? 'fade-out' : ''}`}
        src="/KINORA-LANDING-BG-1.svg"
        alt=""
        onLoad={() => setBgLoaded(true)}
      />
      <img
        className={`bg ${lit ? 'fade-in' : 'hidden'}`}
        src="/KINORA-LANDING-2-BG.svg"
        alt=""
      />

      <div className="center-col">
        <div className={`coords ${lit ? 'visible' : ''}`}>
          <span className="coord-location">43.6548° N, 79.3883° W</span>
          <span className="coord-sep"> | </span>
          <span className="coord-status">CURRENTLY GATHERING</span>
        </div>

        <div className="logo-wrap">
          <img src="/kinora-favicon.png" className="logo-img" alt="Kinora" />
          <button
            className="logo-hotspot"
            aria-label="Light the candle"
            onClick={handleClick}
          />
        </div>

        <div className={`links ${lit ? 'visible' : ''}`}>
          <a href="mailto:info@kinoraco.com">REQUEST AN INTRODUCTION</a>
          <span className="sep">·</span>
          <a href="mailto:circle@kinoraco.com">ENTER THE CONVERSATION</a>
        </div>
      </div>

      <div className={`bottom-bar ${bgLoaded ? 'visible' : ''}`}>
        <div className="ticker-track">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="bar-text" aria-hidden={i > 0 ? 'true' : undefined}>
              KINORA &amp; COMPANY&nbsp;&nbsp;|&nbsp;&nbsp;TORONTO, ONTARIO, CANADA&nbsp;&nbsp;|&nbsp;&nbsp;ENERGY AROUND THE TABLE&nbsp;&nbsp;|&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {musicPlaying && (
        <button
          className={`mute-btn ${muted ? 'muted' : ''}`}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          onClick={toggleMute}
        >
          {muted ? <MusicOffIcon sx={{ fontSize: '1.4rem' }} /> : <MusicNoteIcon sx={{ fontSize: '1.4rem' }} />}
        </button>
      )}

      <audio ref={matchRef} src="/audio/match-strike.mp3" preload="auto" />
      <audio ref={vinylRef} src="/audio/vinyl-static.mp3" preload="auto" />
      {PLAYLIST.length > 0 && (
        <audio ref={musicRef} src={PLAYLIST[trackIndex]} preload="auto" loop />
      )}
    </div>
  )
}
