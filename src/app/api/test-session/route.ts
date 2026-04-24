import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'غير مسجل دخول' }, { status: 401 });
    }
    
    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      tenantId: session.user.tenantId,
      role: session.user.role,
      permissionsCount: session.user.permissions?.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}