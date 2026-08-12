# Rolê Rankeado

App para um grupo fechado de amigos registrar e avaliar rolês (bares, restaurantes) e manter um ranking do grupo. Modelo de dados genérico — os "rolês" podem ser de qualquer tipo, mesmo com os campos de avaliação nomeados a partir do caso de uso original (tilápia frita).

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- SQLite via Prisma ORM
- Autenticação por cookie JWT assinado (sem senha, sem OTP — login é só telefone cadastrado)
- Fotos salvas em disco (volume Docker), servidas por uma rota própria
- Drag-and-drop com `@dnd-kit`
- Deploy: um único container Docker (sem banco separado, sem Redis, sem filas)

## Desenvolvimento local

Pré-requisitos: Node 20+.

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed   # cria o admin definido em SEED_ADMIN_PHONE (arquivo .env)
npm run dev
```

Acesse http://localhost:3000 e faça login com o telefone definido em `SEED_ADMIN_PHONE` (veja `.env`).

O `.env` local já vem configurado para SQLite em `./dev.db` e uploads em `./data/uploads` (ambos ignorados pelo git).

## Deploy em VPS com Docker

1. Copie `.env.example` para `.env` e preencha os valores, principalmente:
   - `JWT_SECRET`: gere uma string longa e aleatória (ex: `openssl rand -base64 32`).
   - `SEED_ADMIN_PHONE`: telefone que será o primeiro admin do grupo. **Sem isso, ninguém consegue logar.**

2. Suba o container:

   ```bash
   docker compose up -d --build
   ```

   No primeiro start (e em todo restart), o container automaticamente:
   - roda as migrations do Prisma (`prisma migrate deploy`);
   - garante que o usuário `SEED_ADMIN_PHONE` existe com papel `ADMIN` (idempotente — reforça o acesso caso alguém seja rebaixado por engano);
   - inicia o servidor Next.js.

3. Acesse `http://<ip-da-vps>:3000`, faça login com o telefone admin e use o Painel Admin para cadastrar o restante do grupo (`/admin/usuarios`), locais (`/admin/locais`) e, se quiser, sessões históricas (`/admin/sessoes/historico/nova`).

### Persistência de dados

O banco SQLite (`db.sqlite`) e as fotos enviadas (`uploads/`) ficam em `/app/data` dentro do container, montado no volume nomeado `role_rankeado_data`. Isso sobrevive a `docker compose down` e rebuilds da imagem.

Para backups diretos no filesystem do host, troque o volume nomeado por um bind-mount no `docker-compose.yml` (alternativa já deixada comentada):

```yaml
volumes:
  - ./data:/app/data
```

### Atualizando para uma nova versão

```bash
git pull
docker compose up -d --build
```

Migrations novas rodam automaticamente no entrypoint antes do servidor subir.

## Fluxo de uso

1. Um admin cadastra os membros do grupo em `/admin/usuarios` (telefone + nome + papel).
2. Um admin cadastra locais (`/admin/locais`) ou os cria direto na hora de abrir uma sessão.
3. No dia do rolê, o admin abre `/sessao/nova`, escolhe o local, tira a foto do prato e abre a sessão.
4. Todo mundo que acessa o app vê o banner "Sessão aberta" e envia sua avaliação uma única vez (não dá pra editar depois).
5. O admin encerra a sessão em `/admin` quando achar que já rolou. As notas já entram no ranking geral assim que enviadas, mesmo antes de encerrar.
6. Sessões antigas (antes do app existir) podem ser lançadas em lote em `/admin/sessoes/historico/nova`, com as notas de cada pessoa que participou.

## Cálculo das notas

- Cada avaliação tem 3 sliders com tetos diferentes: Peixe (0 a 5), Molho (0 a 3), Acompanhamento (0 a 2).
- `nota_final = nota_peixe + nota_molho + nota_acompanhamento` (soma direta, máximo 10 — só chega em 10 quem tira o máximo nos três critérios).
- A nota do local no ranking "Nota" é a média de `nota_final` de todas as avaliações (de todas as sessões, abertas ou encerradas, ao vivo ou históricas).
- As estrelas (bem servido, atendimento, limpeza) não entram nessa conta — aparecem só no detalhe do local, como média simples.
- O ranking "Feeling" é subjetivo: cada usuário ordena livremente os locais que já avaliou (drag-and-drop); a posição de cada um é normalizada pelo tamanho da lista dele, e a nota Feeling do local é a média dessas posições normalizadas entre todos que o ranquearam (menor = melhor).