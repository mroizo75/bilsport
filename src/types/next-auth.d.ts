import { DefaultSession } from "next-auth"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      phone: string
      redirect?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    phone?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
} 