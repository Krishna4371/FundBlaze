import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BadgeCheck, Twitter, Linkedin, Globe, ExternalLink } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { CampaignCard } from '@/components/campaign/CampaignCard'
import { Badge } from '@/components/ui/Badge'
import { mockCampaigns } from '@/mocks/fixtures/campaigns'
import { mockUsers } from '@/mocks/fixtures/users'
import { formatCurrency } from '@/utils/formatCurrency'

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const user = mockUsers.find(u => u.username === username) || mockUsers[0]
  const userCampaigns = mockCampaigns.slice(0, 3)

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden mb-8"
        >
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-bg-card shadow-xl"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-sans font-bold text-2xl text-white">{user.name}</h1>
                  {user.verified && <BadgeCheck className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-text-muted text-sm">@{user.username}</p>
              </div>
              <Button variant="ghost" size="sm">Follow</Button>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4 max-w-xl">{user.bio}</p>
            <div className="flex flex-wrap gap-3">
              {user.socialLinks?.twitter && (
                <a href={`https://twitter.com/${user.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-[#1DA1F2] transition-colors">
                  <Twitter className="w-4 h-4" />{user.socialLinks.twitter}
                </a>
              )}
              {user.socialLinks?.linkedin && (
                <a href="#" className="flex items-center gap-1.5 text-xs text-text-muted hover:text-[#0A66C2] transition-colors">
                  <Linkedin className="w-4 h-4" />{user.socialLinks.linkedin}
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Raised', value: formatCurrency(user.stats?.totalRaised || 0) },
            { label: 'Campaigns', value: user.stats?.activeCampaigns || 0 },
            { label: 'Total Donors', value: user.stats?.totalDonors?.toLocaleString() || '0' },
            { label: 'Campaigns Backed', value: user.stats?.campaignsBacked || 0 },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
              <p className="font-sans font-bold text-xl text-white">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="mb-6">
          <h2 className="font-sans font-bold text-xl text-white mb-6">Campaigns Created</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((c, i) => <CampaignCard key={c.id} campaign={c} index={i} />)}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
