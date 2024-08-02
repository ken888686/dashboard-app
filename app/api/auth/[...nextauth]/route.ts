import { axiosInstance } from "@/app/lib/axios";
import { CreateUserDto, User } from "@/app/models/user";
import { AxiosError } from "axios";
import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

async function createUser(userData: CreateUserDto, token: string) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  return await axiosInstance.put<User>("/user", userData);
}

async function signUpWithEmailAndPassword(email: string, password: string, name: string) {
  return await axiosInstance.post("/auth/signup", { email, password, displayName: name });
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
        name: { label: "Name", type: "text" },
        isNewUser: { label: "Is New User", type: "boolean" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.isNewUser === "true") {
            const { data } = await signUpWithEmailAndPassword(
              credentials?.email as string,
              credentials?.password as string,
              credentials?.name as string,
            );
            return data;
          } else {
            const { data } = await loginWithPassword(
              credentials?.email as string,
              credentials?.password as string,
            );
            return data;
          }
        } catch (error) {
          const axiosError = error as AxiosError<{
            status: number;
            message: string;
            name: string;
          }>;
          throw new Error(
            JSON.stringify({
              status: axiosError.response?.data.status,
              message: axiosError.response?.data.message,
              name: axiosError.response?.data.name,
            }),
          );
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
            user.id = data.id as number;
            user.customJwt = token;
            user.email_verified = profile?.email_verified ?? false;
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
              email_verified: userInfo.emailVerified,
            });
            user.id = userInfo?.id as number;
            user.name = userInfo?.displayName;
            user.email = userInfo?.email;
            user.image = userInfo?.photoUrl;
            user.customJwt = token;
            user.email_verified = userInfo?.emailVerified ?? false;
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
      session.user.email_verified = token.email_verified;
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user.id as number;
        token.customJwt = user.customJwt;
        token.email_verified = user.email_verified;
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
    customJwt: string;
    email_verified: boolean;
    name?: string;
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
      email_verified: boolean;
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
    email_verified: boolean;
    name?: string | null;
  }
}
