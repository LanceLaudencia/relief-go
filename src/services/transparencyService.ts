import type { Campaign } from '../models/Campaign';
import type { ExpenseCategory, PublicExpense } from '../models/Expense';
import { getCampaignById } from './campaignService';
import { getPublicExpenses } from './expenseService';

export interface CategoryTotal {
  category: ExpenseCategory;
  total: number;
  percent: number; // share of all approved expenses, 0 to 100
}

export interface TransparencySummary {
  goalAmount: number;
  verifiedDonations: number;
  approvedExpenses: number;
  remainingFunds: number; // verified donations minus approved expenses
  expensesExceedDonations: boolean;
  breakdown: CategoryTotal[];
}

export interface TransparencyData {
  campaign: Campaign;
  expenses: PublicExpense[];
  summary: TransparencySummary;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Works out the report numbers.
 * Remaining Documented Funds = Total Verified Donations - Total Approved Documented Expenses
 */
export function buildSummary(campaign: Campaign, expenses: PublicExpense[]): TransparencySummary {
  const approvedExpenses = round2(expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const verifiedDonations = round2(campaign.verifiedTotal);
  const remainingFunds = round2(verifiedDonations - approvedExpenses);

  const byCategory = new Map<ExpenseCategory, number>();
  for (const expense of expenses) {
    byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount);
  }

  const breakdown: CategoryTotal[] = Array.from(byCategory.entries())
    .map(([category, total]) => ({
      category,
      total: round2(total),
      percent: approvedExpenses > 0 ? Math.round((total / approvedExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    goalAmount: campaign.goalAmount,
    verifiedDonations,
    approvedExpenses,
    remainingFunds,
    expensesExceedDonations: approvedExpenses > verifiedDonations,
    breakdown,
  };
}

/** Loads everything the public transparency page needs. Returns null if the campaign is not public. */
export async function getTransparencyData(campaignId: string): Promise<TransparencyData | null> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return null;

  const expenses = await getPublicExpenses(campaignId);
  return { campaign, expenses, summary: buildSummary(campaign, expenses) };
}