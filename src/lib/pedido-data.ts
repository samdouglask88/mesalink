// Dados do cardápio de pedido (formato delivery/Takeat) do Urban Burger.
// Imagens: Unsplash — troque pelas fotos reais do restaurante.
export { brl } from "./landing-data";

const img = (id: string, w = 400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type CategoriaKey =
  | "destaques"
  | "smash"
  | "combos"
  | "frango"
  | "veggie"
  | "acompanhamentos"
  | "bebidas"
  | "sobremesas"
  | "cervejas";

export interface Categoria {
  key: CategoriaKey;
  label: string;
  imagem: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoDe?: number;
  imagem: string;
  categoria: Exclude<CategoriaKey, "destaques">;
  destaque?: boolean;
  tag?: string;
}

// Barra de categorias (círculos). "Destaques" é virtual (vem dos destaque:true).
export const categorias: Categoria[] = [
  { key: "destaques", label: "Destaques", imagem: img("1571091718767-18b5b1457add") },
  { key: "smash", label: "Smash", imagem: img("1568901346375-23c9450c58cd") },
  { key: "combos", label: "Combos", imagem: img("1550547660-d9450f859349") },
  { key: "frango", label: "Frango", imagem: img("1606755962773-d324e0a13086") },
  { key: "veggie", label: "Veggie", imagem: img("1520072959219-c595dc870360") },
  { key: "acompanhamentos", label: "Acompanha", imagem: img("1573080496219-bb080dd4f877") },
  { key: "bebidas", label: "Bebidas", imagem: img("1554866585-cd94860890b7") },
  { key: "sobremesas", label: "Sobremesas", imagem: img("1572490122747-3968b75cc699") },
  { key: "cervejas", label: "Cervejas", imagem: img("1608270586620-248524c67de9") },
];

export const produtos: Produto[] = [
  // ── Smash ──────────────────────────────────────────────
  {
    id: "classic",
    nome: "Urban Classic",
    descricao: "Smash 160g, cheddar maturado, picles e molho da casa.",
    preco: 28,
    imagem: img("1568901346375-23c9450c58cd", 500),
    categoria: "smash",
    destaque: true,
    tag: "Mais pedido",
  },
  {
    id: "cheddar-bacon",
    nome: "Cheddar Bacon King",
    descricao: "Duplo smash, cheddar cremoso e bacon crocante artesanal.",
    preco: 36.5,
    precoDe: 42,
    imagem: img("1553979459-d2229ba7433b", 500),
    categoria: "smash",
    destaque: true,
  },
  {
    id: "spicy",
    nome: "Spicy Street",
    descricao: "Smash 160g, jalapeño, cheddar e maionese defumada picante.",
    preco: 33,
    imagem: img("1594212699903-ec8a3eca50f5", 500),
    categoria: "smash",
  },
  {
    id: "duplo",
    nome: "Duplo Concreto",
    descricao: "Dois smashs 160g, cheddar duplo, cebola crispy e barbecue.",
    preco: 39.9,
    imagem: img("1596662951482-0c4ba74a6df6", 500),
    categoria: "smash",
  },
  // ── Combos ─────────────────────────────────────────────
  {
    id: "combo-urban",
    nome: "Combo Urban",
    descricao: "2 Smash + fritas rústicas + refrigerante gelado.",
    preco: 49.9,
    precoDe: 62,
    imagem: img("1571091718767-18b5b1457add", 500),
    categoria: "combos",
    destaque: true,
    tag: "-20%",
  },
  {
    id: "combo-solo",
    nome: "Solo Combo",
    descricao: "1 Smash + fritas + milkshake pequeno.",
    preco: 39.9,
    imagem: img("1550547660-d9450f859349", 500),
    categoria: "combos",
  },
  {
    id: "combo-casal",
    nome: "Combo da Quebrada",
    descricao: "2 Cheddar Bacon + 2 fritas + 2 refris lata.",
    preco: 79.9,
    precoDe: 96,
    imagem: img("1610440042657-612c34d95e9f", 500),
    categoria: "combos",
  },
  // ── Frango ─────────────────────────────────────────────
  {
    id: "crispy",
    nome: "Crispy Chicken",
    descricao: "Filé de frango empanado crocante, coleslaw e maionese verde.",
    preco: 31,
    imagem: img("1606755962773-d324e0a13086", 500),
    categoria: "frango",
  },
  {
    id: "spicy-chicken",
    nome: "Hot Chicken",
    descricao: "Frango crocante ao molho apimentado nashville e picles.",
    preco: 34,
    imagem: img("1626082927389-6cd097cee6a6", 500),
    categoria: "frango",
  },
  // ── Veggie ─────────────────────────────────────────────
  {
    id: "veggie",
    nome: "Veggie Rebel",
    descricao: "Blend de grão-de-bico, queijo vegano e rúcula fresca.",
    preco: 30,
    imagem: img("1520072959219-c595dc870360", 500),
    categoria: "veggie",
  },
  {
    id: "veggie-mush",
    nome: "Portobello Street",
    descricao: "Cogumelo portobello grelhado, queijo e maionese de ervas.",
    preco: 32,
    imagem: img("1512152272829-e3139592d56f", 500),
    categoria: "veggie",
  },
  // ── Acompanhamentos ────────────────────────────────────
  {
    id: "fritas",
    nome: "Fritas da Quebrada",
    descricao: "Batata rústica com cheddar, bacon e cebolinha.",
    preco: 22,
    imagem: img("1573080496219-bb080dd4f877", 500),
    categoria: "acompanhamentos",
    destaque: true,
  },
  {
    id: "oignon",
    nome: "Anéis de Cebola",
    descricao: "8 unidades empanadas na hora, crocantes por fora.",
    preco: 19.9,
    imagem: img("1639024471283-03518883512d", 500),
    categoria: "acompanhamentos",
  },
  {
    id: "nuggets",
    nome: "Chicken Bites",
    descricao: "10 bites de frango com molho da casa.",
    preco: 24,
    imagem: img("1562967914-608f82629710", 500),
    categoria: "acompanhamentos",
  },
  // ── Bebidas ────────────────────────────────────────────
  {
    id: "refri",
    nome: "Refrigerante Lata",
    descricao: "Coca-Cola, Guaraná ou Sprite — 350ml.",
    preco: 7,
    imagem: img("1554866585-cd94860890b7", 500),
    categoria: "bebidas",
  },
  {
    id: "suco",
    nome: "Suco Natural",
    descricao: "Laranja, maracujá ou limão, feito na hora.",
    preco: 12,
    imagem: img("1613478223719-2ab802602423", 500),
    categoria: "bebidas",
  },
  {
    id: "agua",
    nome: "Água / Água com gás",
    descricao: "Garrafa 500ml gelada.",
    preco: 5,
    imagem: img("1616118132534-381148898bb4", 500),
    categoria: "bebidas",
  },
  // ── Sobremesas ─────────────────────────────────────────
  {
    id: "milkshake",
    nome: "Milkshake Urbano",
    descricao: "Chocolate belga ou morango, com chantilly.",
    preco: 18,
    imagem: img("1572490122747-3968b75cc699", 500),
    categoria: "sobremesas",
    destaque: true,
  },
  {
    id: "brownie",
    nome: "Brownie na Brasa",
    descricao: "Brownie quente com sorvete de baunilha e calda.",
    preco: 20,
    imagem: img("1607920591413-4ec007e70023", 500),
    categoria: "sobremesas",
  },
  // ── Cervejas ───────────────────────────────────────────
  {
    id: "long-neck",
    nome: "Long Neck",
    descricao: "Cerveja puro malte gelada, 355ml.",
    preco: 12,
    imagem: img("1608270586620-248524c67de9", 500),
    categoria: "cervejas",
  },
  {
    id: "ipa",
    nome: "IPA Artesanal",
    descricao: "Cerveja local, amargor equilibrado, 500ml.",
    preco: 18,
    imagem: img("1566633806327-68e152aaf26d", 500),
    categoria: "cervejas",
  },
];

export const restaurante = {
  nome: "Urban Burger",
  status: "Aberto agora",
  cidade: "Pituba, Salvador — BA",
  entrega: "30–45 min",
  taxa: "Grátis acima de R$40",
  banner: img("1553979459-d2229ba7433b", 1400),
};

export interface PromoBanner {
  titulo: string;
  descricao: string;
  cupom: string;
}

export const promoBanners: PromoBanner[] = [
  {
    titulo: "12% OFF na primeira compra",
    descricao: "Use o cupom abaixo no seu primeiro pedido.",
    cupom: "URBAN12",
  },
  {
    titulo: "Segunda Insana",
    descricao: "Solo Combo com 30% OFF toda segunda-feira.",
    cupom: "SEGUNDA30",
  },
];
