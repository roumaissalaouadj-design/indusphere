import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import Asset from '@/models/Asset'
import WorkOrder from '@/models/WorkOrder'
import SparePart from '@/models/SparePart'
import Transaction from '@/models/Transaction'
import ProductionPlan from '@/models/ProductionPlan'
import Employee from '@/models/Employee'
import MaintenanceRequest from '@/models/MaintenanceRequest'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ success: false, message: 'API Key غير موجود' }, { status: 500 })

    await connectDB()
    const tenantId = session.user.tenantId

    const [
      totalAssets,
      activeAssets,
      openWorkOrders,
      completedWorkOrders,
      criticalWorkOrders,
      lowStockParts,
      totalParts,
      transactions,
      productionPlans,
      totalEmployees,
      maintenanceRequests,
    ] = await Promise.all([
      Asset.countDocuments({ tenantId }),
      Asset.countDocuments({ tenantId, status: 'operational' }),
      WorkOrder.countDocuments({ tenantId, status: { $in: ['open', 'in-progress'] } }),
      WorkOrder.countDocuments({ tenantId, status: 'completed' }),
      WorkOrder.countDocuments({ tenantId, priority: 'critical' }),
      SparePart.countDocuments({ tenantId, $expr: { $lte: ['$quantity', '$minStock'] } }),
      SparePart.countDocuments({ tenantId }),
      Transaction.find({ tenantId }).sort({ date: -1 }).limit(20),
      ProductionPlan.find({ tenantId }).limit(10),
      Employee.countDocuments({ tenantId, status: 'active' }),
      MaintenanceRequest.countDocuments({ tenantId, status: 'pending' }),
    ])

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const avgProduction = productionPlans.length > 0
      ? productionPlans.reduce((sum, p) => {
          const eff = p.targetQuantity > 0 ? (p.actualQuantity / p.targetQuantity) * 100 : 0
          return sum + eff
        }, 0) / productionPlans.length
      : 0

    const factoryData = {
      cmms: {
        totalAssets,
        activeAssets,
        assetAvailability: totalAssets > 0 ? Math.round((activeAssets / totalAssets) * 100) : 0,
        openWorkOrders,
        completedWorkOrders,
        criticalWorkOrders,
        maintenanceRequestsPending: maintenanceRequests,
        lowStockParts,
        totalParts,
        stockHealthPercentage: totalParts > 0 ? Math.round(((totalParts - lowStockParts) / totalParts) * 100) : 100,
      },
      erp: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        avgProductionEfficiency: Math.round(avgProduction),
        totalEmployees,
      },
    }

    const client = new Groq({ apiKey })

    const prompt = `أنت محلل أعمال خبير في مصانع الأسمنت. بناءً على البيانات التالية لمصنع الأسمنت، قدم تقريراً تحليلياً شاملاً:

${JSON.stringify(factoryData, null, 2)}

قدم التقرير بتنسيق JSON فقط بدون أي نص إضافي:
{
  "overallScore": 0-100,
  "overallStatus": "ممتاز|جيد|متوسط|ضعيف",
  "executiveSummary": "ملخص تنفيذي شامل في 3-4 جمل",
  "sections": [
    {
      "title": "عنوان القسم",
      "icon": "إيموجي",
      "score": 0-100,
      "status": "ممتاز|جيد|متوسط|ضعيف",
      "analysis": "تحليل تفصيلي",
      "highlights": ["نقطة إيجابية 1", "نقطة إيجابية 2"],
      "issues": ["مشكلة 1", "مشكلة 2"],
      "recommendations": ["توصية 1", "توصية 2"]
    }
  ],
  "topPriorities": ["أولوية 1", "أولوية 2", "أولوية 3"],
  "forecast": "توقعات للفترة القادمة"
}`

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.4,
    })

    const text = response.choices[0]?.message?.content || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return NextResponse.json({ success: true, data: parsed, rawData: factoryData })

  } catch (error: unknown) {
    console.error('Report Analysis Error:', error)
    const message = error instanceof Error ? error.message : 'خطأ غير معروف'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}