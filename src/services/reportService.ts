import type { AdminData } from './adminDataService';

export type ReportType = 'campaigns' | 'donations' | 'expenses';
export type ColumnType = 'text' | 'money' | 'date' | 'number';

export interface ReportColumn {
  key: string;
  label: string;
  type: ColumnType;
}

export type ReportRow = Record<string, string | number>;

export interface ReportTable {
  columns: ReportColumn[];
  rows: ReportRow[];
  totalAmount: number;
  totalLabel: string;
}

export interface ReportFilters {
  campaignId: string; // a campaign id, or "All"
  category: string; // a campaign category, or "All"
  status: string; // a status of the chosen report type, or "All"
  dateFrom: string; // YYYY-MM-DD, or ""
  dateTo: string; // YYYY-MM-DD, or ""
}

export const ALL = 'All';

export const REPORT_STATUS_OPTIONS: Record<ReportType, string[]> = {
  campaigns: ['Active', 'Suspended', 'Completed', 'Pending Approval', 'Approved', 'Rejected'],
  donations: ['Pending Verification', 'Verified', 'Rejected', 'Refunded'],
  expenses: ['Pending Review', 'Verified', 'Rejected'],
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Compares only the date part (YYYY-MM-DD) of a timestamp with the chosen range. */
function inRange(iso: string, from: string, to: string): boolean {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function buildReport(
  type: ReportType,
  data: AdminData,
  filters: ReportFilters
): ReportTable {
  const campaignById = new Map(data.campaigns.map((c) => [c.id, c]));

  if (type === 'campaigns') {
    const rows = data.campaigns
      .filter((c) => filters.campaignId === ALL || c.id === filters.campaignId)
      .filter((c) => filters.category === ALL || c.category === filters.category)
      .filter((c) => filters.status === ALL || c.status === filters.status)
      .filter((c) => inRange(c.createdAt, filters.dateFrom, filters.dateTo))
      .map<ReportRow>((c) => ({
        title: c.title,
        organizer: c.organizerName,
        category: c.category,
        status: c.status,
        goal: c.goalAmount,
        raised: c.verifiedTotal,
        donors: c.verifiedDonorCount,
        deadline: c.deadline,
        created: c.createdAt,
      }));

    return {
      columns: [
        { key: 'title', label: 'Campaign', type: 'text' },
        { key: 'organizer', label: 'Owner', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'goal', label: 'Goal', type: 'money' },
        { key: 'raised', label: 'Verified donations', type: 'money' },
        { key: 'donors', label: 'Verified donors', type: 'number' },
        { key: 'deadline', label: 'Deadline', type: 'date' },
        { key: 'created', label: 'Created', type: 'date' },
      ],
      rows,
      totalAmount: round2(rows.reduce((sum, row) => sum + Number(row.raised), 0)),
      totalLabel: 'Total verified donations',
    };
  }

  if (type === 'donations') {
    const rows = data.donations
      .filter((d) => filters.campaignId === ALL || d.campaignId === filters.campaignId)
      .filter(
        (d) =>
          filters.category === ALL || campaignById.get(d.campaignId)?.category === filters.category
      )
      .filter((d) => filters.status === ALL || d.status === filters.status)
      .filter((d) => inRange(d.transactionDate, filters.dateFrom, filters.dateTo))
      .map<ReportRow>((d) => ({
        date: d.transactionDate,
        campaign: d.campaignTitle,
        donor: d.donorName,
        amount: d.amount,
        method: d.paymentMethod,
        reference: d.referenceNumber,
        status: d.status,
        reason: d.rejectionReason,
      }));

    return {
      columns: [
        { key: 'date', label: 'Submitted', type: 'date' },
        { key: 'campaign', label: 'Campaign', type: 'text' },
        { key: 'donor', label: 'Donor account', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'money' },
        { key: 'method', label: 'Method', type: 'text' },
        { key: 'reference', label: 'Reference no.', type: 'text' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'reason', label: 'Rejection reason', type: 'text' },
      ],
      rows,
      totalAmount: round2(rows.reduce((sum, row) => sum + Number(row.amount), 0)),
      totalLabel: 'Total amount in this list',
    };
  }

  const rows = data.expenses
    .filter((e) => filters.campaignId === ALL || e.campaignId === filters.campaignId)
    .filter(
      (e) =>
        filters.category === ALL || campaignById.get(e.campaignId)?.category === filters.category
    )
    .filter((e) => filters.status === ALL || e.status === filters.status)
    .filter((e) => inRange(e.expenseDate, filters.dateFrom, filters.dateTo))
    .map<ReportRow>((e) => ({
      date: e.expenseDate,
      campaign: e.campaignTitle,
      owner: e.organizerName,
      category: e.category,
      description: e.description,
      amount: e.amount,
      documents: e.documents.length,
      status: e.status,
      reason: e.rejectionReason,
    }));

  return {
    columns: [
      { key: 'date', label: 'Expense date', type: 'date' },
      { key: 'campaign', label: 'Campaign', type: 'text' },
      { key: 'owner', label: 'Submitted by', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'documents', label: 'Documents', type: 'number' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'reason', label: 'Rejection reason', type: 'text' },
    ],
    rows,
    totalAmount: round2(rows.reduce((sum, row) => sum + Number(row.amount), 0)),
    totalLabel: 'Total amount in this list',
  };
}

/* ---------- CSV download ---------- */

function csvCell(value: string | number): string {
  if (typeof value === 'number') return String(value);

  // Text that starts with = + - @ can run as a formula when opened in Excel, so defuse it
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csvValue(column: ReportColumn, value: string | number | undefined): string | number {
  if (value === undefined) return '';
  if (column.type === 'money') return Number(value).toFixed(2);
  if (column.type === 'date') return String(value).slice(0, 10);
  return value;
}

export function reportToCsv(table: ReportTable): string {
  const header = table.columns.map((col) => csvCell(col.label)).join(',');
  const lines = table.rows.map((row) =>
    table.columns.map((col) => csvCell(csvValue(col, row[col.key]))).join(',')
  );
  // The leading mark helps Excel read names and symbols correctly
  return `\uFEFF${[header, ...lines].join('\r\n')}`;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}