import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register')
  const isCheckoutPage = request.nextUrl.pathname.startsWith('/checkout')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isRSC = request.nextUrl.search?.includes('_rsc')

  // Ignorer RSC requests
  if (isRSC) {
    return NextResponse.next()
  }

  // Håndter ADMIN-brukere som prøver å gå til dashboard
  if (isDashboardPage && token?.role === "ADMIN") {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Tillat alltid tilgang til checkout-siden
  if (isCheckoutPage) {
    return NextResponse.next()
  }

  // For auth sider
  if (isAuthPage) {
    if (isAuth) {
      const returnTo = request.nextUrl.searchParams.get('returnTo')
      if (returnTo) {
        return NextResponse.redirect(new URL(returnTo, request.url))
      }
      
      // Hvis admin, send til admin dashboard
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      const savedCart = request.cookies.get('savedCart')
      if (savedCart) {
        return NextResponse.redirect(new URL('/checkout', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Beskytt admin ruter
  if (isAdminPage) {
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Beskytt dashboard ruter
  if (!isAuth && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*',
    '/login', 
    '/register', 
    '/checkout',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
} 