// src/lib/auth.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getAuthToken(request: NextRequest) {
  return getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
}