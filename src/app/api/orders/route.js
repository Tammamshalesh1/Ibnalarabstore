import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const productName = String(body.productName || '').trim();
    const playerId = String(body.playerId || '').trim();
    const price = Number(body.price);

    if (!name || !phone || !productName || !playerId || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'البيانات المطلوبة غير مكتملة' }, { status: 400 });
    }

    if (name.length > 100 || phone.length > 30 || playerId.length > 100 || productName.length > 200) {
      return NextResponse.json({ error: 'البيانات المدخلة طويلة جداً' }, { status: 400 });
    }

    const email = `${phone.replace(/[^0-9]/g, '') || 'customer'}@orders.ibnalarab.local`;
    const user = await prisma.user.upsert({
      where: { phone },
      update: { name },
      create: { name, phone, email },
    });

    const order = await prisma.order.create({
      data: { userId: user.id, productName, playerId, price },
    });

    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (error) {
    console.error('ORDER_CREATE_ERROR', error);
    return NextResponse.json({ error: 'تعذر إنشاء الطلب حالياً' }, { status: 500 });
  }
}
