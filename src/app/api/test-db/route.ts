import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const state = mongoose.connection.readyState;
    const stateText = ['disconnected', 'connected', 'connecting', 'disconnecting'][state];
    
    return NextResponse.json({
      success: true,
      message: 'Database connected!',
      state: stateText,
      databaseName: mongoose.connection.name || 'unknown'
    });
  } catch (error: unknown) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}