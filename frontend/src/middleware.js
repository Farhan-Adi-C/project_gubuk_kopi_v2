import { NextResponse } from "next/server";

const protectedRoutes = ["/admin", "/dashboard"];
const authRoutes = ["/login", "/register"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  let isAdmin = false;

  if (token) {
    try {
     
      const res = await fetch(`http://127.0.0.1:8000/api/userislogin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const user = await res.json();

        isAdmin = user.user.is_admin; 
      }
    } catch (err) {
      console.log("Error fetching current user:", err);
    }
  }

  // Jika belum login dan akses halaman protected
  if (
    !token &&
    protectedRoutes.some(
      (path) => pathname === path || pathname.startsWith(path + "/")
    )
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan akses login/register
  if (token && authRoutes.includes(pathname)) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Jika bukan admin dan akses halaman admin
  if (token && !isAdmin && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register"],
};
