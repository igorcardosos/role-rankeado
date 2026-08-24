-- Notas passam a aceitar meios-pontos (0.5): Int -> Float
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "notaPeixe" REAL NOT NULL,
    "notaMolho" REAL NOT NULL,
    "notaAcompanhamento" REAL NOT NULL,
    "estrelaBemServido" INTEGER NOT NULL,
    "estrelaAtendimento" INTEGER NOT NULL,
    "estrelaLimpeza" INTEGER NOT NULL,
    "notaFinal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Avaliacao" ("id", "sessaoId", "usuarioId", "notaPeixe", "notaMolho", "notaAcompanhamento", "estrelaBemServido", "estrelaAtendimento", "estrelaLimpeza", "notaFinal", "createdAt")
SELECT "id", "sessaoId", "usuarioId", "notaPeixe", "notaMolho", "notaAcompanhamento", "estrelaBemServido", "estrelaAtendimento", "estrelaLimpeza", "notaFinal", "createdAt" FROM "Avaliacao";
DROP TABLE "Avaliacao";
ALTER TABLE "new_Avaliacao" RENAME TO "Avaliacao";
CREATE INDEX "Avaliacao_usuarioId_idx" ON "Avaliacao"("usuarioId");
CREATE UNIQUE INDEX "Avaliacao_sessaoId_usuarioId_key" ON "Avaliacao"("sessaoId", "usuarioId");
PRAGMA foreign_keys=ON;

-- Evita Local duplicado (mesmo nome + cidade) por clique duplo/corrida
CREATE UNIQUE INDEX "Local_nome_cidade_key" ON "Local"("nome", "cidade");

-- Trava no banco: só pode existir 1 Sessao com status ABERTA por vez,
-- mesmo se duas requisições concorrentes tentarem abrir sessão ao mesmo
-- tempo (backstop para a checagem que já existe no route handler).
CREATE UNIQUE INDEX "Sessao_unica_aberta" ON "Sessao"("status") WHERE "status" = 'ABERTA';
