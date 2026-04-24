import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const user = await User.findOne({ email: 'test@factory.dz' }).select('email tenantId isActive');
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        tenantId: user.tenantId,
        isActive: user.isActive
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}