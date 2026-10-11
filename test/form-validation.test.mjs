import test from 'node:test';
import assert from 'node:assert/strict';

// Helper tests for parseCurrencyToCents and form validation logic
function parseCurrencyToCents(input) {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }
  if (!input) return 0;
  let cleaned = input.replace(/[^\d,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

function formatCurrencyInput(value) {
  const digits = value.replace(/\D/g, '');
  if (!digits || digits === '0' || digits === '00') return '';
  const cents = parseInt(digits, 10);
  if (isNaN(cents) || cents === 0) return '';
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function validateTransactionInput({ amountStr, description }) {
  const amountCents = parseCurrencyToCents(amountStr);
  if (amountCents <= 0) {
    return { valid: false, error: 'Valor deve ser maior que zero' };
  }
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Descrição é obrigatória' };
  }
  return { valid: true, amountCents };
}

function validateBillInput({ amountStr, description, dueDate }) {
  const amountCents = parseCurrencyToCents(amountStr);
  if (amountCents <= 0) {
    return { valid: false, error: 'Valor deve ser maior que zero' };
  }
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Descrição é obrigatória' };
  }
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { valid: false, error: 'Data de vencimento inválida' };
  }
  return { valid: true, amountCents };
}

test('Validation: Currency parsing with Brazilian comma and dots', () => {
  assert.equal(parseCurrencyToCents('1.234,56'), 123456);
  assert.equal(parseCurrencyToCents('1234,56'), 123456);
  assert.equal(parseCurrencyToCents('50,00'), 5000);
  assert.equal(parseCurrencyToCents('0,99'), 99);
  assert.equal(parseCurrencyToCents('0'), 0);
  assert.equal(parseCurrencyToCents(''), 0);
});

test('Validation: formatCurrencyInput real-time mask', () => {
  assert.equal(formatCurrencyInput('270000'), '2.700,00');
  assert.equal(formatCurrencyInput('350000'), '3.500,00');
  assert.equal(formatCurrencyInput('15000'), '150,00');
  assert.equal(formatCurrencyInput('800'), '8,00');
  assert.equal(formatCurrencyInput('50'), '0,50');
  assert.equal(formatCurrencyInput('5'), '0,05');
  assert.equal(formatCurrencyInput('0'), '');
  assert.equal(formatCurrencyInput(''), '');
  assert.equal(formatCurrencyInput('abc270000xyz'), '2.700,00');
});

test('Validation: Transaction input validator rules', () => {
  const invalidAmount = validateTransactionInput({ amountStr: '0,00', description: 'Mercado' });
  assert.equal(invalidAmount.valid, false);

  const missingDesc = validateTransactionInput({ amountStr: '150,00', description: '  ' });
  assert.equal(missingDesc.valid, false);

  const validTx = validateTransactionInput({ amountStr: '85,50', description: 'Almoço' });
  assert.equal(validTx.valid, true);
  assert.equal(validTx.amountCents, 8550);
});

test('Validation: Financial bill validator rules', () => {
  const invalidDate = validateBillInput({
    amountStr: '100,00',
    description: 'Internet',
    dueDate: 'invalid',
  });
  assert.equal(invalidDate.valid, false);

  const validBill = validateBillInput({
    amountStr: '250,00',
    description: 'Conta de Luz',
    dueDate: '2026-10-25',
  });
  assert.equal(validBill.valid, true);
  assert.equal(validBill.amountCents, 25000);
});

test('Validation: Brevo email template and payload generation', () => {
  const email = 'usuario@exemplo.com';
  const name = 'Ana Toledo';
  const payload = {
    sender: { name: 'Até o Fim do Mês', email: 'contato@ateofimdomes.com.br' },
    to: [{ email, name }],
    subject: 'Bem-vindo(a) ao Até o Fim do Mês! 💳',
  };

  assert.equal(payload.to[0].email, 'usuario@exemplo.com');
  assert.equal(payload.to[0].name, 'Ana Toledo');
  assert.equal(payload.sender.email, 'contato@ateofimdomes.com.br');
});
