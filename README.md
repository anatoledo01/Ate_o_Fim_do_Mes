# Até o Fim do Mês — PWA Financeiro Pessoal

> "Seu salário tem um plano. Agora você também."
> 
> **Desenvolvido por Ana Toledo**

---

## 1. Visão Geral do Produto

O **Até o Fim do Mês** é uma aplicação web progressiva (PWA) de finanças pessoais focada em responder diariamente à pergunta:

> **"Quanto eu posso gastar hoje sem comprometer o resto do meu mês?"**

Diferente de planilhas complexas ou aplicativos contábeis pesados, o Até o Fim do Mês centraliza o foco no **dinheiro livre real** e no **limite diário sugerido**, protegendo automaticamente contas fixas que ainda vão vencer e reservas de segurança.

---

## 2. Stack Tecnológica

O projeto foi construído em um **repositório único e autocontido** (não é monorepo):

- **Framework**: Next.js 15 (App Router).
- **Linguagem**: TypeScript com tipagem estrita.
- **Estilização**: Tailwind CSS com paleta sob medida para fintechs contemporâneas.
- **Ícones**: Lucide React.
- **Formulários e Validação**: Zod e validações seguras de moeda brasileira (BRL em centavos inteiros).
- **PWA & Offline**: Web App Manifest (`manifest.json`), Service Worker com estratégia de cache e suporte a instalação nativa.
- **Persistência & Autenticação**: 
  - **Supabase**: PostgreSQL com Row Level Security (RLS) e Supabase Auth.
  - **Modo Standalone / Local Seguro**: Fallback automático e isolado por usuário no navegador, permitindo testar e utilizar 100% dos recursos mesmo antes de configurar chaves de API externas.
- **Testes**: Suíte de testes unitários com o test runner nativo do Node.js (`node --test`).

---

## 3. Identidade Visual e Branding (Mestres da Web)

Inspirado na identidade visual tecnológica e espacial de [startup.challenge.mestresdaweb.org](https://startup.challenge.mestresdaweb.org/):
- **Dark Space Imersivo (#07081A & #0E1026)**: Fundo cósmico com gradientes de ambient glow e superfícies translúcidas com efeito vidro (*glassmorphism*).
- **Verde Menta Cibernético (#22FFB4)**: Destaque de métricas positivas, botões primários e anel neon da barra de navegação.
- **Azul Elétrico (#5B8CFF) e Âmbar (#FFD000)**: Acentos de categoria, gráficos e telemetria.
- **Tipografia Técnica**: **Sora** para títulos e **JetBrains Mono** (`font-mono`) com espaçamento tabular para todos os valores monetários, datas e badges.
- **Curved Nav Bar**: Barra de navegação inferior anatômica e fluida com curva em SVG e indicador circular flutuante dinâmico.

---

## 4. Regras de Negócio Financeiras

Todos os cálculos residem centralizados em `src/lib/financial-engine.ts`:

### 4.1. Dinheiro Disponível para Planejamento
$$\text{Disponível} = \text{Saldo Atual} + \text{Entradas Previstas} - \text{Contas Pendentes no Ciclo} - \text{Reserva de Segurança}$$

- **Saldo Atual**: Saldo de referência ajustado pelo somatório de receitas e despesas registradas.
- **Contas Pendentes**: Compromissos do tipo `payable` com status `pending` com vencimento até a data do próximo salário.
- **Prevenção de Dupla Dedução**: Ao liquidar uma conta ("Dar Baixa"), o status muda para `paid` e uma transação é registrada no saldo real. O valor **deixa de ser descontado como pendente**, eliminando qualquer duplicidade.

### 4.2. Limite Diário Sugerido
$$\text{Limite Diário} = \frac{\text{Disponível}}{\text{Dias Restantes até o Salário}}$$

- **Proteção contra Divisão por Zero**: Se a data for hoje ou já tiver passado, o divisor é mantido em no mínimo 1 dia.
- **Tratamento de Déficit**: Se o valor disponível for negativo ($\le 0$), o limite diário é fixado em R$ 0,00 e um aviso neutro sobre o déficit previsto é exibido, sem julgamentos de valor.
- **Precisão Monetária**: Todos os valores são manipulados internamente como **centavos inteiros (`BIGINT`)**, prevenindo erros de arredondamento de ponto flutuante.

---

## 5. Estrutura do Projeto

```
ate-o-fim-do-mes/
├── public/
│   ├── manifest.json              # Manifesto PWA
│   ├── sw.js                      # Service Worker para suporte offline
│   └── icons/
│       └── icon.svg               # Ícone vetorial da marca
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page pública
│   │   ├── cadastro/page.tsx      # Cadastro de usuários
│   │   ├── login/page.tsx         # Acesso à conta
│   │   ├── recuperar-senha/       # Recuperação de senha
│   │   ├── onboarding/page.tsx    # Assistente em 7 etapas
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Layout com cabeçalho e navegação mobile
│   │   │   ├── page.tsx           # Dashboard financeiro principal
│   │   │   ├── transacoes/        # Histórico, filtros e exportação CSV
│   │   │   ├── contas/            # Gestão de compromissos a pagar/receber
│   │   │   ├── metas/             # Tetos mensais e objetivos de poupança
│   │   │   └── configuracoes/     # Perfil, ciclo, exportação LGPD e exclusão
│   │   ├── layout.tsx             # Root layout com providers e tema
│   │   └── globals.css            # Estilos globais e tokens de cor
│   ├── components/
│   │   ├── app-header.tsx         # Cabeçalho da aplicação interna
│   │   ├── mobile-nav.tsx         # Barra de navegação inferior touch
│   │   ├── credit-footer.tsx      # Crédito: "Desenvolvido por Ana Toledo"
│   │   ├── demo-badge.tsx         # Banner de identificação de conta demo
│   │   ├── pwa-register.tsx       # Registro SW e banner de instalação
│   │   └── modals/                # Modais de lançamento, contas e metas
│   └── lib/
│       ├── types.ts               # Tipagens TypeScript completas
│       ├── constants.ts           # Categorias e textos padronizados
│       ├── formatters.ts          # Formatação BRL (PT-BR) e datas
│       ├── financial-engine.ts    # Motor centralizado de cálculos
│       ├── auth/                  # Contexto de autenticação híbrida
│       ├── storage/               # Repositório de persistência e isolamento
│       └── supabase/              # Cliente Supabase e verificação de conexão
├── supabase/
│   └── migrations/
│       └── 20241011000000_initial_schema.sql # Migração PostgreSQL com RLS
├── test/
│   ├── financial-engine.test.mjs  # Testes de unidade do motor financeiro
│   └── form-validation.test.mjs   # Testes de validação de formulários
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 6. Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ (recomendado Node.js 20 ou superior).
- npm 9+.

### Passo a Passo

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar a suíte de testes unitários**:
   ```bash
   npm test
   ```

3. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

4. **Gerar build de produção**:
   ```bash
   npm run build
   ```

---

## 7. Configuração do Supabase (Opcional)

A aplicação foi projetada para funcionar imediatamente mesmo sem chaves externas configuradas, operando em modo isolado local ou de demonstração. Para conectar a um projeto real no Supabase:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse **Project Settings > API** e copie a **URL** e a **Anon Key**.
3. Crie um arquivo `.env.local` na raiz com o conteúdo:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
4. No painel do Supabase, vá em **SQL Editor** e execute o script contido em:
   ```
   supabase/migrations/20241011000000_initial_schema.sql
   ```
   Isso criará automaticamente as tabelas, índices e políticas de Row Level Security (RLS) que garantem isolamento total dos dados de cada usuário.

---

## 8. Conformidade com a LGPD

- **Isolamento de Dados**: Nenhuma informação financeira é compartilhada entre contas.
- **Portabilidade**: O usuário pode exportar o conjunto completo de seus registros no formato JSON (em Configurações) ou CSV (em Transações).
- **Direito ao Esquecimento**: O usuário pode excluir sua conta e expurgar todos os dados associados a qualquer momento.

---

## 9. Crédito de Desenvolvimento

**Desenvolvido por Ana Toledo**
Exibido discretamente no rodapé da landing page e nas páginas internas do aplicativo.
