// src/app/api/inventory/forecast/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectDB } from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import Transaction from '@/models/Transaction';

// دالة لحساب متوسط الاستهلاك الشهري
async function calculateMonthlyConsumption(itemCode: string, tenantId: string): Promise<number> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // جلب معاملات المخزون (المبيعات أو الاستخدامات)
  const transactions = await Transaction.find({
    tenantId,
    category: itemCode,
    date: { $gte: sixMonthsAgo },
    type: 'expense' // أو حسب منطق عملك
  });

  const totalConsumption = transactions.reduce((sum, t) => sum + t.amount, 0);
  return totalConsumption / 6; // متوسط شهري
}

// دالة لحساب تاريخ النقص المتوقع
function calculateShortageDate(currentQuantity: number, monthlyConsumption: number): Date | null {
  if (monthlyConsumption <= 0) return null;
  
  const monthsUntilShortage = currentQuantity / monthlyConsumption;
  const shortageDate = new Date();
  shortageDate.setMonth(shortageDate.getMonth() + Math.ceil(monthsUntilShortage));
  
  return shortageDate;
}

// دالة لتحديد مستوى الخطر
function getRiskLevel(currentQuantity: number, minStock: number, monthlyConsumption: number): 'high' | 'medium' | 'low' {
  const monthsLeft = currentQuantity / (monthlyConsumption || 1);
  
  if (currentQuantity <= minStock) return 'high';
  if (monthsLeft <= 1) return 'high';
  if (monthsLeft <= 3) return 'medium';
  return 'low';
}

// دالة للحصول على التوصية
function getRecommendation(riskLevel: string, currentQuantity: number, minStock: number): string {
  if (riskLevel === 'high') {
    return '⚠️ يوصى بالطلب الفوري لتجنب نفاد المخزون';
  }
  if (riskLevel === 'medium') {
    return '📦 خطط لإعادة الطلب خلال الشهر القادم';
  }
  return '✅ المخزون جيد، راقب الاستهلاك بانتظام';
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    // جلب جميع عناصر المخزون
    const inventoryItems = await Inventory.find({ tenantId: session.user.tenantId });

    // حساب التوقعات لكل عنصر
    const forecasts = await Promise.all(
      inventoryItems.map(async (item) => {
        // حساب متوسط الاستهلاك الشهري
        const avgMonthlyConsumption = await calculateMonthlyConsumption(item.itemCode, session.user.tenantId);
        
        // حساب الكمية المتوقعة بعد 3 أشهر
        const forecastedQuantity = Math.max(0, item.quantity - (avgMonthlyConsumption * 3));
        
        // حساب تاريخ النقص المتوقع
        const shortageDate = calculateShortageDate(item.quantity, avgMonthlyConsumption);
        
        // تحديد مستوى الخطر
        const riskLevel = getRiskLevel(item.quantity, item.minStock, avgMonthlyConsumption);
        
        // الحصول على التوصية
        const recommendation = getRecommendation(riskLevel, item.quantity, item.minStock);

        return {
          _id: item._id,
          itemCode: item.itemCode,
          name: item.name,
          currentQuantity: item.quantity,
          minStock: item.minStock,
          avgMonthlyConsumption: Math.round(avgMonthlyConsumption * 10) / 10,
          forecastedQuantity: Math.round(forecastedQuantity),
          shortageDate: shortageDate ? shortageDate.toISOString().split('T')[0] : '',
          riskLevel,
          recommendation,
          unit: item.unit,
        };
      })
    );

    // ترتيب حسب مستوى الخطر (الأعلى خطراً أولاً)
    const riskOrder = { high: 0, medium: 1, low: 2 };
    forecasts.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    return NextResponse.json({ success: true, data: forecasts });
  } catch (error) {
    console.error('Error generating inventory forecast:', error);
    const message = error instanceof Error ? error.message : 'خطأ غير معروف';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}