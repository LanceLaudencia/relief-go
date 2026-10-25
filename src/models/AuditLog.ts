export type AuditTargetType = 'campaign' | 'donation' | 'expense' | 'user';

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string; // for example "Verified donation"
  targetType: AuditTargetType;
  targetId: string;
  details: string;
  createdAt: string; // ISO date string
}
