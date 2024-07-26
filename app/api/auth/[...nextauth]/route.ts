import { axiosInstance } from "@/app/lib/axios";
import { CreateUserDto, User } from "@/app/models/user";
import jwt from "jsonwebtoken";
import NextAuth, { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

async function createUser(userData: CreateUserDto, token: string) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  return await axiosInstance.put<User>("/user", userData);
}

function generateToken(payload: any) {
  return jwt.sign(
    payload,
    process.env.NEXT_PUBLIC_COOKIE_SIGNATURE_KEYS as string,
    { expiresIn: "1d" },
  );
}

const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Create payload for JWT
          const userData: CreateUserDto = {
            loginType: account?.provider,
            email: user.email ?? "",
            emailVerified: profile?.email_verified || false,
            displayName: user.name ?? "",
            photoUrl: user.image ?? "",
            firstName: profile?.given_name ?? "",
            lastName: profile?.family_name ?? "",
          };

          // Generate JWT
          const token = generateToken({
            ...userData,
            providerId: profile?.sub ?? "",
          });

          const { data } = await createUser(userData, token);
          user.id = data.id;
          user.customJwt = token;

          return true;
        } catch (error) {
          return false;
        }
      }
      return true;
    },
    async session({ session, user, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.customJwt = token.customJwt;
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user.id as number;
        token.customJwt = user.customJwt;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id: number;
    customJwt?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    customJwt?: string;
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface Profile {
    email_verified: boolean;
    given_name: string;
    family_name: string;
  }

  interface User {
    id: number;
    customJwt: string;
  }
}
