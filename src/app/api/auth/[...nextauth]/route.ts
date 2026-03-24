// src/app/api/auth/[...nextauth]/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function auth(req: Request) {
  const NextAuth = (await import("next-auth")).default;
  const { authOptions } = await import("@/lib/authOptions");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = NextAuth(authOptions) as any;
  return handler(req);
}

export { auth as GET, auth as POST };
