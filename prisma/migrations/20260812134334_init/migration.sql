-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telefone" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "papel" TEXT NOT NULL DEFAULT 'MEMBRO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Local" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "endereco" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "localId" INTEGER NOT NULL,
    "abertaPorId" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "fotoUrl" TEXT NOT NULL,
    "isHistorico" BOOLEAN NOT NULL DEFAULT false,
    "encerradaEm" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sessao_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sessao_abertaPorId_fkey" FOREIGN KEY ("abertaPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "notaPeixe" INTEGER NOT NULL,
    "notaMolho" INTEGER NOT NULL,
    "notaAcompanhamento" INTEGER NOT NULL,
    "estrelaBemServido" INTEGER NOT NULL,
    "estrelaAtendimento" INTEGER NOT NULL,
    "estrelaLimpeza" INTEGER NOT NULL,
    "notaFinal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Avaliacao_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "Sessao" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeelingVoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER NOT NULL,
    "localId" INTEGER NOT NULL,
    "posicaoPessoal" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FeelingVoto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeelingVoto_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_telefone_key" ON "Usuario"("telefone");

-- CreateIndex
CREATE INDEX "Usuario_papel_idx" ON "Usuario"("papel");

-- CreateIndex
CREATE INDEX "Local_cidade_idx" ON "Local"("cidade");

-- CreateIndex
CREATE INDEX "Sessao_localId_idx" ON "Sessao"("localId");

-- CreateIndex
CREATE INDEX "Sessao_status_idx" ON "Sessao"("status");

-- CreateIndex
CREATE INDEX "Sessao_data_idx" ON "Sessao"("data");

-- CreateIndex
CREATE INDEX "Avaliacao_usuarioId_idx" ON "Avaliacao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_sessaoId_usuarioId_key" ON "Avaliacao"("sessaoId", "usuarioId");

-- CreateIndex
CREATE INDEX "FeelingVoto_usuarioId_idx" ON "FeelingVoto"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "FeelingVoto_usuarioId_localId_key" ON "FeelingVoto"("usuarioId", "localId");
