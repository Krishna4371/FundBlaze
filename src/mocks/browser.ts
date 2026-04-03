import { api } from '@/services/api'
import { mockCampaigns, trendingCampaigns } from './fixtures/campaigns'
import { mockUsers, mockTestUser } from './fixtures/users'
import { mockDonations } from './fixtures/donations'
import type { Campaign } from '@/types/campaign.types'
import type { Donation } from '@/types/donation.types'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

let campaigns = [...mockCampaigns]
const donations = [...mockDonations]

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse {
  return { data: { success: true, data }, status, statusText: 'OK', headers: { 'content-type': 'application/json' }, config }
}

function fail(message: string, status: number, config: InternalAxiosRequestConfig): never {
  const err: any = new Error(message)
  err.response = { data: { success: false, message }, status, statusText: 'Error', headers: {}, config }
  throw err
}

async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method || 'get').toLowerCase()
  const url = (config.url || '').replace(/^\//, '')
  const params = config.params || {}

  let body: Record<string, any> = {}
  try { body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {}) } catch {}

  // Simulate network delay
  await new Promise(r => setTimeout(r, 350))

  // ── AUTH ──────────────────────────────────────────────────────────
  if (method === 'post' && url.includes('auth/login')) {
    if (body.email === mockTestUser.email && body.password === mockTestUser.password) {
      return ok({ user: mockTestUser.user, accessToken: 'mock-access-token-xyz' }, config)
    }
    fail('Invalid email or password', 401, config)
  }

  if (method === 'post' && url.includes('auth/signup')) {
    const newUser = { ...mockUsers[0], id: 'new-' + Date.now(), name: body.name, email: body.email, role: body.role }
    return ok({ user: newUser, accessToken: 'mock-token-new' }, config)
  }

  if (method === 'post' && url.includes('auth/logout')) {
    return ok({ message: 'Logged out' }, config)
  }

  if (method === 'post' && url.includes('auth/refresh')) {
    return ok({ accessToken: 'mock-refreshed-token' }, config)
  }

  if (method === 'get' && url.includes('auth/me')) {
    const auth = (config.headers as any)?.Authorization
    if (!auth) fail('Unauthorized', 401, config)
    return ok(mockUsers[0], config)
  }

  // ── CAMPAIGNS ─────────────────────────────────────────────────────
  if (method === 'get' && url.includes('campaigns/trending')) {
    return ok(trendingCampaigns, config)
  }

  // Single campaign by slug/id — must come before list
  const slugMatch = url.match(/campaigns\/([^/?]+)$/)
  if (method === 'get' && slugMatch) {
    const slug = slugMatch[1]
    const campaign = campaigns.find(c => c.slug === slug || c.id === slug)
    if (!campaign) fail('Campaign not found', 404, config)
    return ok(campaign, config)
  }

  if (method === 'get' && url.includes('campaigns')) {
    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '9')
    const category = params.category
    const sort = params.sort
    const q = params.q

    let filtered = campaigns.filter(c => c.status === 'active' || c.status === 'funded')
    if (category && category !== 'all') filtered = filtered.filter(c => c.category.toLowerCase() === category.toLowerCase())
    if (q) {
      const lq = q.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(lq) ||
        c.shortDescription.toLowerCase().includes(lq) ||
        c.tags.some((t: string) => t.toLowerCase().includes(lq))
      )
    }
    if (sort === 'most_funded') filtered.sort((a, b) => b.raisedAmount / b.goalAmount - a.raisedAmount / a.goalAmount)
    else if (sort === 'newest') filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (sort === 'ending_soon') filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    else filtered.sort((a, b) => b.donorCount - a.donorCount)

    const start = (page - 1) * limit
    return ok({ data: filtered.slice(start, start + limit), total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) }, config)
  }

  if (method === 'post' && url.includes('campaigns')) {
    const newCampaign: Campaign = {
      id: 'new-' + Date.now(),
      slug: (body.title || 'untitled').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      title: body.title || 'Untitled',
      shortDescription: body.shortDescription || '',
      story: body.story || '',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
      category: body.category || 'Community',
      tags: body.tags || [],
      status: 'active',
      goalAmount: body.goalAmount || 100000,
      raisedAmount: 0,
      donorCount: 0,
      deadline: body.deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
      minDonation: body.minDonation || 100,
      creator: { id: 'u1', name: 'Alex Rivera', username: 'alex_rivera', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80', bio: '', verified: true, joinedAt: '2023-10-15', totalCampaigns: 1, totalRaised: 0 },
      updates: [],
      rewardTiers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    campaigns.unshift(newCampaign)
    return ok(newCampaign, config, 201)
  }

  // ── DONATIONS ─────────────────────────────────────────────────────
  if (method === 'post' && url.includes('donations')) {
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
    return ok(newDonation, config, 201)
  }

  if (method === 'get' && url.includes('donations')) {
    const campaignId = url.split('donations/').pop()?.split('?')[0]
    const list = donations.filter(d => d.campaignId === campaignId)
    return ok({ data: list, total: list.length, page: 1, limit: 10, totalPages: 1 }, config)
  }

  fail('Not found', 404, config)
}

export function setupMocks() {
  api.defaults.adapter = mockAdapter
  console.log('[Mock API] Axios mock adapter active — no service worker needed')
}
