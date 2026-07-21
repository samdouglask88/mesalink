import { describe, it, expect } from "vitest";
import { formatBRL, formatHora } from "./format";

describe("formatBRL", () => {
  it("formata número como BRL", () => {
    expect(formatBRL(28)).toMatch(/^R\$\s*28,00$/);
  });

  it("formata string numérica (como vem do Postgres) como BRL", () => {
    expect(formatBRL("34.50")).toMatch(/^R\$\s*34,50$/);
  });

  it("trata null/undefined como zero", () => {
    expect(formatBRL(null)).toMatch(/^R\$\s*0,00$/);
    expect(formatBRL(undefined)).toMatch(/^R\$\s*0,00$/);
  });

  it("trata string não-numérica como zero", () => {
    expect(formatBRL("abc")).toMatch(/^R\$\s*0,00$/);
  });
});

describe("formatHora", () => {
  it("retorna string vazia para valor ausente", () => {
    expect(formatHora(null)).toBe("");
    expect(formatHora(undefined)).toBe("");
    expect(formatHora("")).toBe("");
  });

  it("formata um ISO como HH:mm", () => {
    // Não fixamos o valor (depende do fuso do runner), só o formato.
    expect(formatHora("2026-07-21T13:45:00Z")).toMatch(/^\d{2}:\d{2}$/);
  });
});
