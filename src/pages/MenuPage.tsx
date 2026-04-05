import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Category { id: string; name: string; description?: string; display_order: number }
interface Item { id: string; category_id: string; name: string; description?: string; price?: number; featured: boolean }

const WhaleTail = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e6b8a" />
        <stop offset="50%" stopColor="#a8d4e0" />
        <stop offset="100%" stopColor="#1e6b8a" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path d="M50,72 C38,66 18,72 8,58 C2,50 6,38 14,34 C22,30 32,38 40,46 C44,50 47,56 50,60"
      fill="url(#g1)" filter="url(#glow)" opacity="0.95" />
    <path d="M50,72 C62,66 82,72 92,58 C98,50 94,38 86,34 C78,30 68,38 60,46 C56,50 53,56 50,60"
      fill="url(#g1)" filter="url(#glow)" opacity="0.95" />
    <path d="M42,68 C45,60 50,58 50,58 C50,58 55,60 58,68 C55,72 50,74 50,74 C50,74 45,72 42,68Z"
      fill="#071020" opacity="0.9" />
    <path d="M26,44 C28,40 34,40 36,44" stroke="rgba(232,244,248,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M64,44 C66,40 72,40 74,44" stroke="rgba(232,244,248,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
)

function Price({ value }: { value?: number }) {
  if (!value) return null
  const str = value % 1 === 0 ? `${value} €` : `${value.toFixed(2)} €`
  return <span style={{ fontFamily: 'var(--font-display)', color: '#c9a96e', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.05em' }}>{str}</span>
}

function MenuCard({ name, desc, price, featured }: { name: string; desc?: string; price?: number; featured?: boolean }) {
  if (featured) {
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: '1rem',
        padding: '1rem', marginBottom: '0.5rem',
        background: 'linear-gradient(135deg,rgba(201,169,110,0.06),rgba(30,107,138,0.06))',
        border: '1px solid rgba(201,169,110,0.15)', borderRadius: '2px'
      }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem', color: '#e8f4f8', display: 'block', marginBottom: '0.2rem' }}>
            {name}
            <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', padding: '0.15rem 0.5rem', border: '1px solid #c9a96e', color: '#c9a96e', borderRadius: '9999px', marginLeft: '0.5rem', verticalAlign: 'middle', opacity: 0.8, textTransform: 'uppercase' }}>firma</span>
          </span>
          {desc && <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', fontWeight: 300 }}>{desc}</span>}
        </div>
        <Price value={price} />
      </div>
    )
  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline', gap: '1rem',
      padding: '0.9rem 0', borderBottom: '1px solid rgba(168,212,224,0.06)', cursor: 'default'
    }}>
      <div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem', color: '#e8f4f8', display: 'block', marginBottom: '0.15rem' }}>{name}</span>
        {desc && <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', fontWeight: 300 }}>{desc}</span>}
      </div>
      <Price value={price} />
    </div>
  )
}

const ICONS = ['◈', '◇', '◆', '◉', '◎']

export default function MenuPage() {
  const particlesRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const el = particlesRef.current
    if (!el) return
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div')
      p.style.cssText = `position:absolute;border-radius:50%;background:#a8d4e0;opacity:0;
        left:${Math.random() * 100}%;
        width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;
        animation:float ${14 + Math.random() * 20}s linear ${-Math.random() * 30}s infinite;`
      el.appendChild(p)
    }
    return () => { el.innerHTML = '' }
  }, [])

  useEffect(() => {
    Promise.all([
      supabase.from('menu_categories').select('id,name,description,display_order').order('display_order'),
      supabase.from('menu_items').select('id,category_id,name,description,price,featured,display_order').order('display_order'),
    ]).then(([{ data: cats }, { data: its }]) => {
      setCategories((cats || []) as Category[])
      setItems((its || []).map((i: any) => ({ ...i, price: i.price != null ? Number(i.price) : undefined })))
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#071020', overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      <div ref={particlesRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* waves */}
      <svg className="animate-wave" style={{ position: 'fixed', bottom: 0, left: 0, width: '200%', height: '9rem', zIndex: 0, opacity: 0.07 }} viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1440,20 1440,80 L1440,180 L0,180 Z" fill="#a8d4e0" />
      </svg>
      <svg className="animate-wave-slow" style={{ position: 'fixed', bottom: 0, left: 0, width: '200%', height: '7rem', zIndex: 0, opacity: 0.04 }} viewBox="0 0 1440 140" preserveAspectRatio="none">
        <path d="M0,60 C200,110 400,10 600,60 C800,110 1000,10 1200,60 L1440,60 L1440,140 L0,140 Z" fill="#1e6b8a" />
      </svg>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '640px', margin: '0 auto', padding: '4rem 2rem 7rem' }}>

        {/* Header */}
        <header className="animate-fade-down" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <WhaleTail className="animate-breathe" style={{ width: '6rem', height: '6rem' } as any} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
            <div style={{ height: '1px', width: '3.5rem', background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.7))' }} />
            <span style={{ fontSize: '0.56rem', letterSpacing: '0.5em', color: '#c9a96e', fontWeight: 300, textTransform: 'uppercase' }}>Est. Bar &amp; Spirits</span>
            <div style={{ height: '1px', width: '3.5rem', background: 'linear-gradient(to left, transparent, rgba(201,169,110,0.7))' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3.25rem,12vw,5.5rem)', fontWeight: 300, letterSpacing: '0.3em', color: '#f7f0e6', textTransform: 'uppercase', lineHeight: 1, margin: '0 0 0.75rem' }}>
            Itsaski
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
            <div style={{ height: '1px', width: '3.5rem', background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.7))' }} />
            <span style={{ fontSize: '0.56rem', letterSpacing: '0.4em', color: '#c9a96e', fontWeight: 300, textTransform: 'uppercase' }}>Donde el océano tiene voz</span>
            <div style={{ height: '1px', width: '3.5rem', background: 'linear-gradient(to left, transparent, rgba(201,169,110,0.7))' }} />
          </div>
          <div style={{ width: '1px', height: '2.5rem', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.6), transparent)', margin: '1.5rem auto 0' }} />
        </header>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <WhaleTail className="animate-breathe" style={{ width: '3rem', height: '3rem', opacity: 0.4 } as any} />
          </div>
        )}

        {!loading && items.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(168,212,224,0.3)', fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 300, padding: '4rem 0' }}>
            El menú se está preparando
          </p>
        )}

        {categories.map((cat, i) => {
          const catItems = items.filter(it => it.category_id === cat.id)
          if (!catItems.length) return null
          return (
            <section key={cat.id} style={{ marginBottom: '4rem' }}>
              {/* section header */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'rgba(168,212,224,0.6)', fontSize: '1.1rem' }}>{ICONS[i % ICONS.length]}</span>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.12em', color: '#dfc08f', textTransform: 'uppercase', margin: 0 }}>
                    {cat.name}
                  </h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(201,169,110,0.4), transparent)' }} />
                </div>
                {cat.description && (
                  <p style={{ fontSize: '0.62rem', letterSpacing: '0.14em', color: 'rgba(168,212,224,0.4)', textTransform: 'uppercase', fontWeight: 300, marginLeft: '2.25rem' }}>
                    {cat.description}
                  </p>
                )}
              </div>
              {catItems.map(item => (
                <MenuCard key={item.id} name={item.name} desc={item.description} price={item.price} featured={item.featured} />
              ))}
            </section>
          )
        })}

        {/* footer */}
        <footer style={{ textAlign: 'center', marginTop: '5rem', paddingTop: '2.5rem', borderTop: '1px solid rgba(168,212,224,0.1)' }}>
          <WhaleTail style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', opacity: 0.3 } as any} />
          <p style={{ fontSize: '0.56rem', letterSpacing: '0.3em', color: 'rgba(168,212,224,0.3)', textTransform: 'uppercase', fontWeight: 300, marginBottom: '0.4rem' }}>
            Itsaski · Bar &amp; Spirits · Todos los precios incluyen IVA
          </p>
          <p style={{ fontSize: '0.56rem', letterSpacing: '0.3em', color: 'rgba(168,212,224,0.2)', textTransform: 'uppercase', fontWeight: 300 }}>
            Infórmenos de sus alergias · Consumo responsable
          </p>
        </footer>
      </div>
    </div>
  )
}
