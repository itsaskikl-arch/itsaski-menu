import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Category { id: string; name_es: string; description_es?: string; display_order: number; is_active: boolean }
interface Dish { id: string; category_id: string; name_es: string; description_es?: string; price?: number; is_available: boolean; is_chef_pick: boolean; display_order: number; note?: string; allergens?: string[] }
interface DishEdit { name_es?: string; description_es?: string; price?: string; category_id?: string; is_chef_pick?: boolean; note?: string; allergens?: string[] }

const ALLERGENS = [
  { id: 'gluten',        label: 'Gluten',        short: 'G'  },
  { id: 'crustaceos',    label: 'Crustáceos',    short: 'CR' },
  { id: 'huevos',        label: 'Huevos',        short: 'H'  },
  { id: 'pescado',       label: 'Pescado',       short: 'P'  },
  { id: 'cacahuetes',    label: 'Cacahuetes',    short: 'CA' },
  { id: 'soja',          label: 'Soja',          short: 'SO' },
  { id: 'leche',         label: 'Leche',         short: 'L'  },
  { id: 'frutos_secos',  label: 'Frutos secos',  short: 'FS' },
  { id: 'apio',          label: 'Apio',          short: 'AP' },
  { id: 'mostaza',       label: 'Mostaza',       short: 'MO' },
  { id: 'sesamo',        label: 'Sésamo',        short: 'SE' },
  { id: 'sulfitos',      label: 'Sulfitos',      short: 'SU' },
  { id: 'altramuces',    label: 'Altramuces',    short: 'AL' },
  { id: 'moluscos',      label: 'Moluscos',      short: 'ML' },
]

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
const inlineInput: React.CSSProperties = { ...input, padding: '0.25rem 0.4rem', fontSize: '0.8rem' }

function AllergenToggle({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
      {ALLERGENS.map(a => {
        const on = selected.includes(a.id)
        return (
          <button key={a.id} type="button" onClick={() => toggle(a.id)} title={a.label} style={{
            padding: '0.15rem 0.4rem', fontSize: '0.55rem', letterSpacing: '0.08em',
            cursor: 'pointer', borderRadius: '2px', fontFamily: 'var(--font-body)',
            border: `1px solid ${on ? '#c9a96e' : 'rgba(168,212,224,0.2)'}`,
            color: on ? '#c9a96e' : 'rgba(168,212,224,0.4)',
            background: on ? 'rgba(201,169,110,0.1)' : 'transparent',
            textTransform: 'uppercase',
          }}>{a.label}</button>
        )
      })}
    </div>
  )
}

function useDragSort<T extends { id: string; display_order: number }>(
  items: T[], setItems: (items: T[]) => void, onSave: (items: T[]) => void
) {
  const dragId = useRef<string | null>(null)
  const dragOver = useRef<string | null>(null)
  const onDragStart = (id: string) => { dragId.current = id }
  const onDragEnter = (id: string) => { dragOver.current = id }
  const onDrop = () => {
    if (!dragId.current || dragId.current === dragOver.current) return
    const sorted = [...items]
    const from = sorted.findIndex(i => i.id === dragId.current)
    const to = sorted.findIndex(i => i.id === dragOver.current)
    const [moved] = sorted.splice(from, 1)
    sorted.splice(to, 0, moved)
    const reordered = sorted.map((item, idx) => ({ ...item, display_order: idx + 1 }))
    setItems(reordered); onSave(reordered)
    dragId.current = null; dragOver.current = null
  }
  return { onDragStart, onDragEnter, onDrop }
}

const emptyDish = { category_id: '', name_es: '', description_es: '', price: '', is_chef_pick: false, note: '', allergens: [] as string[] }

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [activeTab, setActiveTab] = useState<'categories' | 'dishes' | 'settings'>('categories')
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [pwd, setPwd] = useState({ new: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editingDish, setEditingDish] = useState<string | null>(null)
  const [editCatData, setEditCatData] = useState<Partial<Category>>({})
  const [editDishData, setEditDishData] = useState<DishEdit>({})
  const [newCat, setNewCat] = useState({ name_es: '', description_es: '' })
  const [newDish, setNewDish] = useState(emptyDish)
  const [phone, setPhone] = useState('')
  const [phoneSaved, setPhoneSaved] = useState(false)

  const reload = async () => {
    const [{ data: cats }, { data: ds }, { data: sets }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('dishes').select('*').order('display_order'),
      supabase.from('settings').select('key,value'),
    ])
    setCategories((cats || []) as Category[])
    setDishes((ds || []).map((d: any) => ({ ...d, price: d.price != null ? Number(d.price) : undefined, allergens: d.allergens || [] })))
    const ph = (sets || []).find((s: any) => s.key === 'phone')?.value
    if (ph !== undefined) setPhone(ph)
  }

  useEffect(() => { reload() }, [])

  const savePhone = async () => {
    await supabase.from('settings').upsert({ key: 'phone', value: phone })
    setPhoneSaved(true); setTimeout(() => setPhoneSaved(false), 2000)
  }

  const saveCatOrder = async (r: Category[]) => Promise.all(r.map(c => supabase.from('categories').update({ display_order: c.display_order }).eq('id', c.id)))
  const saveDishOrder = async (r: Dish[]) => Promise.all(r.map(d => supabase.from('dishes').update({ display_order: d.display_order }).eq('id', d.id)))
  const catDrag = useDragSort(categories, setCategories, saveCatOrder)
  const dishDrag = useDragSort(dishes, setDishes, saveDishOrder)

  const changePassword = async () => {
    if (pwd.new.length < 6) { setPwdMsg('Mínimo 6 caracteres'); return }
    if (pwd.new !== pwd.confirm) { setPwdMsg('Las contraseñas no coinciden'); return }
    const { error } = await supabase.auth.updateUser({ password: pwd.new })
    if (error) { setPwdMsg(error.message); return }
    setPwdMsg('Contraseña actualizada'); setPwd({ new: '', confirm: '' })
    setTimeout(() => { setShowPwdForm(false); setPwdMsg('') }, 1500)
  }

  const addCategory = async () => {
    if (!newCat.name_es.trim()) return
    const maxOrder = categories.length ? Math.max(...categories.map(c => c.display_order)) : 0
    await supabase.from('categories').insert({ name_es: newCat.name_es, description_es: newCat.description_es || null, display_order: maxOrder + 1, is_active: true })
    setNewCat({ name_es: '', description_es: '' }); reload()
  }

  const saveCat = async (id: string) => {
    await supabase.from('categories').update({ name_es: editCatData.name_es, description_es: editCatData.description_es || null }).eq('id', id)
    setEditingCat(null); reload()
  }

  const deleteCat = async (id: string) => { await supabase.from('categories').delete().eq('id', id); reload() }
  const toggleCatActive = async (cat: Category) => { await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id); reload() }

  const addDish = async () => {
    if (!newDish.name_es.trim() || !newDish.category_id) return
    const catDishes = dishes.filter(d => d.category_id === newDish.category_id)
    const maxOrder = catDishes.length ? Math.max(...catDishes.map(d => d.display_order)) : 0
    await supabase.from('dishes').insert({
      category_id: newDish.category_id, name_es: newDish.name_es,
      description_es: newDish.description_es || null,
      price: newDish.price ? parseFloat(newDish.price) : null,
      display_order: maxOrder + 1, is_chef_pick: newDish.is_chef_pick,
      is_available: true, note: newDish.note || null, allergens: newDish.allergens,
    })
    setNewDish(emptyDish); reload()
  }

  const saveDish = async (id: string) => {
    const d = editDishData
    await supabase.from('dishes').update({
      name_es: d.name_es, description_es: d.description_es || null,
      price: d.price ? parseFloat(d.price) : null,
      category_id: d.category_id, is_chef_pick: d.is_chef_pick,
      note: d.note || null, allergens: d.allergens || [],
    }).eq('id', id)
    setEditingDish(null); reload()
  }

  const deleteDish = async (id: string) => { await supabase.from('dishes').delete().eq('id', id); reload() }
  const toggleDishAvailable = async (dish: Dish) => { await supabase.from('dishes').update({ is_available: !dish.is_available }).eq('id', dish.id); reload() }
  const logout = async () => { await supabase.auth.signOut(); window.location.href = '/' }

  const s: React.CSSProperties = { color: '#e8f4f8', fontFamily: 'var(--font-body)', minHeight: '100vh', background: '#071020', padding: '2rem 1.5rem' }
  const rowBase: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(168,212,224,0.06)' }
  const lbl = { display: 'block', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.5)', textTransform: 'uppercase' as const, marginBottom: '0.3rem' }

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

      {showPwdForm && (
        <div style={{ background: 'rgba(10,24,40,0.9)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Cambiar contraseña</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
            <div><label style={lbl}>Nueva contraseña</label><input style={input} type="password" value={pwd.new} onChange={e => setPwd(p => ({ ...p, new: e.target.value }))} placeholder="Mínimo 6 caracteres" /></div>
            <div><label style={lbl}>Confirmar</label><input style={input} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} placeholder="Repite la contraseña" /></div>
            <button onClick={changePassword} style={btn('#c9a96e')}>Guardar</button>
          </div>
          {pwdMsg && <p style={{ fontSize: '0.7rem', color: pwdMsg === 'Contraseña actualizada' ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)', marginTop: '0.75rem' }}>{pwdMsg}</p>}
        </div>
      )}

      {/* tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {(['categories', 'dishes', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            ...btn(activeTab === tab ? '#c9a96e' : 'rgba(201,169,110,0.3)'),
            background: activeTab === tab ? 'rgba(201,169,110,0.1)' : 'transparent',
          }}>
            {tab === 'categories' ? 'Secciones' : tab === 'dishes' ? 'Platos / Bebidas' : 'Ajustes'}
          </button>
        ))}
      </div>

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ background: 'rgba(10,24,40,0.8)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Nueva sección</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
              <div><label style={lbl}>Nombre *</label><input style={input} value={newCat.name_es} onChange={e => setNewCat(p => ({ ...p, name_es: e.target.value }))} placeholder="Cócteles..." onKeyDown={e => e.key === 'Enter' && addCategory()} /></div>
              <div><label style={lbl}>Descripción</label><input style={input} value={newCat.description_es} onChange={e => setNewCat(p => ({ ...p, description_es: e.target.value }))} placeholder="Opcional..." /></div>
              <button onClick={addCategory} style={btn('#c9a96e')}>Añadir</button>
            </div>
          </div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Arrastra para reordenar</p>
          {categories.map(cat => (
            <div key={cat.id} draggable={editingCat !== cat.id}
              onDragStart={() => catDrag.onDragStart(cat.id)} onDragEnter={() => catDrag.onDragEnter(cat.id)}
              onDragOver={e => e.preventDefault()} onDrop={catDrag.onDrop}
              style={{ ...rowBase, cursor: editingCat === cat.id ? 'default' : 'grab', background: editingCat === cat.id ? 'rgba(30,107,138,0.08)' : 'transparent' }}
            >
              {editingCat === cat.id ? (
                <>
                  <input style={{ ...inlineInput, flex: 1 }} value={editCatData.name_es ?? ''} onChange={e => setEditCatData(p => ({ ...p, name_es: e.target.value }))} autoFocus />
                  <input style={{ ...inlineInput, flex: 1.5 }} value={editCatData.description_es ?? ''} onChange={e => setEditCatData(p => ({ ...p, description_es: e.target.value }))} placeholder="Descripción..." />
                  <button onClick={() => saveCat(cat.id)} style={btn('rgba(74,222,128,0.7)')}>Guardar</button>
                  <button onClick={() => setEditingCat(null)} style={btn('rgba(168,212,224,0.3)')}>Cancelar</button>
                </>
              ) : (
                <>
                  <span style={{ color: 'rgba(168,212,224,0.25)', fontSize: '0.8rem' }}>⠿</span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#e8f4f8' }}>{cat.name_es}</span>
                  {cat.description_es && <span style={{ fontSize: '0.65rem', color: 'rgba(168,212,224,0.4)' }}>{cat.description_es}</span>}
                  <button onClick={() => { setEditingCat(cat.id); setEditCatData({ name_es: cat.name_es, description_es: cat.description_es ?? '' }) }} style={btn('rgba(201,169,110,0.5)')}>Editar</button>
                  <button onClick={() => toggleCatActive(cat)} style={btn(cat.is_active ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.4)')}>{cat.is_active ? 'Visible' : 'Oculta'}</button>
                  <button onClick={() => deleteCat(cat.id)} style={btn('rgba(248,113,113,0.5)')}>×</button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <p style={{ color: 'rgba(168,212,224,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem' }}>Sin secciones aún</p>}
        </div>
      )}

      {/* DISHES */}
      {activeTab === 'dishes' && (
        <div>
          {/* new dish form */}
          <div style={{ background: 'rgba(10,24,40,0.8)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1rem' }}>Nuevo plato / bebida</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.2fr 0.6fr 0.5fr auto', gap: '0.75rem', alignItems: 'end' }}>
              <div>
                <label style={lbl}>Sección *</label>
                <select style={input} value={newDish.category_id} onChange={e => setNewDish(p => ({ ...p, category_id: e.target.value }))}>
                  <option value="">Selecciona...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_es}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Nombre *</label><input style={input} value={newDish.name_es} onChange={e => setNewDish(p => ({ ...p, name_es: e.target.value }))} placeholder="Mojito..." /></div>
              <div><label style={lbl}>Descripción</label><input style={input} value={newDish.description_es} onChange={e => setNewDish(p => ({ ...p, description_es: e.target.value }))} placeholder="Ron, lima..." /></div>
              <div><label style={lbl}>Precio €</label><input style={input} type="number" step="0.5" value={newDish.price} onChange={e => setNewDish(p => ({ ...p, price: e.target.value }))} placeholder="8" /></div>
              <div>
                <label style={lbl}>Firma</label>
                <input type="checkbox" checked={newDish.is_chef_pick} onChange={e => setNewDish(p => ({ ...p, is_chef_pick: e.target.checked }))} style={{ width: '1rem', height: '1rem', accentColor: '#c9a96e' }} />
              </div>
              <button onClick={addDish} style={btn('#c9a96e')}>Añadir</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <div><label style={lbl}>Nota (ej. "Según disponibilidad")</label><input style={input} value={newDish.note} onChange={e => setNewDish(p => ({ ...p, note: e.target.value }))} placeholder="Bajo pedido..." /></div>
              <div>
                <label style={lbl}>Alérgenos</label>
                <AllergenToggle selected={newDish.allergens} onChange={allergens => setNewDish(p => ({ ...p, allergens }))} />
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.58rem', letterSpacing: '0.15em', color: 'rgba(168,212,224,0.3)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Arrastra para reordenar</p>

          {categories.map(cat => {
            const catDishes = dishes.filter(d => d.category_id === cat.id)
            if (!catDishes.length) return null
            return (
              <div key={cat.id} style={{ marginBottom: '1.5rem' }}>
                <p style={{ letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem', fontStyle: 'italic' }}>{cat.name_es}</p>
                {catDishes.map(dish => (
                  <div key={dish.id} draggable={editingDish !== dish.id}
                    onDragStart={() => dishDrag.onDragStart(dish.id)} onDragEnter={() => dishDrag.onDragEnter(dish.id)}
                    onDragOver={e => e.preventDefault()} onDrop={dishDrag.onDrop}
                    style={{ borderBottom: '1px solid rgba(168,212,224,0.06)', cursor: editingDish === dish.id ? 'default' : 'grab', background: editingDish === dish.id ? 'rgba(30,107,138,0.08)' : 'transparent' }}
                  >
                    {editingDish === dish.id ? (
                      <div style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                          <select style={{ ...inlineInput, width: '9rem', flexShrink: 0 }} value={editDishData.category_id ?? dish.category_id} onChange={e => setEditDishData(p => ({ ...p, category_id: e.target.value }))}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name_es}</option>)}
                          </select>
                          <input style={{ ...inlineInput, flex: 1, minWidth: '8rem' }} value={editDishData.name_es ?? ''} onChange={e => setEditDishData(p => ({ ...p, name_es: e.target.value }))} autoFocus placeholder="Nombre" />
                          <input style={{ ...inlineInput, flex: 1.5, minWidth: '8rem' }} value={editDishData.description_es ?? ''} onChange={e => setEditDishData(p => ({ ...p, description_es: e.target.value }))} placeholder="Descripción" />
                          <input style={{ ...inlineInput, width: '5rem', flexShrink: 0 }} type="number" step="0.5" value={editDishData.price ?? ''} onChange={e => setEditDishData(p => ({ ...p, price: e.target.value }))} placeholder="€" />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', color: 'rgba(168,212,224,0.5)', whiteSpace: 'nowrap' }}>
                            <input type="checkbox" checked={!!editDishData.is_chef_pick} onChange={e => setEditDishData(p => ({ ...p, is_chef_pick: e.target.checked }))} style={{ accentColor: '#c9a96e' }} />Firma
                          </label>
                          <button onClick={() => saveDish(dish.id)} style={btn('rgba(74,222,128,0.7)')}>Guardar</button>
                          <button onClick={() => setEditingDish(null)} style={btn('rgba(168,212,224,0.3)')}>Cancelar</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                          <div>
                            <label style={lbl}>Nota</label>
                            <input style={inlineInput} value={editDishData.note ?? ''} onChange={e => setEditDishData(p => ({ ...p, note: e.target.value }))} placeholder="Bajo pedido..." />
                          </div>
                          <div>
                            <label style={lbl}>Alérgenos</label>
                            <AllergenToggle selected={editDishData.allergens ?? []} onChange={allergens => setEditDishData(p => ({ ...p, allergens }))} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ ...rowBase, borderBottom: 'none' }}>
                        <span style={{ color: 'rgba(168,212,224,0.25)', fontSize: '0.8rem' }}>⠿</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#e8f4f8' }}>{dish.name_es}</span>
                          {dish.allergens && dish.allergens.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
                              {dish.allergens.map(id => {
                                const a = ALLERGENS.find(x => x.id === id)
                                return a ? <span key={id} style={{ fontSize: '0.5rem', letterSpacing: '0.05em', border: '1px solid rgba(201,169,110,0.3)', color: 'rgba(201,169,110,0.6)', padding: '0 0.3rem', borderRadius: '2px', textTransform: 'uppercase' }}>{a.short}</span> : null
                              })}
                            </div>
                          )}
                        </div>
                        {dish.description_es && <span style={{ fontSize: '0.65rem', color: 'rgba(168,212,224,0.4)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dish.description_es}</span>}
                        {(dish as any).note && <span style={{ fontSize: '0.6rem', color: 'rgba(201,169,110,0.5)', fontStyle: 'italic', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(dish as any).note}</span>}
                        {dish.price != null && <span style={{ color: '#c9a96e', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{dish.price} €</span>}
                        {dish.is_chef_pick && <span style={{ fontSize: '0.5rem', letterSpacing: '0.1em', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', padding: '0.1rem 0.4rem', borderRadius: '9999px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>firma</span>}
                        <button onClick={() => { setEditingDish(dish.id); setEditDishData({ name_es: dish.name_es, description_es: dish.description_es ?? '', price: dish.price?.toString() ?? '', category_id: dish.category_id, is_chef_pick: dish.is_chef_pick, note: (dish as any).note ?? '', allergens: dish.allergens ?? [] }) }} style={btn('rgba(201,169,110,0.5)')}>Editar</button>
                        <button onClick={() => toggleDishAvailable(dish)} style={btn(dish.is_available ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.4)')}>{dish.is_available ? 'Disponible' : 'No disp.'}</button>
                        <button onClick={() => deleteDish(dish.id)} style={btn('rgba(248,113,113,0.5)')}>×</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
          {dishes.length === 0 && <p style={{ color: 'rgba(168,212,224,0.3)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem' }}>Sin platos aún</p>}
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '480px' }}>
          <div style={{ background: 'rgba(10,24,40,0.8)', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Información del local</p>
            <label style={lbl}>Teléfono</label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input style={{ ...input, flex: 1 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 600 000 000" onKeyDown={e => e.key === 'Enter' && savePhone()} />
              <button onClick={savePhone} style={btn('#c9a96e')}>Guardar</button>
            </div>
            {phoneSaved && <p style={{ fontSize: '0.7rem', color: 'rgba(74,222,128,0.8)', marginTop: '0.5rem' }}>Guardado</p>}
          </div>
        </div>
      )}
    </div>
  )
}
