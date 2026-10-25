import { get, push, ref as dbRef, remove, set } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import type { Campaign } from '../models/Campaign';
import type { CampaignUpdate } from '../models/CampaignUpdate';

export interface UpdateFormData {
  title: string;
  message: string;
  imageUrl: string; // empty or an https:// link
}

function friendlyError(error: unknown): Error {
  console.error('Update service error:', error);
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  const denied =
    code.toUpperCase() === 'PERMISSION_DENIED' ||
    message.toUpperCase().includes('PERMISSION_DENIED');

  if (denied) {
    return new Error(
      'Permission denied. You may not be allowed to do this, or the database rules have not been published.'
    );
  }
  return new Error('Something went wrong. Please try again.');
}

/** All updates of a campaign, newest first. Anyone can read updates of public campaigns. */
export async function getCampaignUpdates(campaignId: string): Promise<CampaignUpdate[]> {
  try {
    const snapshot = await get(dbRef(rtdb, `campaignUpdates/${campaignId}`));
    const list: CampaignUpdate[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Partial<CampaignUpdate>;
      list.push({
        id: child.key as string,
        campaignId,
        organizerId: data.organizerId ?? '',
        organizerName: data.organizerName ?? '',
        title: data.title ?? '',
        message: data.message ?? '',
        imageUrl: data.imageUrl ?? '',
        createdAt: data.createdAt ?? '',
      });
    });
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function postCampaignUpdate(
  campaign: Campaign,
  organizer: AppUser,
  form: UpdateFormData
): Promise<string> {
  try {
    const newRef = push(dbRef(rtdb, `campaignUpdates/${campaign.id}`));
    const id = newRef.key as string;
    const imageUrl = form.imageUrl.trim();

    await set(newRef, {
      id,
      campaignId: campaign.id,
      organizerId: organizer.uid,
      organizerName: organizer.displayName,
      title: form.title.trim(),
      message: form.message.trim(),
      ...(imageUrl ? { imageUrl } : {}),
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (error) {
    throw friendlyError(error);
  }
}

export async function deleteCampaignUpdate(campaignId: string, updateId: string): Promise<void> {
  try {
    await remove(dbRef(rtdb, `campaignUpdates/${campaignId}/${updateId}`));
  } catch (error) {
    throw friendlyError(error);
  }
}