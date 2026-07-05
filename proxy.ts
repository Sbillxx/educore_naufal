import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Public routes that don't require authentication
const publicRoutes = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // @ts-ignore
  const role = req.auth?.user?.role;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Redirect unauthenticated users to login page
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect authenticated users away from login page to their respective dashboard
  if (isLoggedIn && isPublicRoute) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin", nextUrl));
    if (role === "wali_kelas") return NextResponse.redirect(new URL("/wali-kelas", nextUrl));
    if (role === "guru_mapel") return NextResponse.redirect(new URL("/guru", nextUrl));
    if (role === "siswa") return NextResponse.redirect(new URL("/siswa", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Role-Based Access Control logic
  if (isLoggedIn) {
    const path = nextUrl.pathname;
    
    // Admin routes
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${getRoleBaseRoute(role)}`, nextUrl));
    }
    
    // Wali Kelas routes
    if (path.startsWith("/wali-kelas") && role !== "wali_kelas") {
      return NextResponse.redirect(new URL(`/${getRoleBaseRoute(role)}`, nextUrl));
    }
    
    // Guru Mapel routes
    if (path.startsWith("/guru") && role !== "guru_mapel") {
      return NextResponse.redirect(new URL(`/${getRoleBaseRoute(role)}`, nextUrl));
    }
    
    // Siswa routes
    if (path.startsWith("/siswa") && role !== "siswa") {
      return NextResponse.redirect(new URL(`/${getRoleBaseRoute(role)}`, nextUrl));
    }
  }

  return NextResponse.next();
});

// Helper function to get base route for a role
function getRoleBaseRoute(role: string): string {
  switch (role) {
    case "admin": return "admin";
    case "wali_kelas": return "wali-kelas";
    case "guru_mapel": return "guru";
    case "siswa": return "siswa";
    default: return "";
  }
}

// Ensure middleware runs only on relevant paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
