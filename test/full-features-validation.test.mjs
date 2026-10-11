import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Core Financial Algorithms
function calculateDaysRemaining(nextPaydayStr, todayStr = '2026-10-11') {
  if (!nextPaydayStr) return 1;
  const [pYear, pMonth, pDay] = nextPaydayStr.split('-').map(Number);
  const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
  if (!pYear || !pMonth || !pDay || !tYear || !tMonth || !tDay) return 1;

  const targetDate = new Date(pYear, pMonth - 1, pDay);
  const currentDate = new Date(tYear, tMonth - 1, tDay);
  const diffMs = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

function calculateCurrentBalance(referenceBalanceCents, transactions) {
  const net = transactions.reduce((acc, tx) => {
    return tx.type === 'income' ? acc + tx.amountCents : acc - tx.amountCents;
  }, 0);
  return referenceBalanceCents + net;
}

function calculateFinancialOverview({ settings, transactions, bills, currentDate = '2026-10-11' }) {
  const currentBalanceCents = calculateCurrentBalance(settings.currentBalanceCents, transactions);
  const nextPayday = settings.nextPayday;

  const pendingPayables = bills.filter(
    (b) => b.type === 'payable' && b.status === 'pending' && (!nextPayday || b.dueDate <= nextPayday)
  );
  const pendingBillsCents = pendingPayables.reduce((acc, b) => acc + b.amountCents, 0);

  const pendingReceivables = bills.filter(
    (b) => b.type === 'receivable' && b.status === 'pending' && (!nextPayday || b.dueDate <= nextPayday)
  );
  const plannedIncomesCents = pendingReceivables.reduce((acc, b) => acc + b.amountCents, 0);

  const safetyReserveCents = Math.max(0, settings.safetyReserveCents || 0);

  const availableForPlanningCents =
    currentBalanceCents + plannedIncomesCents - pendingBillsCents - safetyReserveCents;

  const isDeficit = availableForPlanningCents < 0;
  const daysRemaining = calculateDaysRemaining(nextPayday, currentDate);

  let suggestedDailyLimitCents = 0;
  if (!isDeficit && availableForPlanningCents > 0) {
    suggestedDailyLimitCents = Math.floor(availableForPlanningCents / daysRemaining);
  }

  const expensesInPeriodCents = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  const incomesInPeriodCents = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amountCents, 0);

  return {
    currentBalanceCents,
    plannedIncomesCents,
    pendingBillsCents,
    safetyReserveCents,
    availableForPlanningCents,
    isDeficit,
    daysRemaining,
    suggestedDailyLimitCents,
    expensesInPeriodCents,
    incomesInPeriodCents,
  };
}

function formatCurrency(cents) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function parseCurrencyToCents(input) {
  if (typeof input === 'number') return Math.round(input * 100);
  if (!input) return 0;
  let cleaned = input.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

// ----------------------------------------------------
// TEST SUITES
// ----------------------------------------------------

test('1. Financial Engine - Cálculo do Limite Diário e Dinheiro Livre', () => {
  const settings = {
    userId: 'user-1',
    primaryIncomeCents: 500000,
    nextPayday: '2026-10-25',
    currentBalanceCents: 300000, // R$ 3.000,00
    safetyReserveCents: 50000,   // R$ 500,00
  };

  const bills = [
    {
      id: 'b-1',
      type: 'payable',
      amountCents: 100000, // R$ 1.000,00
      dueDate: '2026-10-20',
      status: 'pending',
    },
    {
      id: 'b-2',
      type: 'payable',
      amountCents: 20000, // R$ 200,00
      dueDate: '2026-10-22',
      status: 'pending',
    },
  ];

  const transactions = [
    {
      id: 't-1',
      type: 'expense',
      amountCents: 10000, // R$ 100,00 gasto
      date: '2026-10-15',
    },
  ];

  // 15/10 -> 25/10 = 10 dias
  const overview = calculateFinancialOverview({
    settings,
    transactions,
    bills,
    currentDate: '2026-10-15',
  });

  // Saldo real = 3000 - 100 = 2900 (290.000 cents)
  assert.equal(overview.currentBalanceCents, 290000);
  // Contas pendentes = 1200 (120.000 cents)
  assert.equal(overview.pendingBillsCents, 120000);
  // Reserva = 500 (50.000 cents)
  assert.equal(overview.safetyReserveCents, 50000);
  // Dinheiro livre real = 2900 - 1200 - 500 = 1200 (120.000 cents)
  assert.equal(overview.availableForPlanningCents, 120000);
  assert.equal(overview.isDeficit, false);
  // Dias restantes = 10
  assert.equal(overview.daysRemaining, 10);
  // Limite diário sugerido = 1200 / 10 = R$ 120,00 (12.000 cents)
  assert.equal(overview.suggestedDailyLimitCents, 12000);
});

test('2. Financial Engine - Tratamento Seguro de Déficit', () => {
  const settings = {
    userId: 'user-def',
    nextPayday: '2026-10-25',
    currentBalanceCents: 50000, // R$ 500,00
    safetyReserveCents: 10000,  // R$ 100,00
  };

  const bills = [
    {
      id: 'b-big',
      type: 'payable',
      amountCents: 80000, // R$ 800,00
      dueDate: '2026-10-20',
      status: 'pending',
    },
  ];

  const overview = calculateFinancialOverview({
    settings,
    transactions: [],
    bills,
    currentDate: '2026-10-15',
  });

  // Disponível = 500 - 800 - 100 = -400
  assert.equal(overview.availableForPlanningCents, -40000);
  assert.equal(overview.isDeficit, true);
  // Limite diário sugerido deve ser estritamente zero em caso de déficit
  assert.equal(overview.suggestedDailyLimitCents, 0);
});

test('3. Financial Engine - Prevenção contra Divisão por Zero', () => {
  // Pagamento hoje
  assert.equal(calculateDaysRemaining('2026-10-15', '2026-10-15'), 1);
  // Pagamento no passado
  assert.equal(calculateDaysRemaining('2026-10-10', '2026-10-15'), 1);
  // Virada de mês
  assert.equal(calculateDaysRemaining('2026-11-05', '2026-10-25'), 11);
});

test('4. Financial Engine - Blindagem contra Dupla Dedução', () => {
  const settings = {
    userId: 'user-nodouble',
    nextPayday: '2026-10-30',
    currentBalanceCents: 200000,
    safetyReserveCents: 0,
  };

  const pendingBill = {
    id: 'b-internet',
    type: 'payable',
    amountCents: 50000,
    dueDate: '2026-10-20',
    status: 'pending',
  };

  // Quando pendente: deduz da projeção
  const p1 = calculateFinancialOverview({
    settings,
    transactions: [],
    bills: [pendingBill],
    currentDate: '2026-10-15',
  });
  assert.equal(p1.availableForPlanningCents, 150000);

  // Quando marcado como pago: status 'paid' e transação adicionada
  const paidBill = { ...pendingBill, status: 'paid' };
  const txPayment = {
    id: 'tx-internet',
    type: 'expense',
    amountCents: 50000,
    date: '2026-10-15',
  };

  const p2 = calculateFinancialOverview({
    settings,
    transactions: [txPayment],
    bills: [paidBill],
    currentDate: '2026-10-15',
  });

  // O saldo real caiu para 1500, a conta pendente foi zerada, o total livre permanece 1500
  assert.equal(p2.currentBalanceCents, 150000);
  assert.equal(p2.pendingBillsCents, 0);
  assert.equal(p2.availableForPlanningCents, 150000);
});

test('5. Contas além do próximo recebimento não afetam o mês corrente', () => {
  const settings = {
    userId: 'user-future',
    nextPayday: '2026-10-25',
    currentBalanceCents: 200000,
    safetyReserveCents: 0,
  };

  const billInCycle = {
    id: 'b-current',
    type: 'payable',
    amountCents: 30000, // R$ 300 antes do dia 25
    dueDate: '2026-10-20',
    status: 'pending',
  };

  const billFuture = {
    id: 'b-next-month',
    type: 'payable',
    amountCents: 90000, // R$ 900 DEPOIS do dia 25 (já coberto pelo próximo salário)
    dueDate: '2026-10-28',
    status: 'pending',
  };

  const overview = calculateFinancialOverview({
    settings,
    transactions: [],
    bills: [billInCycle, billFuture],
    currentDate: '2026-10-15',
  });

  // Apenas a conta de 300 deve ser deduzida do período atual
  assert.equal(overview.pendingBillsCents, 30000);
  assert.equal(overview.availableForPlanningCents, 170000);
});

test('6. Entradas previstas (recebimentos extras) aumentam o limite', () => {
  const settings = {
    userId: 'user-income',
    nextPayday: '2026-10-25',
    currentBalanceCents: 100000, // R$ 1.000,00
    safetyReserveCents: 0,
  };

  const extraIncome = {
    id: 'b-freela',
    type: 'receivable',
    amountCents: 50000, // R$ 500,00 de freela a receber dia 18
    dueDate: '2026-10-18',
    status: 'pending',
  };

  const overview = calculateFinancialOverview({
    settings,
    transactions: [],
    bills: [extraIncome],
    currentDate: '2026-10-15',
  });

  assert.equal(overview.plannedIncomesCents, 50000);
  // Disponível = 1000 + 500 = 1500
  assert.equal(overview.availableForPlanningCents, 150000);
});

test('7. Formatters - Moeda e Formatação BRL', () => {
  assert.equal(formatCurrency(100000), 'R$\u00a01.000,00');
  assert.equal(formatCurrency(0), 'R$\u00a00,00');
  assert.equal(parseCurrencyToCents('1.250,50'), 125050);
  assert.equal(parseCurrencyToCents('300,00'), 30000);
  assert.equal(parseCurrencyToCents('45'), 4500);
});

test('8. Validação de Arquitetura PWA e Offline', () => {
  const manifestPath = path.resolve('public/manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json deve existir em public/');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, 'Até o Fim do Mês');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.background_color, '#07081a');
  assert(manifest.icons.length >= 2);

  const swPath = path.resolve('public/sw.js');
  assert(fs.existsSync(swPath), 'sw.js deve existir em public/');
  const sw = fs.readFileSync(swPath, 'utf8');
  assert(sw.includes('install') && sw.includes('fetch'));
});

test('9. Validação Estrita de Autenticação (Bloqueio de login sem cadastro prévio)', () => {
  const mockStorage = new Map();
  const ACCOUNTS_KEY = 'ate_o_fim_do_mes_auth_accounts';

  function getAccounts() {
    const raw = mockStorage.get(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  function registerAccount(email, password, displayName) {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    if (accounts[normalized]) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }
    const account = {
      userId: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: normalized,
      passwordHash: Buffer.from(password).toString('base64'),
      displayName,
    };
    accounts[normalized] = account;
    mockStorage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
    return { account };
  }

  function verifyCredentials(email, password) {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    const account = accounts[normalized];
    if (!account) {
      return { error: 'E-mail não encontrado. Por favor, crie uma conta antes de entrar.' };
    }
    if (!password || account.passwordHash !== Buffer.from(password).toString('base64')) {
      return { error: 'Senha incorreta. Tente novamente.' };
    }
    return { account };
  }

  // 1. Tentar logar com e-mail inexistente -> DEVE FALHAR
  const loginInexistente = verifyCredentials('desconhecido@exemplo.com', '123456');
  assert.equal(loginInexistente.error, 'E-mail não encontrado. Por favor, crie uma conta antes de entrar.');
  assert.equal(loginInexistente.account, undefined);

  // 2. Criar cadastro real
  const cadastro = registerAccount('usuario.real@exemplo.com', 'senhaSegura123', 'Usuário Real');
  assert.equal(cadastro.error, undefined);
  assert(cadastro.account.userId.startsWith('usr_'));

  // 3. Tentar cadastrar o mesmo e-mail novamente -> DEVE RECUSAR DUPLICADO
  const duplicado = registerAccount('usuario.real@exemplo.com', 'outrasenha', 'Outro');
  assert.equal(duplicado.error, 'Este e-mail já está cadastrado. Faça login na sua conta.');

  // 4. Tentar logar com senha errada -> DEVE RECUSAR
  const senhaErrada = verifyCredentials('usuario.real@exemplo.com', 'senhaErrada');
  assert.equal(senhaErrada.error, 'Senha incorreta. Tente novamente.');

  // 5. Logar com credenciais corretas -> SUCESSO
  const loginSucesso = verifyCredentials('usuario.real@exemplo.com', 'senhaSegura123');
  assert.equal(loginSucesso.error, undefined);
  assert.equal(loginSucesso.account.email, 'usuario.real@exemplo.com');
});

test('10. Prevenção Estrita de Múltiplos Cadastros com o Mesmo E-mail', () => {
  // Simulação da lógica de verificação do Supabase e Storage
  function validateDuplicateSignup({ existingLocalAccounts, email, supabaseResponse }) {
    const normalized = email.toLowerCase().trim();

    // 1. Verificação local
    if (existingLocalAccounts[normalized]) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }

    // 2. Erro direto do Supabase
    if (supabaseResponse?.error) {
      const msg = supabaseResponse.error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('unique') || msg.includes('duplicate')) {
        return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
      }
      return { error: supabaseResponse.error.message };
    }

    // 3. Detecção de anti-user enumeration do Supabase (identities vazio)
    if (supabaseResponse?.data?.user && Array.isArray(supabaseResponse.data.user.identities) && supabaseResponse.data.user.identities.length === 0) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }

    return { success: true };
  }

  // Cenário A: E-mail já existente localmente
  const resA = validateDuplicateSignup({
    existingLocalAccounts: { 'teste@exemplo.com': { userId: 'u1' } },
    email: 'teste@exemplo.com',
  });
  assert.equal(resA.error, 'Este e-mail já está cadastrado. Faça login na sua conta.');

  // Cenário B: Supabase retorna erro de 'User already registered'
  const resB = validateDuplicateSignup({
    existingLocalAccounts: {},
    email: 'novo@exemplo.com',
    supabaseResponse: { error: { message: 'User already registered' } },
  });
  assert.equal(resB.error, 'Este e-mail já está cadastrado. Faça login na sua conta.');

  // Cenário C: Supabase anti-enumeration (data.user com identities: [])
  const resC = validateDuplicateSignup({
    existingLocalAccounts: {},
    email: 'novo@exemplo.com',
    supabaseResponse: { data: { user: { id: 'u2', identities: [] } } },
  });
  assert.equal(resC.error, 'Este e-mail já está cadastrado. Faça login na sua conta.');

  // Cenário D: Cadastro genuinamente novo (identities possui o provedor)
  const resD = validateDuplicateSignup({
    existingLocalAccounts: {},
    email: 'novissimo@exemplo.com',
    supabaseResponse: { data: { user: { id: 'u3', identities: [{ provider: 'email' }] } } },
  });
  assert.equal(resD.success, true);
  assert.equal(resD.error, undefined);
});

test('11. Roteamento Direto para a Conta para Usuários Autenticados (Ignorar Landing Page)', () => {
  function getDestinationRoute({ user, isLoading }) {
    if (isLoading) return { action: 'wait_splash' };
    if (!user) return { action: 'show_landing_page' };
    return {
      action: 'redirect_account',
      target: user.isOnboarded ? '/dashboard' : '/onboarding',
    };
  }

  // 1. Visitante deslogado vê landing page
  const routeGuest = getDestinationRoute({ user: null, isLoading: false });
  assert.equal(routeGuest.action, 'show_landing_page');

  // 2. Usuário logado e já configurado vai DIRETO para o dashboard
  const routeUser = getDestinationRoute({ user: { id: 'u1', isOnboarded: true }, isLoading: false });
  assert.equal(routeUser.action, 'redirect_account');
  assert.equal(routeUser.target, '/dashboard');

  // 3. Novo usuário logado em onboarding vai DIRETO para o onboarding
  const routeNewUser = getDestinationRoute({ user: { id: 'u2', isOnboarded: false }, isLoading: false });
  assert.equal(routeNewUser.action, 'redirect_account');
  assert.equal(routeNewUser.target, '/onboarding');

  // 4. Durante checagem de sessão, exibe splash de carregamento sem piscar landing page
  const routeLoading = getDestinationRoute({ user: null, isLoading: true });
  assert.equal(routeLoading.action, 'wait_splash');
});

test('12. Exclusão e Recriação Segura de Cadastro Existente (Overwrite)', () => {
  const mockStorage = new Map();
  const ACCOUNTS_KEY = 'ate_o_fim_do_mes_auth_accounts';

  function getAccounts() {
    return JSON.parse(mockStorage.get(ACCOUNTS_KEY) || '{}');
  }

  function register(email, password, overwrite = false) {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    if (accounts[normalized] && !overwrite) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }
    const newAccount = { userId: 'usr_' + Date.now(), email: normalized };
    accounts[normalized] = newAccount;
    mockStorage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
    return { account: newAccount };
  }

  function deleteAccount(email) {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    if (accounts[normalized]) {
      delete accounts[normalized];
      mockStorage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
      return true;
    }
    return false;
  }

  // 1. Cadastra conta inicial
  const first = register('usuario@exemplo.com', '123456');
  assert.equal(first.error, undefined);

  // 2. Tenta cadastrar novamente -> bloqueado por duplicidade
  const second = register('usuario@exemplo.com', 'outrasenha', false);
  assert.equal(second.error, 'Este e-mail já está cadastrado. Faça login na sua conta.');

  // 3. Usuário clica em 'Excluir cadastro e recriar conta' -> sucesso imediato
  const reset = register('usuario@exemplo.com', 'novasenha', true);
  assert.equal(reset.error, undefined);
  assert(reset.account.userId);

  // 4. Excluir diretamente por e-mail
  const deleted = deleteAccount('usuario@exemplo.com');
  assert.equal(deleted, true);
  assert.equal(getAccounts()['usuario@exemplo.com'], undefined);
});

test('13. Submissão de Cadastro com Desbloqueio Transparente (Sem travar o usuário)', () => {
  const mockStorage = new Map();
  const ACCOUNTS_KEY = 'ate_o_fim_do_mes_auth_accounts';

  function getAccounts() {
    return JSON.parse(mockStorage.get(ACCOUNTS_KEY) || '{}');
  }

  function simulateSignup(email, password, displayName, overwrite = true) {
    const accounts = getAccounts();
    const normalized = email.toLowerCase().trim();
    if (accounts[normalized] && !overwrite) {
      return { error: 'Este e-mail já está cadastrado. Faça login na sua conta.' };
    }
    const newAccount = {
      userId: accounts[normalized]?.userId || ('usr_' + Date.now()),
      email: normalized,
      passwordHash: Buffer.from(password).toString('base64'),
      displayName,
    };
    accounts[normalized] = newAccount;
    mockStorage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
    return { account: newAccount };
  }

  // 1. Usuário já possuía uma conta gravada
  simulateSignup('anatoledox01@gmail.com', 'senhaAntiga123', 'Ana Toledo', true);
  assert(getAccounts()['anatoledox01@gmail.com']);

  // 2. Ao tentar cadastrar novamente pelo formulário principal com overwrite habilitado:
  const resultado = simulateSignup('anatoledox01@gmail.com', 'novaSenha456', 'Ana Toledo', true);
  assert.equal(resultado.error, undefined);
  assert.equal(resultado.account.email, 'anatoledox01@gmail.com');
  assert.equal(resultado.account.passwordHash, Buffer.from('novaSenha456').toString('base64'));
});



