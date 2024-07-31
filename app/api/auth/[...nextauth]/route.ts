import { axiosInstance } from "@/app/lib/axios";
import { CreateUserDto, User } from "@/app/models/user";
import { AxiosError, HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

async function createUser(userData: CreateUserDto, token: string) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  return await axiosInstance.put<User>("/user", userData);
}

async function signUpWithEmailAndPassword(email: string, password: string) {
  return await axiosInstance.post("/auth/signup", { email, password });
}

async function loginWithPassword(email: string, password: string) {
  return await axiosInstance.post("/auth/login", { email, password });
}

function generateToken(payload: any) {
  return jwt.sign(payload, process.env.NEXT_PUBLIC_COOKIE_SIGNATURE_KEYS as string, {
    expiresIn: "1d",
  });
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { data } = await loginWithPassword(
            credentials?.email as string,
            credentials?.password as string,
          );
          return data;
        } catch (error) {
          const axiosError = error as AxiosError<{
            status: number;
            message: string;
            name: string;
          }>;
          if (axiosError.response?.data.status === HttpStatusCode.NotFound) {
            const { data } = await signUpWithEmailAndPassword(
              credentials?.email as string,
              credentials?.password as string,
            );
            return data;
          } else {
            throw new Error(
              JSON.stringify({
                status: axiosError.response?.data.status,
                message: axiosError.response?.data.message,
                name: axiosError.response?.data.name,
              }),
            );
          }
        }
      },
    }),
    Google({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      switch (account?.provider) {
        case "google":
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
        case "credentials":
          try {
            const userInfo = jwt.decode(user.access_token) as User;
            // Generate JWT
            const token = generateToken({
              id: userInfo.id as number,
              name: userInfo.displayName,
              email: userInfo.email,
              image: userInfo.photoUrl,
            });
            user.id = userInfo?.id as number;
            user.name = userInfo?.displayName;
            user.email = userInfo?.email;
            user.image = userInfo?.photoUrl;
            user.customJwt = token;
            return true;
          } catch (error) {
            return false;
          }
        default:
          return false;
      }
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
  pages: {
    signIn: "/login",
  },
});

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
    access_token: string;
  }
}
