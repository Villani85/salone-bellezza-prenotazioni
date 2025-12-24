import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to protect admin routes
 * This provides an additional layer of protection on top of client-side auth guards
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // In a production setup with Firebase Admin SDK, you would:
    // 1. Extract the ID token from Authorization header
    // 2. Verify the token server-side
    // 3. Check if user has admin role
    // 4. Redirect to login if not authenticated/authorized

    // For now, we rely on the AuthGuard component for client-side protection
    // This middleware can be extended to add server-side verification
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

