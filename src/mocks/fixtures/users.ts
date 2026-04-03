import type { User } from '@/types/user.types'

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    username: 'alex_rivera',
    email: 'alex@fundblaze.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    bio: 'Serial crowdfunder. Passionate about sustainability and community development.',
    role: 'creator',
    verified: true,
    socialLinks: {
      twitter: '@alex_creates',
      linkedin: 'alexrivera',
    },
    stats: {
      totalRaised: 1245000,
      activeCampaigns: 3,
      totalDonors: 2481,
      campaignsBacked: 12,
    },
    createdAt: '2023-10-15T10:00:00Z',
  },
]

export const mockTestUser = {
  email: 'test@fundblaze.com',
  password: 'password123',
  user: mockUsers[0],
}
