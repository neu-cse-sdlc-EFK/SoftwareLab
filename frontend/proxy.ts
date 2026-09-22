import { NextRequest, NextResponse } from "next/server";

// Routes that require a logged-in session.
const PROTECTED_PREFIXES = ["/dashboard"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected = PROTECTED_PREFIXES.some((p) =>
        pathname.startsWith(p)
    );

    const cookie = request.headers.get("cookie") ?? "";

    // Check whether the user is logged in
    const res = await fetch(`${process.env.GO_BACKEND_URL}/api/me`, {
        headers: { cookie },
        cache: "no-store",
    });

    const isLoggedIn = res.status === 200;

    // Logged-in user trying to access /login
    if (pathname === "/login" && isLoggedIn) {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    // Not a protected route
    if (!isProtected) {
        return NextResponse.next();
    }

    // Protected route but user is not logged in
    if (!isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);

        return NextResponse.redirect(loginUrl);
    }

    // Logged-in user accessing protected route
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/dashboard/:path*",
    ],
};