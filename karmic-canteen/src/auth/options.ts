import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

import { getUserByEmail } from '@/lib/mockDb';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Karmic SSO',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = getUserByEmail(credentials.email);
        if (!user) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const enrichedUser = user as { role: 'employee' | 'admin'; department: string };
        token.role = enrichedUser.role;
        token.department = enrichedUser.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as 'employee' | 'admin') ?? 'employee';
        session.user.id = token.sub as string;
        session.user.department = (token.department as string) ?? 'General';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? 'karmic-canteen-secret',
};
