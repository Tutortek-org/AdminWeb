import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt_decode from "jwt-decode";
import { NextApiRequest, NextApiResponse } from "next/types";

interface TutortekJWT {
  uid: number;
  sub: string;
  roles: string[];
  pid: number;
  exp: number;
  iat: number;
}

function setNextAuthUrl(req: NextApiRequest) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.headers["host"];

  if (!host) {
    throw new Error(
      `The request has no host header which breaks authentication and authorization.`
    );
  }

  process.env.NEXTAUTH_URL = `${protocol}://${host}`;
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  setNextAuthUrl(req);

  return await NextAuth(req, res, {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (token.accessToken) {
          const decoded: TutortekJWT = jwt_decode(token.accessToken as string);
          if (decoded.exp < Date.now() / 1000) {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token.accessToken}`,
                },
              }
            );

            const { token: accessToken } = await res.json();
            const newDecoded: TutortekJWT = jwt_decode(accessToken);
            if (res.ok && accessToken && newDecoded.roles.includes("ADMIN")) {
              token.accessToken = accessToken;
            }
          } else if (user?.token) {
            token.accessToken = user.token;
          }
        } else if (user?.token) {
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
