import { alertController, toastController } from '@ionic/vue';
import type { CampaignStatus } from '../models/Campaign';
import type { DonationStatus } from '../models/Donation';
import type { ExpenseStatus } from '../models/Expense';

export async function showToast(
  message: string,
  color: 'success' | 'danger' = 'success'
): Promise<void> {
  const toast = await toastController.create({
    message,
    duration: 2800,
    color,
    position: 'bottom',
  });
  await toast.present();
}

/** Shows a Cancel / Confirm dialog. Returns true if the person confirmed. */
export async function confirmAction(
  header: string,
  message: string,
  confirmText = 'Confirm'
): Promise<boolean> {
  const alert = await alertController.create({
    header,
    message,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: confirmText, role: 'confirm' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'confirm';
}

/** Asks for a written reason. Returns the reason, or null if cancelled. */
export async function askReason(
  header: string,
  message: string,
  confirmText: string
): Promise<string | null> {
  const alert = await alertController.create({
    header,
    message,
    inputs: [{ name: 'reason', type: 'textarea', placeholder: 'Type the reason here' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: confirmText,
        role: 'confirm',
        // Returning false keeps the dialog open until a reason is typed
        handler: (value: { reason?: string }) => Boolean(value?.reason?.trim()),
      },
    ],
  });
  await alert.present();
  const { role, data } = await alert.onDidDismiss();
  if (role !== 'confirm') return null;
  const reason = String(data?.values?.reason ?? '').trim();
  return reason || null;
}

export function campaignStatusColor(status: CampaignStatus): string {
  switch (status) {
    case 'Approved':
    case 'Active':
      return 'success';
    case 'Pending Approval':
      return 'warning';
    case 'Rejected':
    case 'Suspended':
      return 'danger';
    default:
      return 'medium';
  }
}

export function donationStatusColor(status: DonationStatus): string {
  switch (status) {
    case 'Verified':
      return 'success';
    case 'Pending Verification':
      return 'warning';
    case 'Rejected':
      return 'danger';
    default:
      return 'medium';
  }
}

export function expenseStatusColor(status: ExpenseStatus): string {
  switch (status) {
    case 'Verified':
      return 'success';
    case 'Pending Review':
      return 'warning';
    case 'Rejected':
      return 'danger';
    default:
      return 'medium';
  }
}