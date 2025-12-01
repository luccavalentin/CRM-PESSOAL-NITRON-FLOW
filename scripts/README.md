# Scripts de Importação

## Importar Leads de Piracicamirim

Este script importa automaticamente uma lista de lojas como leads no banco de dados Supabase.

### Pré-requisitos

1. Certifique-se de que o arquivo `.env.local` está configurado com as credenciais do Supabase
2. Certifique-se de que o schema do banco de dados foi executado (`database_schema_postgresql.sql`)

### Como usar

Execute o comando:

```bash
npm run import:leads
```

Ou diretamente:

```bash
npx tsx scripts/import-leads-piracicamirim.ts
```

### O que o script faz

1. Parseia a lista de lojas fornecida
2. Extrai nome e telefone de cada linha
3. Formata os telefones corretamente
4. Cria leads com os seguintes dados:
   - **Estado**: SP
   - **Cidade**: Piracicaba
   - **Bairro**: Piracicamirim
   - **Nicho**: Loja
   - **Status**: Novo
   - **Origem**: Importação em massa

### Dados importados

O script importa **~130 lojas** da região de Piracicamirim.

### Observações

- O script insere os dados em lotes de 50 (limite do Supabase)
- Se houver erros, eles serão exibidos no console
- O script mostra o progresso de cada lote inserido

