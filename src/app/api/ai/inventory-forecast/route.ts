import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import SparePart from '@/models/SparePart'
import WorkOrder from '@/models/WorkOrder'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ success: false, message: 'API Key غير موجود' }, { status: 500 })

    await connectDB()
    const tenantId = session.user.tenantId

    const spareParts = await SparePart.find({ tenantId })
    const recentWorkOrders = await WorkOrder.find({ tenantId })
      .sort({ createdAt: -1 }).limit(30)

    const partsData = spareParts.map(part => ({
      id: part._id.toString(),
      name: part.name,
      partNumber: part.partNumber,
      quantity: part.quantity,
      minStock: part.minStock,
      unit: part.unit,
      location: part.location,
      stockRatio: part.minStock > 0 ? Math.round((part.quantity / part.minStock) * 100) : 100,
      isLow: part.quantity <= part.minStock,
    }))

    const client = new Groq({ apiKey })

    const prompt = `أنت خبير في إدارة المخزون لمصانع الأسمنت. بناءً على بيانات قطع الغيار التالية، قدم توقعات المخزون:

بيانات قطع الغيار:
${JSON.stringify(partsData, null, 2)}

عدد أوامر العمل الأخيرة: ${recentWorkOrders.length}

قدم إجابتك بتنسيق JSON فقط بدون أي نص إضافي:
{
  "summary": "ملخص عام عن حالة المخزون",
  "alerts": [
    {
      "partId": "id القطعة",
      "partName": "اسم القطعة",
      "partNumber": "رقم القطعة",
      "currentStock": 0,
      "minStock": 0,
      "urgency": "عاجل|قريب|مراقبة",
      "daysUntilStockout": 0,
      "recommendedOrder": 0,
      "reason": "سبب التنبيه"
    }
  ],
  "recommendations": [
    {
      "title": "عنوان التوصية",
      "description": "وصف التوصية",
      "priority": "عالي|متوسط|منخفض"
    }
  ],
  "overallHealth": 0-100
}`

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    })

    const text = response.choices[0]?.message?.content || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json({ success: true, data: parsed })

  } catch (error: unknown) {
    console.error('Inventory Forecast Error:', error)
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}