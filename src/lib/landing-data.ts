// Conteúdo da landing pública do Urban Burger.
// Imagens: Unsplash (troque pelas fotos reais do restaurante quando tiver).
import type { LucideIcon } from "lucide-react";
import { Leaf, Timer, Croissant, Beef } from "lucide-react";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type MenuCategory = "smash" | "combos" | "bebidas" | "sobremesas";

export interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  categoria: MenuCategory;
  destaque?: boolean;
}

export const categorias: { key: MenuCategory; label: string; emoji: string }[] =
  [
    { key: "smash", label: "Smash", emoji: "🍔" },
    { key: "combos", label: "Combos", emoji: "🍟" },
    { key: "bebidas", label: "Bebidas", emoji: "🥤" },
    { key: "sobremesas", label: "Sobremesas", emoji: "🍰" },
  ];

export const menu: MenuItem[] = [
  {
    id: "classic",
    nome: "Urban Classic",
    descricao: "Smash 160g, cheddar maturado, picles e molho da casa.",
    preco: 28,
    imagem: img("1568901346375-23c9450c58cd"),
    categoria: "smash",
    destaque: true,
  },
  {
    id: "cheddar-bacon",
    nome: "Cheddar Bacon King",
    descricao: "Duplo smash, cheddar cremoso e bacon crocante artesanal.",
    preco: 36.5,
    imagem: img("1553979459-d2229ba7433b"),
    categoria: "smash",
  },
  {
    id: "spicy",
    nome: "Spicy Street",
    descricao: "Smash 160g, jalapeño, cheddar e maionese defumada picante.",
    preco: 33,
    imagem: img("1594212699903-ec8a3eca50f5"),
    categoria: "smash",
  },
  {
    id: "veggie",
    nome: "Veggie Rebel",
    descricao: "Blend de grão-de-bico, queijo vegano e rúcula fresca.",
    preco: 30,
    imagem: img("1520072959219-c595dc870360"),
    categoria: "smash",
  },
  {
    id: "combo-urban",
    nome: "Combo Urban",
    descricao: "2 Smash + fritas rústicas + refrigerante gelado.",
    preco: 49.9,
    imagem: img("1571091718767-18b5b1457add"),
    categoria: "combos",
    destaque: true,
  },
  {
    id: "combo-solo",
    nome: "Solo Combo",
    descricao: "1 Smash + fritas + milkshake pequeno.",
    preco: 39.9,
    imagem: img("1550547660-d9450f859349"),
    categoria: "combos",
  },
  {
    id: "fritas",
    nome: "Fritas da Quebrada",
    descricao: "Batata rústica com cheddar, bacon e cebolinha.",
    preco: 22,
    imagem: img("1573080496219-bb080dd4f877"),
    categoria: "combos",
  },
  {
    id: "refri",
    nome: "Refrigerante Lata",
    descricao: "Coca-Cola, Guaraná ou Sprite — 350ml bem gelado.",
    preco: 7,
    imagem: img("1554866585-cd94860890b7"),
    categoria: "bebidas",
  },
  {
    id: "suco",
    nome: "Suco Natural",
    descricao: "Laranja, maracujá ou limão, feito na hora.",
    preco: 12,
    imagem: img("1613478223719-2ab802602423"),
    categoria: "bebidas",
  },
  {
    id: "cerveja",
    nome: "Long Neck",
    descricao: "Cerveja artesanal local, puro malte.",
    preco: 14,
    imagem: img("1608270586620-248524c67de9"),
    categoria: "bebidas",
  },
  {
    id: "milkshake",
    nome: "Milkshake Urbano",
    descricao: "Chocolate belga ou morango, com chantilly.",
    preco: 18,
    imagem: img("1572490122747-3968b75cc699"),
    categoria: "sobremesas",
    destaque: true,
  },
  {
    id: "brownie",
    nome: "Brownie na Brasa",
    descricao: "Brownie quente com sorvete de baunilha e calda.",
    preco: 20,
    imagem: img("1607920591413-4ec007e70023"),
    categoria: "sobremesas",
  },
  {
    id: "cookie",
    nome: "Cookie Gigante",
    descricao: "Cookie recheado de chocolate meio amargo.",
    preco: 15,
    imagem: img("1499636136210-6f4ee915583e"),
    categoria: "sobremesas",
  },
];

export interface Promo {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  precoDe?: number;
  tag: string;
  imagem: string;
}

export const promocoes: Promo[] = [
  {
    id: "combo-urban",
    titulo: "Combo Urban",
    descricao: "2 Smash + Batata + Refrigerante",
    preco: 49.9,
    precoDe: 62,
    tag: "Mais pedido",
    imagem: img("1571091718767-18b5b1457add", 1000),
  },
  {
    id: "dupla",
    titulo: "Dupla da Rua",
    descricao: "2 Cheddar Bacon + 2 Milkshakes",
    preco: 79.9,
    precoDe: 98,
    tag: "Pra dividir",
    imagem: img("1550547660-d9450f859349", 1000),
  },
  {
    id: "solo",
    titulo: "Segunda Insana",
    descricao: "Solo Combo com 30% OFF toda segunda",
    preco: 27.9,
    precoDe: 39.9,
    tag: "-30%",
    imagem: img("1568901346375-23c9450c58cd", 1000),
  },
];

export interface Diferencial {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
}

export const diferenciais: Diferencial[] = [
  {
    icon: Leaf,
    titulo: "Ingredientes Frescos",
    descricao: "Compras diárias na feira. Nada de congelado sem alma.",
  },
  {
    icon: Timer,
    titulo: "Entrega Rápida",
    descricao: "Do balcão à sua porta em até 30 minutos.",
  },
  {
    icon: Croissant,
    titulo: "Pão Artesanal",
    descricao: "Fornada própria todo dia, macio por dentro e dourado.",
  },
  {
    icon: Beef,
    titulo: "Carne Angus",
    descricao: "Blend Angus 160g selado na chapa quente.",
  },
];

export interface Avaliacao {
  nome: string;
  handle: string;
  foto: string;
  comentario: string;
}

export const avaliacoes: Avaliacao[] = [
  {
    nome: "Rafael Mendes",
    handle: "@rafa.come",
    foto: "https://i.pravatar.cc/120?img=12",
    comentario:
      "Melhor smash que já comi na cidade. O molho da casa é viciante e o pão é outro nível.",
  },
  {
    nome: "Juliana Alves",
    handle: "@ju.food",
    foto: "https://i.pravatar.cc/120?img=45",
    comentario:
      "Ambiente com cara de rua, mas o atendimento é premium. Combo Urban vale cada centavo.",
  },
  {
    nome: "Diego Santos",
    handle: "@diegostreet",
    foto: "https://i.pravatar.cc/120?img=15",
    comentario:
      "Chegou quentinho e rápido. Bacon crocante de verdade. Virei cliente fixo.",
  },
  {
    nome: "Camila Rocha",
    handle: "@mila.eats",
    foto: "https://i.pravatar.cc/120?img=32",
    comentario:
      "O Spicy Street tem a pegada perfeita de pimenta. Milkshake então… surreal.",
  },
];

export const contato = {
  horario: "Ter a Dom · 18h às 23h30",
  endereco: "Av. Manoel Dias da Silva, 1234 — Pituba, Salvador - BA",
  telefone: "(11) 99999-0000",
  whatsapp: "5511999990000",
  instagram: "urbanburger",
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
