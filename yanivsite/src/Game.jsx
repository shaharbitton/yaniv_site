import { useEffect, useRef, useState } from 'react'

const W = 900
const H = 480
const GY = 420
const PIVOT = { x: 150, y: GY - 100 }
const LIMIT = 470
const FRONT_WHEEL = { x: 190, y: GY }
const MAX_FALL = 0.45

const OBSTACLES = [
  { x: 270, y: 300, w: 12, h: 120 },
  { x: 318, y: 300, w: 12, h: 120 },
  { x: 270, y: 300, w: 60, h: 14 },
  { x: 350, y: 330, w: 100, h: 90 },
  { x: 340, y: 292, w: 120, h: 38 },
  { x: 474, y: 140, w: 12, h: 280 },
  { x: 300, y: 148, w: 186, h: 8 },
]
const PAD = { x: 500, w: 120 }

const newState = () => ({
  cx: 215,
  hy: 200,
  box: { x: 190, y: GY - 44, w: 50, h: 44 },
  held: false,
  over: false,
  won: false,
  fall: 0,
})

const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

function drawCrate(c, b) {
  c.fillStyle = '#c8924f'
  c.fillRect(b.x, b.y, b.w, b.h)
  c.fillStyle = '#a8733a'
  for (let i = 1; i < 4; i++) c.fillRect(b.x, b.y + (b.h / 4) * i - 1, b.w, 2)
  c.strokeStyle = '#6d4723'
  c.lineWidth = 4
  c.strokeRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4)
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(b.x + 3, b.y + 3)
  c.lineTo(b.x + b.w - 3, b.y + b.h - 3)
  c.moveTo(b.x + b.w - 3, b.y + 3)
  c.lineTo(b.x + 3, b.y + b.h - 3)
  c.stroke()
}

function drawTruck(c, s) {
  c.fillStyle = 'rgba(0,0,0,.25)'
  c.fillRect(20, GY - 2, 190, 6)
  c.fillStyle = '#e65100'
  c.fillRect(20, GY - 62, 180, 14)
  c.fillStyle = '#ffc107'
  c.fillRect(25, GY - 80, 100, 18)
  c.fillStyle = '#d32f2f'
  c.fillRect(25, GY - 62, 160, 6)
  c.fillStyle = '#1e88e5'
  c.beginPath()
  c.moveTo(140, GY - 62)
  c.lineTo(140, GY - 100)
  c.lineTo(175, GY - 100)
  c.lineTo(195, GY - 76)
  c.lineTo(195, GY - 62)
  c.closePath()
  c.fill()
  c.fillStyle = '#b3e5fc'
  c.beginPath()
  c.moveTo(150, GY - 94)
  c.lineTo(172, GY - 94)
  c.lineTo(187, GY - 76)
  c.lineTo(150, GY - 76)
  c.closePath()
  c.fill()
  c.fillStyle = '#fff59d'
  c.fillRect(192, GY - 70, 5, 8)
  for (const wx of [45, 85, 160]) {
    c.fillStyle = '#212121'
    c.beginPath()
    c.arc(wx, GY - 20, 20, 0, Math.PI * 2)
    c.fill()
    c.fillStyle = '#9e9e9e'
    c.beginPath()
    c.arc(wx, GY - 20, 9, 0, Math.PI * 2)
    c.fill()
  }
  c.fillStyle = '#546e7a'
  c.fillRect(100, GY - 82, 20, 22)

  const tipX = s.cx
  const tipY = s.hy
  const ang = Math.atan2(tipY - PIVOT.y, tipX - PIVOT.x)
  const len = Math.hypot(tipX - PIVOT.x, tipY - PIVOT.y)
  c.save()
  c.translate(PIVOT.x, PIVOT.y)
  c.rotate(ang)
  c.fillStyle = '#ffa000'
  c.fillRect(-14, -9, Math.min(len, 120), 18)
  if (len > 100) {
    c.fillStyle = '#ffc107'
    c.fillRect(100, -6, Math.min(len - 100, 120), 12)
  }
  if (len > 215) {
    c.fillStyle = '#ffd54f'
    c.fillRect(215, -4, len - 215, 8)
  }
  c.restore()
  c.strokeStyle = '#455a64'
  c.lineWidth = 6
  c.beginPath()
  c.moveTo(120, GY - 62)
  c.lineTo(PIVOT.x + Math.cos(ang) * 50, PIVOT.y + Math.sin(ang) * 50 + 6)
  c.stroke()
  c.fillStyle = '#37474f'
  c.beginPath()
  c.arc(PIVOT.x, PIVOT.y, 9, 0, Math.PI * 2)
  c.fill()
  c.strokeStyle = '#212121'
  c.lineWidth = 3
  c.beginPath()
  c.moveTo(tipX, tipY)
  c.lineTo(tipX, tipY + 38)
  c.stroke()
  c.fillStyle = '#212121'
  c.beginPath()
  c.arc(tipX, tipY + 40, 5, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = '#ffc107'
  c.fillRect(30, GY - 4, 16, 4)
  c.fillRect(100, GY - 4, 16, 4)
  c.fillStyle = '#546e7a'
  c.fillRect(34, GY - 48, 8, 44)
  c.fillRect(104, GY - 48, 8, 44)
}

function drawScene(c, s) {
  const sky = c.createLinearGradient(0, 0, 0, GY)
  sky.addColorStop(0, '#4fc3f7')
  sky.addColorStop(1, '#e1f5fe')
  c.fillStyle = sky
  c.fillRect(0, 0, W, H)
  c.fillStyle = '#fff176'
  c.beginPath()
  c.arc(820, 70, 36, 0, Math.PI * 2)
  c.fill()
  c.fillStyle = 'rgba(255,255,255,.9)'
  for (const [x, y] of [[120, 60], [480, 90], [700, 40]]) {
    c.beginPath()
    c.arc(x, y, 18, 0, Math.PI * 2)
    c.arc(x + 22, y - 8, 22, 0, Math.PI * 2)
    c.arc(x + 46, y, 18, 0, Math.PI * 2)
    c.fill()
  }
  c.fillStyle = '#a5d6a7'
  c.beginPath()
  c.moveTo(0, GY)
  c.quadraticCurveTo(200, 330, 420, GY)
  c.quadraticCurveTo(650, 340, W, GY)
  c.fill()
  c.fillStyle = '#7cb342'
  c.fillRect(0, GY, W, H - GY)
  c.fillStyle = '#558b2f'
  c.fillRect(0, GY, W, 6)
  c.fillStyle = '#8d6e63'
  c.fillRect(0, GY + 6, W, H - GY)

  c.fillStyle = '#9e9e9e'
  c.fillRect(PAD.x, GY - 10, PAD.w, 16)
  c.fillStyle = '#bdbdbd'
  c.fillRect(PAD.x, GY - 10, PAD.w, 5)
  c.strokeStyle = '#757575'
  c.lineWidth = 1
  c.beginPath()
  c.moveTo(PAD.x + PAD.w / 2, GY - 5)
  c.lineTo(PAD.x + PAD.w / 2, GY + 6)
  c.stroke()
  c.fillStyle = '#333'
  c.font = 'bold 14px Arial'
  c.textAlign = 'center'
  c.fillText('משטח בטון', PAD.x + PAD.w / 2, GY + 28)
  c.textAlign = 'start'

  c.fillStyle = '#90a4ae'
  c.fillRect(270, 300, 12, 120)
  c.fillRect(318, 300, 12, 120)
  c.fillStyle = '#607d8b'
  c.fillRect(270, 300, 60, 14)
  c.strokeStyle = '#607d8b'
  c.lineWidth = 3
  c.beginPath()
  for (let i = 0; i < 4; i++) {
    c.moveTo(282, 330 + i * 22)
    c.lineTo(318, 330 + i * 22)
  }
  c.stroke()
  c.fillStyle = '#d32f2f'
  c.fillRect(270, 296, 60, 4)

  c.fillStyle = '#ffe0b2'
  c.fillRect(350, 330, 100, 90)
  c.fillStyle = '#c62828'
  c.beginPath()
  c.moveTo(338, 332)
  c.lineTo(400, 270)
  c.lineTo(462, 332)
  c.closePath()
  c.fill()
  c.fillStyle = '#6d4c41'
  c.fillRect(430, 275, 12, 30)
  c.fillRect(366, 360, 24, 60)
  c.fillStyle = '#81d4fa'
  c.fillRect(405, 350, 30, 30)
  c.strokeStyle = '#6d4c41'
  c.lineWidth = 2
  c.strokeRect(405, 350, 30, 30)
  c.beginPath()
  c.moveTo(420, 350)
  c.lineTo(420, 380)
  c.moveTo(405, 365)
  c.lineTo(435, 365)
  c.stroke()

  c.fillStyle = '#6d4c41'
  c.fillRect(474, 140, 12, 280)
  c.fillRect(455, 150, 50, 6)
  c.fillStyle = '#eceff1'
  for (const x of [460, 480, 500]) c.fillRect(x - 2, 142, 4, 8)
  c.strokeStyle = '#212121'
  c.lineWidth = 2
  for (const dy of [0, 6]) {
    c.beginPath()
    c.moveTo(480, 148 + dy)
    c.quadraticCurveTo(390, 168 + dy, 300, 148 + dy)
    c.stroke()
  }
  c.fillStyle = '#ffeb3b'
  c.beginPath()
  c.moveTo(380, 130)
  c.lineTo(392, 150)
  c.lineTo(368, 150)
  c.closePath()
  c.fill()
  c.fillStyle = '#000'
  c.font = 'bold 11px Arial'
  c.fillText('⚡', 374, 148)

  c.save()
  if (s.fall) {
    c.translate(FRONT_WHEEL.x, FRONT_WHEEL.y)
    c.rotate(s.fall)
    c.translate(-FRONT_WHEEL.x, -FRONT_WHEEL.y)
  }
  drawTruck(c, s)
  drawCrate(c, s.box)
  c.restore()

  const dist = Math.abs(s.box.x + s.box.w / 2 - PIVOT.x)
  const ratio = s.held ? dist / LIMIT : 0.4 * Math.min(1, Math.abs(s.cx - PIVOT.x) / LIMIT)
  const r = Math.min(1, ratio)
  c.fillStyle = 'rgba(0,0,0,.55)'
  c.fillRect(15, 15, 220, 46)
  c.fillStyle = '#fff'
  c.font = '13px Arial'
  c.fillText('מומנט הנפה', 22, 32)
  c.fillStyle = '#424242'
  c.fillRect(22, 38, 206, 14)
  c.fillStyle = r < 0.7 ? '#4caf50' : r < 0.9 ? '#ffc107' : '#f44336'
  c.fillRect(22, 38, 206 * r, 14)
  if (s.held && r > 0.85 && !s.over) {
    c.fillStyle = '#f44336'
    c.font = 'bold 16px Arial'
    c.fillText('עומס יתר!', 250, 50)
  }
}

export default function Game() {
  const canvasRef = useRef(null)
  const stateRef = useRef(newState())
  const keys = useRef({})
  const [status, setStatus] = useState('')

  const toggle = () => {
    const s = stateRef.current
    if (s.over || s.won) return
    const b = s.box
    if (s.held) s.held = false
    else if (Math.abs(b.x + b.w / 2 - s.cx) < 28 && Math.abs(b.y - (s.hy + 40)) < 22) s.held = true
  }

  const reset = () => {
    stateRef.current = newState()
    setStatus('')
  }

  useEffect(() => {
    const c = canvasRef.current.getContext('2d')
    let raf

    const update = () => {
      const s = stateRef.current
      const k = keys.current
      if (s.over) {
        s.fall = Math.min(MAX_FALL, s.fall + 0.012)
        return
      }
      if (s.won) return
      if (k.ArrowLeft) s.cx -= 3
      if (k.ArrowRight) s.cx += 3
      if (k.ArrowUp) s.hy -= 3
      if (k.ArrowDown) s.hy += 3
      s.cx = Math.max(PIVOT.x + 20, Math.min(W - 20, s.cx))
      s.hy = Math.max(30, Math.min(GY - 44 - 40, s.hy))
      const b = s.box
      if (s.held) {
        b.x = s.cx - b.w / 2
        b.y = s.hy + 40
        if (OBSTACLES.some((o) => hit(b, o))) {
          s.over = true
          s.held = false
          setStatus('fail')
          return
        }
        if (Math.abs(b.x + b.w / 2 - PIVOT.x) > LIMIT) {
          s.over = true
          s.held = false
          setStatus('tip')
          return
        }
      } else if (b.y + b.h < GY) {
        const next = { ...b, y: Math.min(GY - b.h, b.y + 5) }
        if (!OBSTACLES.some((o) => hit(next, o))) b.y = next.y
      }
      if (!s.held && b.y + b.h >= GY - 1 && b.x > PAD.x && b.x + b.w < PAD.x + PAD.w) {
        s.won = true
        setStatus('win')
      }
    }

    const loop = () => {
      update()
      drawScene(c, stateRef.current)
      raf = requestAnimationFrame(loop)
    }
    loop()

    const down = (e) => {
      keys.current[e.key] = true
      if (e.key === ' ') {
        e.preventDefault()
        toggle()
      }
      if (e.key.startsWith('Arrow')) e.preventDefault()
    }
    const up = (e) => (keys.current[e.key] = false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const hold = (k) => ({
    onPointerDown: () => (keys.current[k] = true),
    onPointerUp: () => (keys.current[k] = false),
    onPointerLeave: () => (keys.current[k] = false),
  })

  return (
    <section style={{ textAlign: 'center' }}>
      <h2>משחק המנוף</h2>
      <p>
        חצים - הזזת קצה המנוף | רווח - תפוס/שחרר.
        <br />
        העבירו את הארגז למשטח הבטון בלי לגעת בשער, בבית ובקו החשמל, ובלי להרחיק יותר מדי – המשאית תתהפך!
      </p>
      <canvas ref={canvasRef} width={W} height={H} className="game" />
      <div className={`msg ${status === 'win' ? 'win' : 'fail'}`}>
        {status === 'fail' && 'פסילה! תן למקצוענים לטפל לך בזה – 052-410-2787'}
        {status === 'tip' && 'המומנט גדול מדי – המשאית התהפכה! תן למקצוענים לטפל לך בזה – 052-410-2787'}
        {status === 'win' && 'כל הכבוד! עכשיו תתקשר ליניב לעבודה אמיתית 😉'}
      </div>
      <button className="btn" onClick={reset}>התחל מחדש</button>
      <div>
        <button className="btn" {...hold('ArrowRight')}>◀</button>
        <button className="btn" {...hold('ArrowLeft')}>▶</button>
        <button className="btn" {...hold('ArrowUp')}>▲</button>
        <button className="btn" {...hold('ArrowDown')}>▼</button>
        <button className="btn" onClick={toggle}>תפוס/שחרר</button>
      </div>
    </section>
  )
}
