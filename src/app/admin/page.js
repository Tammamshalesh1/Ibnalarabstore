import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, pendingDeposits: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // معلومات المالك المقيدة برمجياً بناءً على طلبك
  const ownerEmail = "tammamshalesh1@gmail.com";
  const ownerPhone = "+905366303897";

  useEffect(() => {
    // محاكاة التحقق من الجلسة والمصادقة (مثال واقعي للإنتاج)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (currentUser.email !== ownerEmail || currentUser.role !== 'ADMIN') {
      alert("غير مسموح لك بالدخول! هذه اللوحة لمالك الموقع فقط.");
      router.push('/');
      return;
    }

    // جلب البيانات الحقيقية من واجهة الـ API الخلفية للموقع
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-10 text-white">جاري تحميل لوحة التحكم للمالك...</div>;

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white dir-rtl" dir="rtl">
      <header className="border-b border-slate-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-sky-400">لوحة تحكم مالك موقع ibnalarabstore</h1>
        <p className="text-sm text-slate-400">المالك: تمام شاليش | {ownerPhone}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm">إجمالي المستخدمين</h3>
          <p className="text-3xl font-bold mt-2 text-white">{stats.totalUsers}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-yellow-600">
          <h3 className="text-yellow-400 text-sm">طلبات تعبئة المحفظة المعلقة (يدوي)</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-500">{stats.pendingDeposits}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg border border-sky-600">
          <h3 className="text-sky-400 text-sm">طلبات الشحن والاستلام (يدوي/آلي)</h3>
          <p className="text-3xl font-bold mt-2 text-sky-500">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* هنا تظهر طلبات تعبئة الرصيد للموافقة والرفض يدوياً */}
      <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-emerald-400">إدارة طلبات شحن الرصيد الفورية</h2>
        {/* جدول معالجة المحافظ يظهر هنا */}
      </section>
    </div>
  );
}
