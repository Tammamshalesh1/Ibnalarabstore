'use client';
import { useMemo, useState } from 'react';

const products = [
  ['1', 'منتج مميز 1', 'العروض', 120, '🛍️'],
  ['2', 'منتج مميز 2', 'الجديد', 180, '✨'],
  ['3', 'منتج مميز 3', 'الأكثر طلباً', 250, '🎁'],
  ['4', 'منتج مميز 4', 'العروض', 95, '⭐'],
  ['5', 'منتج مميز 5', 'الجديد', 210, '💎'],
  ['6', 'منتج مميز 6', 'الأكثر طلباً', 150, '🔥'],
];

export default function Home() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('الكل');
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', playerId: '' });
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const cats = ['الكل', ...new Set(products.map(p => p[2]))];
  const list = useMemo(() => products.filter(p => (cat === 'الكل' || p[2] === cat) && p[1].includes(q)), [q, cat]);

  const add = (product) => {
    setCart(c => [...c, product]);
    setMessage('تمت إضافة المنتج إلى السلة.');
    setTimeout(() => setMessage(''), 1800);
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!checkout) return;
    setSending(true);
    setMessage('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, playerId: form.playerId, productName: checkout[1], price: checkout[3] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذر إنشاء الطلب');
      setMessage(`تم إنشاء الطلب بنجاح. رقم الطلب: ${data.orderId.slice(0, 8)}`);
      setCart(c => {
        const index = c.findIndex(p => p[0] === checkout[0]);
        return index === -1 ? c : [...c.slice(0, index), ...c.slice(index + 1)];
      });
      setCheckout(null);
      setForm({ name: '', phone: '', playerId: '' });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  };

  return <main>
    <header style={{ padding: '16px 5%', background: '#111827', color: '#fff', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <strong style={{ fontSize: 24 }}>Ibnalarabstore</strong>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن منتج..." style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 10, border: 0 }} />
      <button onClick={() => cart[0] && setCheckout(cart[0])} style={{ border: 0, background: '#fff', color: '#111827', padding: '10px 14px', borderRadius: 10, cursor: cart.length ? 'pointer' : 'default' }}>🛒 {cart.length} {cart.length ? 'إتمام الطلب' : ''}</button>
      <a href="/admin" style={{ color: '#fff' }}>الإدارة</a>
    </header>
    <section style={{ padding: '55px 5%', background: '#1f2937', color: '#fff' }}><h1 style={{ fontSize: 48, margin: '0 0 10px' }}>تسوّق بسهولة</h1><p>منتجات مختارة وخدمة سريعة من متجر ابن العرب.</p></section>
    <section style={{ padding: '30px 5%' }}>
      {message && <div style={{ background: '#ecfdf5', color: '#065f46', padding: 14, borderRadius: 12, marginBottom: 18 }}>{message}</div>}
      <div style={{ display: 'flex', gap: 8, overflow: 'auto', marginBottom: 24 }}>{cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding: '10px 18px', borderRadius: 20, border: '1px solid #ddd', background: cat === c ? '#111827' : '#fff', color: cat === c ? '#fff' : '#111' }}>{c}</button>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 16 }}>{list.map(p => <article key={p[0]} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}><div style={{ fontSize: 64, textAlign: 'center' }}>{p[4]}</div><h3>{p[1]}</h3><small>{p[2]}</small><h3>{p[3]} ل.ت</h3><button onClick={() => add(p)} style={{ width: '100%', padding: 12, border: 0, borderRadius: 10, background: '#111827', color: '#fff' }}>أضف إلى السلة</button></article>)}</div>
    </section>
    <footer style={{ padding: 30, background: '#111827', color: '#fff', textAlign: 'center' }}>© {new Date().getFullYear()} Ibnalarabstore</footer>

    {checkout && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 20 }}>
      <form onSubmit={submitOrder} style={{ width: '100%', maxWidth: 430, background: '#fff', borderRadius: 18, padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>إتمام الطلب</h2>
        <p><b>{checkout[1]}</b> — {checkout[3]} ل.ت</p>
        {['name', 'phone', 'playerId'].map((field) => <input key={field} required value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={field === 'name' ? 'الاسم الكامل' : field === 'phone' ? 'رقم الهاتف' : 'معرف اللاعب'} style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 13, margin: '10px 0', border: '1px solid #d1d5db', borderRadius: 10 }} />)}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><button disabled={sending} type="submit" style={{ flex: 1, padding: 13, border: 0, borderRadius: 10, background: '#111827', color: '#fff' }}>{sending ? 'جارٍ الإرسال...' : 'تأكيد الطلب'}</button><button type="button" onClick={() => setCheckout(null)} style={{ padding: 13, border: '1px solid #ddd', borderRadius: 10, background: '#fff' }}>إلغاء</button></div>
      </form>
    </div>}
  </main>;
}
