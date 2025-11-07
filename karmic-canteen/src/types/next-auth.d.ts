import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id: string;
      role: 'employee' | 'admin';
      department: string;
    };
  }

  interface User {
    role: 'employee' | 'admin';
    department: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'employee' | 'admin';
    department?: string;
  }
}
