import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from "@/lib/prisma"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(price)
}

export async function generateOrderNumber() {
  // Øk sekvensen og få det nye nummeret
  const counter = await prisma.orderCounter.upsert({
    where: { id: 'counter' },
    update: { sequence: { increment: 1 } },
    create: { id: 'counter', sequence: 1 }
  })

  // Formater ordrenummeret: ÅR-SEKVENS (f.eks. 2024-00001)
  const year = new Date().getFullYear()
  const sequence = counter.sequence.toString().padStart(5, '0')
  return `${year}-${sequence}`
}

export function generatePassword(length = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length
    password += charset[randomIndex]
  }
  return password
}
