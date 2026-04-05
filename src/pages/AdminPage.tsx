import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Category { id: string; name: string; description?: string; display_order: number; visible: boolean }
interface Item { id: string; category_id: string; name: string; description?: string; price?: number; is_available: boolean; featured: boolean; display_order: number }

const btn = (color: string) => ({
  padding: '0.3rem 0.75rem', fontSize: '0.65rem', letterSpacing: '0.1em',
  textTransform: 'uppercase' as const, cursor: 'pointer', borderRadius: '2px',
  fontFamily: 'var(--font-body)', border: `1px solid ${color}`, color, background: 'transparent',
})
const input = {
  padding: '0.45rem 0.6rem', background: 'rgba(30,107,138,0.1)',
  border: '1px solid rgba(30,107,138,0.3)', borderRadius: '2px',
  color: '#e8f4f8', fontSize: '0.82rem', fontFamily: 'var(--font-body)',
  outline: 'none', width: '100%',
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories')
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [pwd, setPwd] = useState({ new: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')

  const changePassword = async () => {
    if (pwd.new.length < 6) { setPwdMsg('Mínimo 6 caracteres'); return }
    if (pwd.new !== pwd.confirm) { setPwdMsg('Las contraseñas no coinciden'); return }
    const { error } = await supabase.auth.updateUser({ password: pwd.new })
    if (error) { setPwdMsg(error.message); return }
    setPwdMsg('Contraseña actualizada')
    setPwd({ new: '', confirm: '' })
    setTimeout(() => { setShowPwdForm(false); setPwdMsg('') }, 1500)
  }

  // new category form
  const [newCat, setNewCat] = useState({ name: '', description: '', display_order: 0 })
  // new item form
  const [newItem, setNewItem] = useState({ category_id: '', name: '', description: '', price: '', display_order: 0, featured: false })

  const reload = async () => {
    const [{ data: cats }, { data: its }] = await Promise.all([
      supabase.from('menu_categories').select('*').order('display_order'),
      supabase.from('menu_items').select('*').order('display_order'),
    ])
    setCategories((cats || []) as Category[])
    setItems((its || []) as Item[])
  }

  useEffect(() => { reload() }, [])

  const addCategory = async () => {
    if (!newCat.name.trim()) return
    await supabase.from('menu_categories').insert({ ...newCat })
    setNewCat({ name: '', description: '', display_order: 0 })
    reload()
  }

  const deleteCategory = async (id: string) => {
    await supabase.from('menu_categories').delete().eq('id', id)
    reload()
  }

  const toggleCatVisible = async (cat: Category) => {
    await supabase.from('menu_categories').update({ visible: !cat.visible }).eq('id', cat.id)
    reload()
  }

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.category_id) return
    await supabase.from('menu_items').insert({
      category_id: newItem.category_id,
      name: newItem.name,
      description: newItem.description || null,
      price: newItem.price ? parseFloat(newItem.price) : null,
      display_order: newItem.display_order,
      featured: newItem.featured,
      is_available: true,
    })
    setNewItem({ category_id: '', name: '', description: '', price: '', display_order: 0, featured: false })
    reload()
  }

  const deleteItem = async (id: string) => {
    await supabase.from('menu_items').delete().eq('id', id)
    reload()
  }

  const toggleItemAvailable = async (item: Item) => {
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    reload()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const s = { color: '#e8f4f8', fontFamily: 'var(--font-body)', minHeight: '100vh', background: '#071020', padding: '2rem 1.5rem' }

  return (
    <div style={s}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(168,212,224,0.1)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, letterSpacing: '0.3em', color: '#f7f0e6', margin: 0, textTransform: 'uppercase' }}>Itsaski</h1>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', margin: '0.25rem 0 0' }}>Administración del menú</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/" target="_blank" style={{ ...btn('rgba(168,212,224,0.5)'), textDecoration: 'none' }}>Ver menú</a>
          <button onClick={() => setShowPwdForm(v => !v)} style={btn('rgba(168,212,224,0.4)')}>Contraseña</button>
          <button onClick={logout} style={btn('rgba(248,113,113,0.5)')}>Salir</button>
        </div>
      </div>

      {/* change password */}
      {showPwdForm && (
        <div style={{ background: 'rgba(10,24,40,0.9)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Cambiar contraseña</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Nueva contraseña</label>
              <input style={input} type="password" value={pwd.new} onChange={e => setPwd(p => ({ ...p, new: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Confirmar</label>
              <input style={input} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="Repite la contraseña" />
            </div>
            <button onClick={changePassword} style={btn('#c9a96e')}>Guardar</button>
          </div>
          {pwdMsg && <p style={{ fontSize: '0.7rem', color: pwdMsg === 'Contraseña actualizada' ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)', marginTop: '0.75rem' }}>{pwdMsg}</p>}
        </div>
      )}

      {/* tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['categories', 'items'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...btn(activeTab === tab ? '#c9a96e' : 'rgba(201,169,110,0.3)'),
            background: activeTab === tab ? 'rgba(201,169,110,0.1)' : 'transparent',
          }}>
            {tab === 'categories' ? 'Secciones' : 'Platos / Bebidas'}
          </button>
        ))}
      </div>

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          {/* add form */}
          <div style={{ background: 'rgba(10,24,40,0.8)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Nueva sección</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Nombre *</label>
                <input style={input} value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} placeholder="Cócteles..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Descripción</label>
                <input style={input} value={newCat.description} onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} placeholder="Opcional..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Orden</label>
                <input style={{ ...input, width: '4rem' }} type="number" value={newCat.display_order} onChange={e => setNewCat(p => ({ ...p, display_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <button onClick={addCategory} style={btn('#c9a96e')}>Añadir</button>
            </div>
          </div>

          {/* list */}
          {categories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(168,212,224,0.06)' }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8f4f8' }}>{cat.name}</span>
              {cat.description && <span style={{ fontSize: '0.65rem', color: 'rgba(168,212,224,0.4)' }}>{cat.description}</span>}
              <span style={{ fontSize: '0.65rem', color: 'rgba(168,212,224,0.3)', width: '2rem', textAlign: 'center' }}>#{cat.display_order}</span>
              <button onClick={() => toggleCatVisible(cat)} style={btn(cat.visible ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.4)')}>
                {cat.visible ? 'Visible' : 'Oculta'}
              </button>
              <button onClick={() => deleteCategory(cat.id)} style={btn('rgba(248,113,113,0.5)')}>×</button>
            </div>
          ))}
          {categories.length === 0 && <p style={{ color: 'rgba(168,212,224,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem' }}>Sin secciones aún</p>}
        </div>
      )}

      {/* ITEMS */}
      {activeTab === 'items' && (
        <div>
          {/* add form */}
          <div style={{ background: 'rgba(10,24,40,0.8)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Nuevo plato / bebida</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.6fr 0.5fr auto', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Sección *</label>
                <select style={{ ...input }} value={newItem.category_id} onChange={e => setNewItem(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">Selecciona...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Nombre *</label>
                <input style={input} value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="Mojito..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Descripción</label>
                <input style={input} value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="Ron, lima..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Precio €</label>
                <input style={input} type="number" step="0.5" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} placeholder="8" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Firma</label>
                <input type="checkbox" checked={newItem.featured} onChange={e => setNewItem(p => ({ ...p, featured: e.target.checked }))} style={{ width: '1rem', height: '1rem', accentColor: '#c9a96e' }} />
              </div>
              <button onClick={addItem} style={btn('#c9a96e')}>Añadir</button>
            </div>
          </div>

          {/* list grouped by category */}
          {categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id)
            if (!catItems.length) return null
            return (
              <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
                <p style={{ letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic' }}>{cat.name}</p>
                {catItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(168,212,224,0.06)' }}>
                    <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8f4f8' }}>{item.name}</span>
                    {item.description && <span style={{ fontSize: '0.65rem', color: 'rgba(168,212,224,0.4)' }}>{item.description}</span>}
                    {item.price != null && <span style={{ color: '#c9a96e', fontSize: '0.85rem' }}>{item.price} €</span>}
                    {item.featured && <span style={{ fontSize: '0.55rem', letterSpacing: '0.1em', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', padding: '0.1rem 0.4rem', borderRadius: '9999px', textTransform: 'uppercase' }}>firma</span>}
                    <button onClick={() => toggleItemAvailable(item)} style={btn(item.is_available ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.4)')}>
                      {item.is_available ? 'Disponible' : 'No disp.'}
                    </button>
                    <button onClick={() => deleteItem(item.id)} style={btn('rgba(248,113,113,0.5)')}>×</button>
                  </div>
                ))}
              </div>
            )
          })}
          {items.length === 0 && <p style={{ color: 'rgba(168,212,224,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem' }}>Sin platos aún</p>}
        </div>
      )}
    </div>
  )
}
