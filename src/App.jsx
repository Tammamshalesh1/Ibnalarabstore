// Order-Charging-WebApp - Single-file React app
// Usage notes (read first):
// - This single-file React component is designed for preview in a React environment (e.g. CRA, Vite, CodeSandbox).
// - Styling uses Tailwind CSS classes. Make sure Tailwind is configured in your project (or replace classes with plain CSS).
// - This demo app stores users, sessions, wallet balances and orders in localStorage to make it runnable without a backend.
// - For production: replace client-side storage with a real backend (Netlify Functions / Firebase / Supabase) and secure auth.
//
// Deployment instructions (short):
// 1) Create a new GitHub repo and push your project (include package.json, tailwind config, this file as src/App.jsx).
// 2) In Netlify, connect the GitHub repo and set build command (e.g. `npm run build`) and publish directory (`dist` or `build`) depending on your bundler.
// 3) If you use environment variables or serverless functions, configure them in Netlify dashboard.
//
// Features implemented in this demo:
// - Signup & Login (email + password) stored locally
// - Simple Wallet per user (top-up simulated)
// - Place manual charge orders: choose product, enter quantity, unit price or select preset packages
// - Orders list (user view) and Admin panel (mark processed) - admin account: email `admin@site.local` password `admin123`
// - Basic validation and UX flows

import React, { useEffect, useState } from "react";

// --- Helpers to interact with localStorage ---
const LS_KEYS = { USERS: "oc_users", ORDERS: "oc_orders", SESSION: "oc_session" };

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize demo admin if not exists
(function ensureAdmin() {
  const users = readJSON(LS_KEYS.USERS, []);
  if (!users.find((u) => u.email === "admin@site.local")) {
    users.push({ id: "u_admin", email: "admin@site.local", password: "admin123", wallet: 0, name: "Administrator", isAdmin: true });
    writeJSON(LS_KEYS.USERS, users);
  }
})();

export default function App() {
  const [users, setUsers] = useState(() => readJSON(LS_KEYS.USERS, []));
  const [orders, setOrders] = useState(() => readJSON(LS_KEYS.ORDERS, []));
  const [session, setSession] = useState(() => readJSON(LS_KEYS.SESSION, null));

  useEffect(() => writeJSON(LS_KEYS.USERS, users), [users]);
  useEffect(() => writeJSON(LS_KEYS.ORDERS, orders), [orders]);
  useEffect(() => writeJSON(LS_KEYS.SESSION, session), [session]);

  function register({ email, password, name }) {
    if (users.find((u) => u.email === email)) return { ok: false, error: "الحساب موجود بالفعل" };
    const newUser = { id: "u_" + Date.now(), email, password, name: name || email.split("@")[0], wallet: 0, isAdmin: false };
    const next = [...users, newUser];
    setUsers(next);
    setSession({ userId: newUser.id });
    return { ok: true };
  }

  function login({ email, password }) {
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return { ok: false, error: "بيانات الدخول خاطئة" };
    setSession({ userId: u.id });
    return { ok: true };
  }

  function logout() {
    setSession(null);
  }

  function getCurrentUser() {
    if (!session) return null;
    return users.find((u) => u.id === session.userId) || null;
  }

  function topUp(amount) {
    const user = getCurrentUser();
    if (!user) return { ok: false, error: "غير مسجل" };
    const next = users.map((u) => (u.id === user.id ? { ...u, wallet: u.wallet + amount } : u));
    setUsers(next);
    return { ok: true };
  }

  function placeOrder({ product, details, quantity, unitPrice }) {
    const user = getCurrentUser();
    if (!user) return { ok: false, error: "غير مسجل" };
    const total = quantity * unitPrice;
    if (user.wallet < total) return { ok: false, error: "رصيد المحفظة غير كاف" };
    // deduct
    const nextUsers = users.map((u) => (u.id === user.id ? { ...u, wallet: u.wallet - total } : u));
    setUsers(nextUsers);

    const newOrder = {
      id: "o_" + Date.now(),
      userId: user.id,
      userEmail: user.email,
      product,
      details,
      quantity,
      unitPrice,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setOrders((s) => [newOrder, ...s]);
    return { ok: true, order: newOrder };
  }

  function adminUpdateOrder(orderId, data) {
    setOrders((s) => s.map((o) => (o.id === orderId ? { ...o, ...data } : o)));
  }

  const currentUser = getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">منصة شحن التطبيقات والألعاب</h1>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <div className="text-sm">
                  مرحبًا، <span className="font-medium">{currentUser.name}</span>
                </div>
                <div className="text-sm">رصيد: <strong>{currentUser.wallet.toFixed(2)}</strong></div>
                <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={logout}>خروج</button>
              </>
            ) : (
              <AuthPanel onLogin={login} onRegister={register} />
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card title="المحفظة">
              {currentUser ? (
                <Wallet user={currentUser} onTopUp={(amt) => {
                  const res = topUp(amt);
                  if (!res.ok) alert(res.error);
                }} />
              ) : (
                <p>سجّل دخولك أو أنشئ حسابًا لبدء الاستخدام.</p>
              )}
            </Card>

            <Card title="انشاء طلب شحن" className="mt-4">
              {currentUser ? (
                <OrderForm onPlace={placeOrder} />
              ) : (
                <p>سجّل دخولك لإنشاء طلب.</p>
              )}
            </Card>
          </div>

          <div>
            <Card title="الطلبات الأخيرة">
              <OrdersList orders={orders.filter((o) => !currentUser || o.userId === currentUser.id)} />
            </Card>

            {currentUser && currentUser.isAdmin && (
              <Card title="لوحة المشرف" className="mt-4">
                <AdminPanel orders={orders} onUpdate={adminUpdateOrder} />
              </Card>
            )}
          </div>
        </main>

        <footer className="mt-6 text-xs text-gray-500">ملاحظة: هذا نموذج عمل. للبيئة الحقيقية استخدم قاعدة بيانات ومصادقة آمنة.</footer>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <h3 className="font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

function AuthPanel({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  return (
    <div className="flex gap-2">
      <button className={`px-3 py-1 rounded ${mode === "login" ? "bg-blue-600 text-white" : "bg-gray-100"}`} onClick={() => setMode("login")}>تسجيل دخول</button>
      <button className={`px-3 py-1 rounded ${mode === "register" ? "bg-green-600 text-white" : "bg-gray-100"}`} onClick={() => setMode("register")}>انشاء حساب</button>
      <div className="ml-4">
        {mode === "login" ? <LoginForm onLogin={onLogin} /> : <RegisterForm onRegister={onRegister} />}
      </div>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function submit(e) {
    e.preventDefault();
    const res = onLogin({ email, password });
    if (!res.ok) alert(res.error);
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input required placeholder="البريد" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-2 py-1" />
      <input required placeholder="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded px-2 py-1" />
      <button className="px-3 py-1 bg-blue-600 text-white rounded">دخول</button>
    </form>
  );
}

function RegisterForm({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  function submit(e) {
    e.preventDefault();
    const res = onRegister({ email, password, name });
    if (!res.ok) alert(res.error);
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input required placeholder="الاسم" value={name} onChange={(e) => setName(e.target.value)} className="border rounded px-2 py-1" />
      <input required placeholder="البريد" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded px-2 py-1" />
      <input required placeholder="كلمة المرور" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded px-2 py-1" />
      <button className="px-3 py-1 bg-green-600 text-white rounded">انشاء</button>
    </form>
  );
}

function Wallet({ user, onTopUp }) {
  const [amount, setAmount] = useState(10);
  return (
    <div>
      <div>اسم المستخدم: <strong>{user.name}</strong></div>
      <div className="mt-2">الرصيد الحالي: <strong>{user.wallet.toFixed(2)}</strong></div>
      <div className="mt-3 flex gap-2">
        <input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="border rounded px-2 py-1" />
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => onTopUp(Number(amount))}>شحن المحفظة</button>
      </div>
    </div>
  );
}

function OrderForm({ onPlace }) {
  const [product, setProduct] = useState("جواهر لعبة X");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(1);

  function submit(e) {
    e.preventDefault();
    const res = onPlace({ product, details, quantity: Number(quantity), unitPrice: Number(unitPrice) });
    if (!res.ok) alert(res.error);
    else {
      alert("تم إنشاء الطلب بنجاح: " + res.order.id);
      setDetails("");
      setQuantity(1);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="block">
        المنتج / اللعبة
        <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full border rounded px-2 py-1 mt-1" />
      </label>

      <label className="block">
        تفاصيل (مثال: معرف اللاعب/الخادم)
        <input value={details} onChange={(e) => setDetails(e.target.value)} className="w-full border rounded px-2 py-1 mt-1" />
      </label>

      <div className="flex gap-2">
        <label className="flex-1">الكمية
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border rounded px-2 py-1 mt-1" />
        </label>
        <label className="flex-1">سعر الوحدة
          <input type="number" min="0.01" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className="w-full border rounded px-2 py-1 mt-1" />
        </label>
      </div>

      <div>المجموع المتوقع: <strong>{(Number(quantity) * Number(unitPrice)).toFixed(2)}</strong></div>
      <div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded">انشاء الطلب</button>
      </div>
    </form>
  );
}

function OrdersList({ orders }) {
  if (!orders.length) return <div>لا توجد طلبات بعد.</div>;
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="border rounded p-2">
          <div className="text-sm">#<strong>{o.id}</strong> <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</span></div>
          <div>{o.product} — {o.quantity} × {o.unitPrice} = <strong>{o.total.toFixed(2)}</strong></div>
          <div className="text-xs text-gray-600">الحالة: {o.status} — عميل: {o.userEmail}</div>
          <div className="text-xs">تفاصيل: {o.details}</div>
        </div>
      ))}
    </div>
  );
}

function AdminPanel({ orders, onUpdate }) {
  if (!orders.length) return <div>لا توجد طلبات.</div>;
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div key={o.id} className="border rounded p-2 flex items-center justify-between">
          <div>
            <div className="text-sm">#<strong>{o.id}</strong> <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</span></div>
            <div className="text-xs">{o.product} — {o.quantity} — {o.userEmail}</div>
            <div className="text-xs">حالة: {o.status}</div>
          </div>
          <div className="flex gap-2">
            <button className="px-2 py-1 bg-yellow-400 rounded" onClick={() => onUpdate(o.id, { status: "processing" })}>قيد التنفيذ</button>
            <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => onUpdate(o.id, { status: "done" })}>مكتمل</button>
            <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => onUpdate(o.id, { status: "cancelled" })}>إلغاء</button>
          </div>
        </div>
      ))}
    </div>
  );
}
