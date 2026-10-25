import type { AppUser } from '../models/User';
import type { Campaign } from '../models/Campaign';
import type { Donation } from '../models/Donation';
import type { Expense } from '../models/Expense';
import { daysLeft } from '../utils/format';
import { getAllCampaigns } from './campaignService';
import { getAllDonations } from './donationService';
import { getAllExpenses } from './expenseService';
import { getAllUsers } from './userService';

export interface AdminData {
  users: AppUser[];
  campaigns: Campaign[];
  donations: Donation[];
  expenses: Expense[];
}

export interface LabelValue {
  label: string;
  value: number;
}

export interface ProgressItem {
  label: string;
  raised: number;
  goal: number;
}

export interface AdminStats {
  totalUsers: number;
  activeCampaigns: number;
  verifiedDonationsTotal: number;
  pendingDonations: number;
  pendingExpenses: number;
  approvedExpensesTotal: number;
  nearingDeadline: { id: string; title: string; days: number }[];
}

export interface AdminCharts {
  monthly: LabelValue[];
  categories: LabelValue[];
  statuses: LabelValue[];
  expenseCategories: LabelValue[];
  progress: ProgressItem[];
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Loads everything the admin pages need. Fine for a prototype-sized database. */
export async function loadAdminData(): Promise<AdminData> {
  const [users, campaigns, donations, expenses] = await Promise.all([
    getAllUsers(),
    getAllCampaigns(),
    getAllDonations(),
    getAllExpenses(),
  ]);
  return { users, campaigns, donations, expenses };
}

export function computeAdminStats(data: AdminData): AdminStats {
  const active = data.campaigns.filter((c) => c.status === 'Active');

  const nearingDeadline = active
    .map((c) => ({ id: c.id, title: c.title, days: daysLeft(c.deadline) }))
    .filter((c) => c.days > 0 && c.days <= 7)
    .sort((a, b) => a.days - b.days);

  return {
    totalUsers: data.users.length,
    activeCampaigns: active.length,
    verifiedDonationsTotal: round2(
      data.donations.filter((d) => d.status === 'Verified').reduce((sum, d) => sum + d.amount, 0)
    ),
    pendingDonations: data.donations.filter((d) => d.status === 'Pending Verification').length,
    pendingExpenses: data.expenses.filter((e) => e.status === 'Pending Review').length,
    approvedExpensesTotal: round2(
      data.expenses.filter((e) => e.status === 'Verified').reduce((sum, e) => sum + e.amount, 0)
    ),
    nearingDeadline,
  };
}

export function computeAdminCharts(data: AdminData): AdminCharts {
  // Verified donations for each of the last 6 months
  const months: { key: string; label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }),
      value: 0,
    });
  }
  for (const donation of data.donations) {
    if (donation.status !== 'Verified') continue;
    const month = months.find((m) => m.key === donation.transactionDate.slice(0, 7));
    if (month) month.value = round2(month.value + donation.amount);
  }

  // Campaigns by category
  const categoryCounts = new Map<string, number>();
  for (const campaign of data.campaigns) {
    categoryCounts.set(campaign.category, (categoryCounts.get(campaign.category) ?? 0) + 1);
  }

  // Donations by status
  const statusCounts = new Map<string, number>();
  for (const donation of data.donations) {
    statusCounts.set(donation.status, (statusCounts.get(donation.status) ?? 0) + 1);
  }

  // Verified expenses by category (peso totals)
  const expenseTotals = new Map<string, number>();
  for (const expense of data.expenses) {
    if (expense.status !== 'Verified') continue;
    expenseTotals.set(expense.category, (expenseTotals.get(expense.category) ?? 0) + expense.amount);
  }

  const toList = (map: Map<string, number>): LabelValue[] =>
    Array.from(map.entries())
      .map(([label, value]) => ({ label, value: round2(value) }))
      .sort((a, b) => b.value - a.value);

  // The 6 live campaigns with the most verified donations
  const progress: ProgressItem[] = data.campaigns
    .filter((c) => c.status === 'Active')
    .sort((a, b) => b.verifiedTotal - a.verifiedTotal)
    .slice(0, 6)
    .map((c) => ({
      label: c.title.length > 18 ? `${c.title.slice(0, 17)}…` : c.title,
      raised: c.verifiedTotal,
      goal: c.goalAmount,
    }));

  return {
    monthly: months.map(({ label, value }) => ({ label, value })),
    categories: toList(categoryCounts),
    statuses: toList(statusCounts),
    expenseCategories: toList(expenseTotals),
    progress,
  };
}