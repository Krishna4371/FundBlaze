import { http, HttpResponse, delay } from 'msw'
import { mockDonations } from '../fixtures/donations'
import type { Donation } from '@/types/donation.types'

const donations = [...mockDonations]

export const donationHandlers = [
  http.post('/api/v1/donations', async ({ request }) => {
    await delay(1500)
    const body = await request.json() as Partial<Donation>
    
    const newDonation: Donation = {
      id: 'don-' + Date.now(),
      campaignId: body.campaignId || '',
      campaignTitle: 'Campaign',
      amount: body.amount || 0,
      message: body.message,
      anonymous: body.anonymous || false,
      paymentMethod: body.paymentMethod || 'card',
      status: 'completed',
      createdAt: new Date().toISOString(),
    }
    
    donations.unshift(newDonation)
    return HttpResponse.json({ success: true, data: newDonation }, { status: 201 })
  }),

  http.get('/api/v1/donations/:campaignId', async ({ params }) => {
    await delay(400)
    const campaignDonations = donations.filter(d => d.campaignId === params.campaignId)
    return HttpResponse.json({
      success: true,
      data: {
        data: campaignDonations,
        total: campaignDonations.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    })
  }),
]
