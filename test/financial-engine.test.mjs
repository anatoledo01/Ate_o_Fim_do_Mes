import test from 'node:test';
import assert from 'node:assert/strict';

// Helper functions mirroring financial-engine for standalone fast testing
function calculateDaysRemaining(nextPaydayStr, todayStr) {
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

function calculateFinancialOverview({ settings, transactions, bills, currentDate }) {
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

  return {
    currentBalanceCents,
    plannedIncomesCents,
    pendingBillsCents,
    safetyReserveCents,
    availableForPlanningCents,
    isDeficit,
    daysRemaining,
    suggestedDailyLimitCents,
  };
}

test('Financial Engine: Calculates available money and daily limit correctly', () => {
  const settings = {
    currentBalanceCents: 300000, // R$ 3.000,00
    nextPayday: '2026-10-31',
    safetyReserveCents: 50000,   // R$ 500,00
  };

  const bills = [
    { type: 'payable', status: 'pending', amountCents: 100000, dueDate: '2026-10-20' }, // R$ 1.000,00
  ];

  const transactions = [
    { type: 'expense', amountCents: 20000 }, // R$ 200,00 spent
  ];

  // Today is 2026-10-11, Payday is 2026-10-31 -> 20 days remaining
  const result = calculateFinancialOverview({
    settings,
    transactions,
    bills,
    currentDate: '2026-10-11',
  });

  // Current balance = 3000 - 200 = 2800 (280000 cents)
  assert.equal(result.currentBalanceCents, 280000);
  
  // Available = 2800 (current) - 1000 (pending bills) - 500 (reserve) = 1300 (130000 cents)
  assert.equal(result.availableForPlanningCents, 130000);
  assert.equal(result.isDeficit, false);
  assert.equal(result.daysRemaining, 20);

  // Suggested daily limit = 130000 / 20 = 6500 cents (R$ 65,00/day)
  assert.equal(result.suggestedDailyLimitCents, 6500);
});

test('Financial Engine: Prevents division by zero and handles payday today', () => {
  const days = calculateDaysRemaining('2026-10-11', '2026-10-11');
  assert.equal(days, 1);

  const daysPast = calculateDaysRemaining('2026-10-10', '2026-10-11');
  assert.equal(daysPast, 1);
});

test('Financial Engine: Handles deficit and never displays positive daily limit when negative', () => {
  const settings = {
    currentBalanceCents: 50000, // R$ 500,00
    nextPayday: '2026-10-25',
    safetyReserveCents: 20000,  // R$ 200,00
  };

  const bills = [
    { type: 'payable', status: 'pending', amountCents: 80000, dueDate: '2026-10-15' }, // R$ 800,00
  ];

  // Available = 500 - 800 - 200 = -500 (deficit of R$ 500,00)
  const result = calculateFinancialOverview({
    settings,
    transactions: [],
    bills,
    currentDate: '2026-10-11',
  });

  assert.equal(result.availableForPlanningCents, -50000);
  assert.equal(result.isDeficit, true);
  assert.equal(result.suggestedDailyLimitCents, 0); // Must be zero, never negative or misleading!
});

test('Financial Engine: Prevents double deduction when bill is marked as paid', () => {
  const settings = {
    currentBalanceCents: 200000, // R$ 2.000,00
    nextPayday: '2026-10-25',
    safetyReserveCents: 0,
  };

  // Scenario A: Bill is pending
  const billsPending = [
    { id: 'bill-1', type: 'payable', status: 'pending', amountCents: 50000, dueDate: '2026-10-15' },
  ];
  const overviewPending = calculateFinancialOverview({
    settings,
    transactions: [],
    bills: billsPending,
    currentDate: '2026-10-11',
  });
  // Current balance: 2000, Available: 1500
  assert.equal(overviewPending.currentBalanceCents, 200000);
  assert.equal(overviewPending.availableForPlanningCents, 150000);

  // Scenario B: Bill is marked as paid.
  // Bill status changes to 'paid', and an expense transaction is recorded.
  const billsPaid = [
    { id: 'bill-1', type: 'payable', status: 'paid', amountCents: 50000, dueDate: '2026-10-15' },
  ];
  const transactionsAfterPayment = [
    { type: 'expense', amountCents: 50000, billId: 'bill-1' },
  ];
  const overviewPaid = calculateFinancialOverview({
    settings,
    transactions: transactionsAfterPayment,
    bills: billsPaid,
    currentDate: '2026-10-11',
  });

  // Current balance reduced to 1500 (via transaction)
  assert.equal(overviewPaid.currentBalanceCents, 150000);
  // Pending bills is 0 (since status is paid)
  assert.equal(overviewPaid.pendingBillsCents, 0);
  // Available money remains exactly 1500 (NOT deducted twice to 1000!)
  assert.equal(overviewPaid.availableForPlanningCents, 150000);
});
