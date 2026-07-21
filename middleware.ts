// Renova a sessão do Supabase Auth a cada request nas rotas de staff, para que
// o cookie de sessão fique sempre válido quando o server component checar o
// papel do usuário. Baseado no snippet recomendado do @supabase/ssr.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: apenas dispara a renovação; não fazemos gate aqui (o gate por
  // papel fica no server component de cada rota).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/cozinha/:path*", "/caixa/:path*"],
};
