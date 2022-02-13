import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt_decode from "jwt-decode";

interface TutortekJWT {
  uid: number;
  sub: string;
  roles: string[];
  pid: number;
  exp: number;
  iat: number;
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user?.token) {
          token.accessToken = user.token;
        }
        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken;
        return session;
      },
    },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          const { token } = await res.json();
          const decoded: TutortekJWT = jwt_decode(token);

          if (res.ok && token && decoded.roles.includes("ADMIN")) {
            return { token };
          }

          return null;
        },
      }),
    ],
  });
}
