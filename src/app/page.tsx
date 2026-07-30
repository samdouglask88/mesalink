import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Menu } from "@/components/landing/Menu";
import { Promos } from "@/components/landing/Promos";
import { Features } from "@/components/landing/Features";
import { Reviews } from "@/components/landing/Reviews";
import { CtaBand } from "@/components/landing/CtaBand";
import { Footer } from "@/components/landing/Footer";

// Home pública do Urban Burger — a cara do negócio.
// As telas internas (cozinha/caixa) e do cliente (/mesa/<token>) seguem
// existindo; o acesso da equipe fica discreto no rodapé.
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Menu />
        <Promos />
        <Features />
        <Reviews />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
