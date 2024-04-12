import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import {
  authLogin,
  authRefresh,
} from "../../../../../server-api/index";

async function refreshToken(token: JWT): Promise<JWT> {
  try {
    const res = await axios({
      url: authRefresh,
      method: "post",
      headers: {
        Authorization: `Refresh ${token.backendTokens.refreshToken}`,
      },
    });
    const data = res.data;

    return {
      ...token,
      backendTokens: data,
    };
  } catch (error) {
    throw new Response(null, {
      status: 401,
    });
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Please input user",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const res = await axios
          .post(authLogin, {
            email: credentials.email,
            password: credentials.password,
          })
          .then((res) => res.data)
          .catch((error) => error.response.data);

        if (
          res.statusCode === 401 ||
          res.statusCode === 404 ||
          res.statusCode === 400
        ) {
          return null;
        }

        return res;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          ...user,
        };
      }

      if (
        new Date().getTime() < token.backendTokens.expiresIn
      ) {
        return token;
      }

      const newToken = await refreshToken(token);
      return newToken;
    },

    async session({ token, session }) {
      if (token) {
        session.user = token.user;
        session.accessToken =
          token.backendTokens.accessToken;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // console.log(url);
      // console.log(baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
