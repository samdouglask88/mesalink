import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Config dos testes de INTEGRAÇÃO. Batem no backend local (PostgREST + Edge
// Functions) e só executam de fato com o stack de pé e INTEGRATION=1; caso
// contrário, os testes se auto-ignoram (describe.skipIf). Ver README.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    // Sem paralelismo: os testes compartilham o estado do banco (a mesma comanda
    // do seed) e rodam em sequência para não colidir.
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
