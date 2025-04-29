import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      session.user = {
        id: token.user.id as string,
        name: token.user.name as string,
        email: token.user.email as string,
        role: token.user.role as "USER" | "ADMIN",
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
