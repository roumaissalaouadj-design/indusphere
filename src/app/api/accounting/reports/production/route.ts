// src/app/api/accounting/reports/production/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import ProductionCost from '@/models/ProductionCost';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      dateFilter.startDate = {};
      if (startDate) {
        (dateFilter.startDate as { $gte?: Date }).$gte = new Date(startDate);
      }
      if (endDate) {
        (dateFilter.startDate as { $lte?: Date }).$lte = new Date(endDate);
      }
    }

    if (reportType === 'summary') {
      const summary = await ProductionCost.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalProduction: { $sum: '$totalProduction' },
            totalRawMaterialsCost: { $sum: '$rawMaterialsCost' },
            totalEnergyCost: { $sum: '$energyCost' },
            totalLaborCost: { $sum: '$laborCost' },
            totalMaintenanceCost: { $sum: '$maintenanceCost' },
            totalOtherCosts: { $sum: '$otherCosts' },
            totalCost: { $sum: '$totalCost' },
            avgCostPerTon: { $avg: '$costPerTon' },
          }
        }
      ]);

      const monthlyData = await ProductionCost.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $substr: ['$period', 0, 7] },
            totalProduction: { $sum: '$totalProduction' },
            totalCost: { $sum: '$totalCost' },
            avgCostPerTon: { $avg: '$costPerTon' },
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          summary: summary[0] || {
            totalProduction: 0,
            totalRawMaterialsCost: 0,
            totalEnergyCost: 0,
            totalLaborCost: 0,
            totalMaintenanceCost: 0,
            totalOtherCosts: 0,
            totalCost: 0,
            avgCostPerTon: 0,
          },
          monthlyData,
        }
      });
    }

    if (reportType === 'cost-breakdown') {
      const costBreakdown = await ProductionCost.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            rawMaterialsCost: { $sum: '$rawMaterialsCost' },
            energyCost: { $sum: '$energyCost' },
            laborCost: { $sum: '$laborCost' },
            maintenanceCost: { $sum: '$maintenanceCost' },
            otherCosts: { $sum: '$otherCosts' },
          }
        }
      ]);

      return NextResponse.json({ success: true, data: costBreakdown[0] || {} });
    }

    if (reportType === 'comparison') {
      const currentPeriod = await ProductionCost.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$totalCost' },
            totalProduction: { $sum: '$totalProduction' },
            costPerTon: { $avg: '$costPerTon' },
          }
        }
      ]);

      const previousStartDate = startDate ? new Date(startDate) : null;
      const previousEndDate = endDate ? new Date(endDate) : null;
      
      if (previousStartDate) {
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      }
      if (previousEndDate) {
        previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
      }

      const previousFilter: Record<string, unknown> = {};
      if (previousStartDate && previousEndDate) {
        previousFilter.startDate = {};
        (previousFilter.startDate as { $gte?: Date }).$gte = previousStartDate;
        (previousFilter.startDate as { $lte?: Date }).$lte = previousEndDate;
      }

      const previousPeriod = await ProductionCost.aggregate([
        { $match: previousFilter },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$totalCost' },
            totalProduction: { $sum: '$totalProduction' },
            costPerTon: { $avg: '$costPerTon' },
          }
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          current: currentPeriod[0] || { totalCost: 0, totalProduction: 0, costPerTon: 0 },
          previous: previousPeriod[0] || { totalCost: 0, totalProduction: 0, costPerTon: 0 },
        }
      });
    }

    return NextResponse.json({ success: false, message: 'نوع التقرير غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Error generating production report:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في إنشاء التقرير' }, { status: 500 });
  }
}