// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import '@/models/Role';

export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleId: string;
  role: string;
  permissions: string[];
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
  interface JWT {
    tenantId?: string;
    roleId?: string;
    role?: string;
    permissions?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // ✅ إضافة trustHost لحل مشكلة UntrustedHost
  trustHost: true,
  
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
  console.log('🔐 محاولة تسجيل الدخول:', credentials?.email);
  
  if (!credentials?.email || !credentials?.password) {
    console.log('❌ البريد الإلكتروني أو كلمة المرور مفقودة');
    return null;
  }

  await connectDB();

  const user = await User.findOne({
    email: credentials.email,
    isActive: true,
  }).populate({
    path: 'roleId',
    model: 'Role',
    select: 'name permissions'
  });

  if (!user) {
    console.log('❌ المستخدم غير موجود:', credentials?.email);
    return null;
  }

  console.log('✅ المستخدم موجود:', {
    id: user._id,
    email: user.email,
    roleName: user.roleId?.name,
    permissionsCount: user.roleId?.permissions?.length
  });

  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  );

  if (!isValid) {
    console.log('❌ كلمة المرور غير صحيحة للمستخدم:', credentials?.email);
    return null;
  }

  const extendedUser: ExtendedUser = {
    id:       user._id.toString(),
    email:    user.email,
    name:     user.name || user.email.split('@')[0],
    tenantId: user.tenantId.toString(),
    roleId:   user.roleId?._id?.toString() ?? '',
    role:     user.roleId?.name || 'Admin',
    permissions: user.roleId?.permissions || [],
  };

  console.log('👤 المستخدم الموسع - عدد الصلاحيات:', extendedUser.permissions.length);

  return extendedUser;
},
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('📦 JWT Callback - قبل:', { sub: token.sub, name: token.name });
      
      if (user) {
        const u = user as ExtendedUser;
        token.tenantId = u.tenantId;
        token.roleId = u.roleId;
        token.role = u.role;
        token.permissions = JSON.stringify(u.permissions);
        token.name = u.name;
        token.email = u.email;
        
        console.log('📦 JWT Callback - بعد إضافة المستخدم:', {
          name: token.name,
          email: token.email,
          tenantId: token.tenantId,
        });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('💬 Session Callback - قبل:', { name: session.user?.name, email: session.user?.email });
      
      if (token) {
        session.user.id = token.sub ?? '';
        session.user.name = (token.name as string) || (token.email as string)?.split('@')[0] || '';
        session.user.email = token.email as string;
        session.user.tenantId = token.tenantId as string;
        session.user.roleId = token.roleId as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions ? JSON.parse(token.permissions as string) : [];
        
        console.log('💬 Session Callback - بعد:', {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          tenantId: session.user.tenantId,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});