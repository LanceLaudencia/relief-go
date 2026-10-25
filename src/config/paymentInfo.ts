import type { PaymentMethod } from '../models/Donation';

export interface PaymentAccount {
  accountName: string;
  accountNumber: string;
  instructions: string[];
}

export const PAYMENT_ACCOUNTS: Record<PaymentMethod, PaymentAccount> = {
  GCash: {
    accountName: 'REPLACE WITH YOUR GCASH ACCOUNT NAME',
    accountNumber: '09XX XXX XXXX',
    instructions: [
      'Open the GCash app and tap "Send Money".',
      'Choose "Express Send" and enter the account number shown above.',
      'Enter the exact amount of your donation.',
      'After sending, copy the 13-digit "Ref No." shown on the receipt.',
    ],
  },
  Maya: {
    accountName: 'REPLACE WITH YOUR MAYA ACCOUNT NAME',
    accountNumber: '09XX XXX XXXX',
    instructions: [
      'Open the Maya app and tap "Send money".',
      'Enter the mobile number shown above.',
      'Enter the exact amount of your donation.',
      'After sending, copy the "Reference ID" shown on the receipt.',
    ],
  },
  Other: {
    accountName: 'Contact the administrator',
    accountNumber: 'REPLACE WITH BANK OR OTHER DETAILS',
    instructions: [
      'Send your donation using the details shown above.',
      'Keep the receipt and copy its reference or transaction number.',
    ],
  },
};