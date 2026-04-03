import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { donationService } from '@/services/donation.service'
import { campaignKeys } from './useCampaigns'
import type { CreateDonationDto } from '@/types/donation.types'

export function useCampaignDonations(campaignId: string) {
  return useQuery({
    queryKey: ['donations', campaignId],
    queryFn: () => donationService.getCampaignDonations(campaignId),
    enabled: !!campaignId,
  })
}

export function useDonate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDonationDto) => donationService.createDonation(data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['donations', variables.campaignId] })
      qc.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}
