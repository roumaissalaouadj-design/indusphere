import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Asset from '@/models/Asset'
import WorkOrder from '@/models/WorkOrder'
import PreventiveMaintenance from '@/models/PreventiveMaintenance'
import Notification from '@/models/Notification'
import User from '@/models/User'
import Tenant from '@/models/Tenant'
import Groq from 'groq-sdk'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    // التحقق من الـ secret key لحماية الـ endpoint
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return NextResponse.json({ success: false, message: 'API Key غير موجود' }, { status: 500 })

    await connectDB()

    // جلب كل المستأجرين النشطين
    const tenants = await Tenant.find({ status: 'active' })
    const client = new Groq({ apiKey })
    const results = []

    for (const tenant of tenants) {
      const tenantId = tenant._id

      // جلب الأصول
      const assets = await Asset.find({ tenantId }).limit(20)
      if (assets.length === 0) continue

      const assetsData = await Promise.all(assets.map(async (asset) => {
        const workOrders = await WorkOrder.find({
          tenantId,
          assetId: asset._id,
        }).sort({ createdAt: -1 }).limit(5)

        const preventive = await PreventiveMaintenance.findOne({
          tenantId,
          assetId: asset._id,
        }).sort({ lastDone: -1 })

        const daysSinceLastMaintenance = preventive?.lastDone
          ? Math.floor((Date.now() - new Date(preventive.lastDone).getTime()) / (1000 * 60 * 60 * 24))
          : null

        return {
          id: asset._id.toString(),
          name: asset.name,
          category: asset.category,
          status: asset.status,
          workOrdersCount: workOrders.length,
          daysSinceLastMaintenance,
        }
      }))

      // تحليل AI
      const prompt = `أنت خبير صيانة. حلل هذه الأصول وأعطني فقط الأصول ذات الخطر العالي أو الحرج.

${JSON.stringify(assetsData, null, 2)}

أجب بـ JSON فقط:
{
  "alerts": [
    {
      "assetId": "id",
      "assetName": "اسم",
      "riskLevel": "critical|high",
      "riskPercentage": 0-100,
      "message": "رسالة الإشعار"
    }
  ]
}`

      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
      })

      const text = response.choices[0]?.message?.content || '{}'
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (!parsed.alerts?.length) continue

      // جلب كل مستخدمي هذا المستأجر
      const users = await User.find({ tenantId, isActive: true })
      if (users.length === 0) continue

      // إنشاء الإشعارات
      const notifications = []
      for (const alert of parsed.alerts) {
        for (const user of users) {
          notifications.push({
            tenantId,
            userId: user._id,
            title: alert.riskLevel === 'critical' ? '🔴 تنبيه حرج — صيانة فورية' : '🟠 تنبيه عالي — صيانة مطلوبة',
            message: alert.message || `${alert.assetName} — احتمال عطل ${alert.riskPercentage}%`,
            type: alert.riskLevel === 'critical' ? 'critical' : 'high',
            category: 'failure_prediction',
            assetId: alert.assetId ? new mongoose.Types.ObjectId(alert.assetId) : undefined,
            assetName: alert.assetName,
            riskPercentage: alert.riskPercentage,
            link: `/cmms/failure-prediction`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
          })
        }
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications)
        results.push({ tenantId, count: notifications.length })
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error: unknown) {
    console.error('Auto Analysis Error:', error)
    const message = error instanceof Error ? error.message : 'خطأ'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
