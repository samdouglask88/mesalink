// Tipos do schema `public`, no formato que o `supabase gen types typescript` gera.
// Para regenerar a partir do projeto real: `npm run gen:types`
// (precisa do Supabase CLI e da env SUPABASE_PROJECT_ID).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      mesas: {
        Row: {
          id: string;
          numero: number;
          status: "livre" | "ocupada";
          created_at: string;
        };
        Insert: {
          id?: string;
          numero: number;
          status?: "livre" | "ocupada";
          created_at?: string;
        };
        Update: {
          id?: string;
          numero?: number;
          status?: "livre" | "ocupada";
          created_at?: string;
        };
        Relationships: [];
      };
      comandas: {
        Row: {
          id: string;
          mesa_id: string;
          token: string;
          status: "aberta" | "fechamento_solicitado" | "fechada";
          aberta_em: string;
          fechada_em: string | null;
        };
        Insert: {
          id?: string;
          mesa_id: string;
          token?: string;
          status?: "aberta" | "fechamento_solicitado" | "fechada";
          aberta_em?: string;
          fechada_em?: string | null;
        };
        Update: {
          id?: string;
          mesa_id?: string;
          token?: string;
          status?: "aberta" | "fechamento_solicitado" | "fechada";
          aberta_em?: string;
          fechada_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comandas_mesa_id_fkey";
            columns: ["mesa_id"];
            referencedRelation: "mesas";
            referencedColumns: ["id"];
          },
        ];
      };
      itens_cardapio: {
        Row: {
          id: string;
          nome: string;
          descricao: string | null;
          preco: number;
          categoria: string | null;
          disponivel: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string | null;
          preco: number;
          categoria?: string | null;
          disponivel?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string | null;
          preco?: number;
          categoria?: string | null;
          disponivel?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      pedidos: {
        Row: {
          id: string;
          comanda_id: string;
          status: "recebido" | "preparo" | "pronto" | "entregue";
          created_at: string;
        };
        Insert: {
          id?: string;
          comanda_id: string;
          status?: "recebido" | "preparo" | "pronto" | "entregue";
          created_at?: string;
        };
        Update: {
          id?: string;
          comanda_id?: string;
          status?: "recebido" | "preparo" | "pronto" | "entregue";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pedidos_comanda_id_fkey";
            columns: ["comanda_id"];
            referencedRelation: "comandas";
            referencedColumns: ["id"];
          },
        ];
      };
      itens_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          item_cardapio_id: string;
          quantidade: number;
          preco_unitario_registrado: number;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          item_cardapio_id: string;
          quantidade: number;
          preco_unitario_registrado: number;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          item_cardapio_id?: string;
          quantidade?: number;
          preco_unitario_registrado?: number;
        };
        Relationships: [
          {
            foreignKeyName: "itens_pedido_item_cardapio_id_fkey";
            columns: ["item_cardapio_id"];
            referencedRelation: "itens_cardapio";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey";
            columns: ["pedido_id"];
            referencedRelation: "pedidos";
            referencedColumns: ["id"];
          },
        ];
      };
      fechamentos: {
        Row: {
          id: string;
          comanda_id: string;
          status: "solicitado" | "avisado" | "fechado";
          total: number;
          forma_pagamento: "dinheiro" | "credito" | "debito" | "pix" | null;
          solicitado_em: string;
          fechado_em: string | null;
        };
        Insert: {
          id?: string;
          comanda_id: string;
          status?: "solicitado" | "avisado" | "fechado";
          total?: number;
          forma_pagamento?: "dinheiro" | "credito" | "debito" | "pix" | null;
          solicitado_em?: string;
          fechado_em?: string | null;
        };
        Update: {
          id?: string;
          comanda_id?: string;
          status?: "solicitado" | "avisado" | "fechado";
          total?: number;
          forma_pagamento?: "dinheiro" | "credito" | "debito" | "pix" | null;
          solicitado_em?: string;
          fechado_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fechamentos_comanda_id_fkey";
            columns: ["comanda_id"];
            referencedRelation: "comandas";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          id: string;
          auth_user_id: string;
          nome: string;
          papel: "cozinha" | "caixa" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          nome: string;
          papel: "cozinha" | "caixa" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          nome?: string;
          papel?: "cozinha" | "caixa" | "admin";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Atalhos úteis para o app.
type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type Mesa = Tables<"mesas">;
export type Comanda = Tables<"comandas">;
export type ItemCardapio = Tables<"itens_cardapio">;
export type Pedido = Tables<"pedidos">;
export type ItemPedido = Tables<"itens_pedido">;
export type Fechamento = Tables<"fechamentos">;
export type Staff = Tables<"staff">;

export type StatusPedido = Pedido["status"];
export type StatusFechamento = Fechamento["status"];
export type FormaPagamento = NonNullable<Fechamento["forma_pagamento"]>;
export type PapelStaff = Staff["papel"];
