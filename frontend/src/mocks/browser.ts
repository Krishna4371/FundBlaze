import { setupWorker } from 'msw/browser'
import { authHandlers } from './handlers/auth.handlers'
import { campaignHandlers } from './handlers/campaign.handlers'
import { donationHandlers } from './handlers/donation.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...campaignHandlers,
  ...donationHandlers
)
