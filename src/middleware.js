import { NextResponse } from 'next/server';

export function middleware(request) {
  // The actual auth check happens client-side in the dashboard component
  // This middleware just ensures the route exists
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
