import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, Flame, Users, TrendingUp, Download, Plus, Edit, ExternalLink, Share2, Trash2, ArrowUpRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/campaign/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { mockCampaigns } from '@/mocks/fixtures/campaigns'
import { mockDonations } from '@/mocks/fixtures/donations'
import { formatCurrency } from '@/utils/formatCurrency'
import { getTimeAgo } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

// Mock chart data
const weeklyData = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 1900 },
  { day: 'Wed', amount: 1600 },
  { day: 'Thu', amount: 2800 },
  { day: 'Fri', amount: 3900 },
  { day: 'Sat', amount: 4200 },
  { day: 'Sun', amount: 4500 },
]

const sourceData = [
  { name: 'Social Media', value: 42, color: '#FF6B00' },
  { name: 'Direct Access', value: 28, color: '#8B5CF6' },
  { name: 'Organic Search', value: 18, color: '#00D68F' },
  { name: 'Referrals', value: 12, color: '#FFB300' },
]

const dashCampaigns = mockCampaigns.slice(0, 3).map((c, i) => ({
  ...c,
  status: (['active', 'draft', 'funded'] as const)[i],
}))

const TABS = ['Overview', 'My Campaigns', 'Donations', 'Analytics', 'Settings']

const statusVariant: Record<string, 'success' | 'warning' | 'default' | 'gold'> = {
  active: 'success',
  draft: 'warning',
  funded: 'gold',
  ended: 'default',
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Overview')

  const stats = [
    { icon: DollarSign, label: 'Total Raised', value: '₹12.45L', change: '+12.5% this month', up: true },
    { icon: Flame, label: 'Active Campaigns', value: '3', change: '+4.2% this month', up: true },
    { icon: Users, label: 'Total Donors', value: '2,481', change: '+4.2% this month', up: true },
    { icon: TrendingUp, label: 'Avg. Donation', value: '₹4,250', change: '+0.8% this month', up: true },
  ]

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-sans font-extrabold text-3xl text-white">Creator Dashboard</h1>
              <p className="text-text-muted mt-1">Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening with your campaigns.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" /> Export Data
              </Button>
              <Link to="/campaigns/new">
                <Button size="sm">
                  <Plus className="w-4 h-4" /> Create New Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/8 mb-8 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap',
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-muted hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'Overview' && (
            <div className="space-y-8">
              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-text-muted">{s.label}</span>
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <s.icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <p className="font-sans font-extrabold text-2xl text-white mb-1">{s.value}</p>
                    <p className="text-xs text-success flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />{s.change}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Line chart */}
                <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">Fundraising Progress</h3>
                      <p className="text-xs text-text-muted mt-0.5">Real-time donations tracked over the last 7 days</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Live Updates
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" tick={{ fill: '#60607A', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#60607A', fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                        labelStyle={{ color: '#fff', fontWeight: 600 }}
                        itemStyle={{ color: '#FF6B00' }}
                        formatter={(v: number) => [`₹${v}`, 'Donations']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2.5}
                        fill="url(#colorAmt)" dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart */}
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <h3 className="font-semibold text-white mb-1">Donation Sources</h3>
                  <p className="text-xs text-text-muted mb-4">Where your support is coming from</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        dataKey="value" strokeWidth={0}>
                        {sourceData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                        labelStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {sourceData.map(s => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-xs text-text-muted">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* My Campaigns mini + Recent Activity */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">My Campaigns</h3>
                      <span className="text-xs bg-white/8 px-2 py-0.5 rounded-full text-text-muted">3 Total</span>
                    </div>
                    <button onClick={() => setActiveTab('My Campaigns')} className="text-xs text-primary hover:text-primary-light transition-colors">View All</button>
                  </div>
                  <div className="space-y-4">
                    {dashCampaigns.map(c => (
                      <div key={c.id} className="flex items-center gap-4">
                        <img src={c.coverImage} alt="" className="w-14 h-10 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white truncate">{c.title}</span>
                            <Badge variant={statusVariant[c.status] || 'default'} size="sm">{c.status}</Badge>
                          </div>
                          <ProgressBar current={c.raisedAmount} goal={c.goalAmount} size="sm" />
                          <p className="text-xs text-text-muted mt-1">{formatCurrency(c.raisedAmount)} of {formatCurrency(c.goalAmount)}</p>
                        </div>
                        <div className="text-right text-xs text-text-muted shrink-0">
                          <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.donorCount}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link to={`/campaigns/${c.slug}`}><button className="p-1.5 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"><ExternalLink className="w-4 h-4" /></button></Link>
                          <button className="p-1.5 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"><Share2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity + Profile */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Recent Activity</h3>
                    </div>
                    <div className="space-y-3">
                      {mockDonations.slice(0, 3).map(d => (
                        <div key={d.id} className="flex items-center gap-3">
                          <Avatar src={d.donorAvatar} fallback={d.donorName?.[0] || '?'} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium">{d.anonymous ? 'Anonymous Donor' : d.donorName} donated</p>
                            <p className="text-sm font-bold text-primary">{formatCurrency(d.amount)}</p>
                          </div>
                          <span className="text-xs text-text-muted shrink-0">{getTimeAgo(d.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 w-full text-xs text-primary text-center hover:text-primary-light transition-colors">View Full Transaction Log</button>
                  </div>

                  {user && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                      <Avatar src={user.avatar} fallback={user.name} size="xl" className="mx-auto mb-3" />
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <p className="font-semibold text-white">{user.name}</p>
                      </div>
                      <p className="text-xs text-text-muted mb-4">Joined October 2023 • Verified Creator</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="font-bold text-white">98%</p>
                          <p className="text-xs text-text-muted">Trust Score</p>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                          <p className="font-bold text-white">1.2k</p>
                          <p className="text-xs text-text-muted">Followers</p>
                        </div>
                      </div>
                      <Link to={`/profile/${user.username}`}>
                        <Button variant="ghost" size="sm" fullWidth>Edit Public Profile</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Campaigns Tab */}
          {activeTab === 'My Campaigns' && (
            <div>
              <div className="overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.03]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Campaign', 'Status', 'Raised', 'Goal', '%', 'Donors', 'Updated', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dashCampaigns.map(c => {
                      const pct = Math.round((c.raisedAmount / c.goalAmount) * 100)
                      return (
                        <tr key={c.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img src={c.coverImage} alt="" className="w-10 h-7 object-cover rounded-lg shrink-0" />
                              <span className="text-sm text-white font-medium line-clamp-1 max-w-[180px]">{c.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge>
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-white">{formatCurrency(c.raisedAmount)}</td>
                          <td className="px-4 py-4 text-sm text-text-muted">{formatCurrency(c.goalAmount)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <ProgressBar current={c.raisedAmount} goal={c.goalAmount} size="sm" className="w-16" />
                              <span className="text-xs text-text-muted">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-text-muted">{c.donorCount}</td>
                          <td className="px-4 py-4 text-xs text-text-muted">2 hours ago</td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1">
                              <button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/8 transition-all"><Edit className="w-4 h-4" /></button>
                              <Link to={`/campaigns/${c.slug}`}><button className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/8 transition-all"><ExternalLink className="w-4 h-4" /></button></Link>
                              <button className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/8 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'Donations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">All Donations</h3>
                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /> Export CSV</Button>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Donor', 'Campaign', 'Amount', 'Method', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mockDonations.map(d => (
                      <tr key={d.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar src={d.donorAvatar} fallback={d.donorName?.[0] || '?'} size="xs" />
                            <span className="text-sm text-white">{d.anonymous ? 'Anonymous' : (d.donorName || 'Supporter')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-text-muted">{d.campaignTitle}</td>
                        <td className="px-4 py-4 text-sm font-bold text-primary">{formatCurrency(d.amount)}</td>
                        <td className="px-4 py-4"><Badge variant="outline">{d.paymentMethod}</Badge></td>
                        <td className="px-4 py-4 text-xs text-text-muted">{getTimeAgo(d.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white mb-6">30-Day Donation Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[...weeklyData, { day: 'Mon+', amount: 3200 }, { day: 'Tue+', amount: 2800 }, { day: 'Wed+', amount: 4100 }, { day: 'Thu+', amount: 3700 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#60607A', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#60607A', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 600 }} itemStyle={{ color: '#FF6B00' }}
                      formatter={(v: number) => [`₹${v}`, 'Donations']} />
                    <Line type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'Settings' && (
            <div className="max-w-xl space-y-6">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white mb-5">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Display Name</label>
                    <input defaultValue={user?.name} className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Bio</label>
                    <textarea defaultValue={user?.bio} rows={3} className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm resize-none focus:outline-none focus:border-primary/50" />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <h3 className="font-semibold text-white mb-5">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">Current Password</label>
                    <input type="password" className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1.5">New Password</label>
                    <input type="password" className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-white/8 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-error/20 bg-error/5 p-6">
                <h3 className="font-semibold text-error mb-2">Danger Zone</h3>
                <p className="text-sm text-text-muted mb-4">Permanently delete your account and all associated data.</p>
                <Button variant="danger">Delete Account</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
