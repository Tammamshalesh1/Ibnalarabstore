import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

function money(value) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(value) + ' ل.ت';
}

export default async function AdminPage() {
  let stats = { orders: 0, pending: 0, success: 0, failed: 0, customers: 0, revenue: 0 };
  let latest = [];
  let dbError = '';

  try {
    const [orders, pending, success, failed, customers, revenue, latestOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'SUCCESS' } }),
      prisma.order.count({ where: { status: 'FAILED' } }),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { price: true }, where: { status: 'SUCCESS' } }),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: true } }),
    ]);
    stats = { orders, pending, success, failed, customers, revenue: revenue._sum.price || 0 };
    latest = latestOrders;
  } catch (error) {
    console.error('ADMIN_DB_ERROR', error);
    dbError = 'تعذر الاتصال بقاعدة البيانات. تأكد من ضبط DATABASE_URL وتشغيل قاعدة PostgreSQL.';
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Arial,sans-serif' }}>
      <header style={{ background: '#111827', color: '#fff', padding: '22px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div><h1 style={{ margin: 0 }}>لوحة تحكم ابن العرب</h1><small>إدارة الطلبات والمتجر</small></div>
        <a href="/" style={{ color: '#fff' }}>العودة للمتجر</a>
      </header>
      <section style={{ padding: '28px 5%', maxWidth: 1200, margin: 'auto' }}>
        {dbError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 16, borderRadius: 12, marginBottom: 20 }}>{dbError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
          {[['الطلبات', stats.orders], ['معلقة', stats.pending], ['ناجحة', stats.success], ['فاشلة', stats.failed], ['العملاء', stats.customers], ['الإيرادات', money(stats.revenue)]].map(([label, value]) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 }}><small>{label}</small><div style={{ fontSize: 25, fontWeight: 700, marginTop: 8 }}>{value}</div></div>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, marginTop: 24, overflowX: 'auto' }}>
          <h2 style={{ padding: '18px 20px', margin: 0 }}>آخر الطلبات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead><tr style={{ background: '#f1f5f9' }}>{['الطلب','العميل','المنتج','معرف اللاعب','السعر','الحالة','التاريخ'].map(x => <th key={x} style={{ padding: 12, textAlign: 'right' }}>{x}</th>)}</tr></thead>
            <tbody>{latest.map(order => <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
              <td style={{ padding: 12, fontFamily: 'monospace' }}>{order.id.slice(0, 8)}</td><td style={{ padding: 12 }}>{order.user.name}</td><td style={{ padding: 12 }}>{order.productName}</td><td style={{ padding: 12 }}>{order.playerId}</td><td style={{ padding: 12 }}>{money(order.price)}</td><td style={{ padding: 12 }}>{order.status}</td><td style={{ padding: 12 }}>{new Date(order.createdAt).toLocaleString('ar-SA')}</td>
            </tr>)}{latest.length === 0 && <tr><td colSpan="7" style={{ padding: 25, textAlign: 'center' }}>لا توجد طلبات بعد.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
