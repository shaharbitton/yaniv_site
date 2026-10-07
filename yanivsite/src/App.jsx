import { useEffect, useState } from 'react'
import Game from './Game.jsx'

const PHONE = '0524102787'
const PHONE_DISPLAY = '052-410-2787'

const PAGES = [
  ['home', 'בית'],
  ['gallery', 'גלריה'],
  ['game', 'משחק'],
  ['contact', 'צור קשר'],
]

const getPage = () => {
  const h = window.location.hash.slice(1)
  return PAGES.some(([id]) => id === h) ? h : 'home'
}

function Home() {
  return (
    <>
      <div className="hero">
        <div className="hero-ph">מקום לתמונה (1600×600)</div>
        <h1>מנופי עפולה</h1>
        <p>שירותי משאית מנוף מקצועיים</p>
        <a className="btn" href={`tel:${PHONE}`}>התקשרו ליניב: {PHONE_DISPLAY}</a>
        <a className="btn" href="#contact">השאירו פרטים</a>
      </div>
      <section>
        <h2>למה אנחנו?</h2>
        <div className="cards">
          <div className="card"><h3>ניסיון</h3><p>שנים של עבודה בהרמה והובלה באזור הצפון.</p></div>
          <div className="card"><h3>בטיחות</h3><p>עבודה מקצועית לפי כל התקנים.</p></div>
          <div className="card"><h3>זמינות</h3><p>הגעה מהירה לכל מקום.</p></div>
          <div className="card"><h3>מחיר הוגן</h3><p>הצעת מחיר מהירה וללא הפתעות.</p></div>
        </div>
      </section>
      <section>
        <h2>רוצים לנסות?</h2>
        <p>חושבים שזה קל? נסו להעביר מטען עם המנוף במשחק שלנו.</p>
        <a className="btn" href="#game">למשחק</a>
      </section>
    </>
  )
}

function Gallery() {
  return (
    <section>
      <h2>העבודות שלנו</h2>
      <p>להוספת תמונה: שימו קובץ ב-src/assets או public והחליפו את ה-div ב-img.</p>
      <div className="gallery">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div className="ph" key={n}>תמונה {n}</div>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  const [f, setF] = useState({ name: '', phone: '', text: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    const t = `שלום יניב, אני ${f.name}, טלפון ${f.phone}. ${f.text}`
    window.location.href = `https://wa.me/972524102787?text=${encodeURIComponent(t)}`
  }
  return (
    <section>
      <h2>צור קשר</h2>
      <p>יניב – <a href={`tel:${PHONE}`}>{PHONE_DISPLAY}</a></p>
      <form onSubmit={submit}>
        <input placeholder="שם מלא" required value={f.name} onChange={set('name')} />
        <input type="tel" placeholder="טלפון" required value={f.phone} onChange={set('phone')} />
        <textarea rows="4" placeholder="מה צריך להרים?" value={f.text} onChange={set('text')} />
        <button className="btn" type="submit">שלח בוואטסאפ</button>
      </form>
    </section>
  )
}

export default function App() {
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    const onHash = () => setPage(getPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <header>
        <a className="logo" href="#home">מנופי עפולה</a>
        <nav>
          {PAGES.map(([id, label]) => (
            <a key={id} href={`#${id}`}>{label}</a>
          ))}
        </nav>
      </header>
      {page === 'home' && <Home />}
      {page === 'gallery' && <Gallery />}
      {page === 'game' && <Game />}
      {page === 'contact' && <Contact />}
      <footer>
        <div>מנופי עפולה – יניב | {PHONE_DISPLAY}</div>
              <div>נבנה על ידי:
                  <a href="https://www.mop.co.il" target="_blank" style={{ color: 'lightgrey' }} rel="noreferrer">© 2026 mop - כל הזכויות שמורות</a>
                  <img src="https://www.mop.co.il/assets/logo-CPgnTvj6.png" alt="mop" width="150" height="50" />
              </div>
              
      </footer>
      <a className="call" href={`tel:${PHONE}`}>📞 התקשר עכשיו</a>
    </>
  )
}
