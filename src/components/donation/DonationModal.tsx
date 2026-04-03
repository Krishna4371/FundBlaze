import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, CreditCard, Smartphone, Building2, Check, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useDonate } from '@/hooks/useDonation'
import { useToast } from '@/hooks/useToast'
import { formatCurrency } from '@/utils/formatCurrency'
import { cn } from '@/utils/cn'

interface DonationModalProps {
  campaignId: string
  campaignTitle: string
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [100, 500, 1000, 5000]

const PAYMENT_TABS = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'netbanking', label: 'Net Banking', icon: Building2 },
] as const

type PaymentMethod = 'card' | 'upi' | 'netbanking'

export function DonationModal({ campaignId, campaignTitle, isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number | ''>(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [upiId, setUpiId] = useState('')
  const [success, setSuccess] = useState(false)

  const donate = useDonate()
  const { success: toastSuccess, error: toastError } = useToast()

  const finalAmount = isCustom ? (parseInt(customAmount) || 0) : (amount as number)

  const handlePreset = (val: number) => {
    setAmount(val)
    setIsCustom(false)
    setCustomAmount('')
  }

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount < 1) return
    try {
      await donate.mutateAsync({ campaignId, amount: finalAmount, message: message || undefined, anonymous, paymentMethod })
      setSuccess(true)
      toastSuccess(`Thank you! ₹${finalAmount} donated successfully.`)
    } catch {
      toastError('Payment failed', 'Please try again.')
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setAmount(500)
    setCustomAmount('')
    setIsCustom(false)
    setMessage('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" title={success ? undefined : `Support this campaign`}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-success/15 border-2 border-success/40 flex items-center justify-center mx-auto mb-5"
            >
              <Check className="w-10 h-10 text-success" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white font-sans mb-2">Thank You! 🎉</h3>
            <p className="text-text-secondary mb-1">
              Your donation of <span className="text-primary font-bold">{formatCurrency(finalAmount)}</span> has been received.
            </p>
            <p className="text-sm text-text-muted mb-8">You're making a real difference to <span className="text-white">{campaignTitle}</span></p>
            <Button onClick={handleClose} fullWidth>Back to Campaign</Button>
          </motion.div>
        ) : (
          <motion.div key="form" className="space-y-5 -mt-2">
            {/* Amount selector */}
            <div>
              <p className="text-sm font-semibold text-text-secondary mb-3">Select Amount</p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_AMOUNTS.map(val => (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    className={cn(
                      'py-2.5 rounded-xl border text-sm font-bold transition-all',
                      !isCustom && amount === val
                        ? 'bg-primary/15 border-primary/50 text-primary'
                        : 'bg-white/5 border-white/8 text-text-secondary hover:border-white/20 hover:text-white'
                    )}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true) }}
                  onFocus={() => setIsCustom(true)}
                  className={cn(
                    'w-full pl-8 pr-4 py-2.5 rounded-xl bg-bg-elevated border text-white placeholder:text-text-muted text-sm transition-all focus:outline-none',
                    isCustom ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/8 focus:border-primary/40'
                  )}
                  min="1"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/3 border border-white/8">
              <div>
                <p className="text-sm font-medium text-white">Donate anonymously</p>
                <p className="text-xs text-text-muted">Your name won't appear on the donors list</p>
              </div>
              <button
                role="switch"
                aria-checked={anonymous}
                onClick={() => setAnonymous(v => !v)}
                className={cn('w-11 h-6 rounded-full transition-colors relative', anonymous ? 'bg-primary' : 'bg-white/15')}
              >
                <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm', anonymous && 'translate-x-5')} />
              </button>
            </div>

            <Textarea
              label="Leave a message (optional)"
              placeholder="Share why you're supporting this campaign..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              showCount
              rows={2}
            />

            {/* Payment tabs */}
            <div>
              <p className="text-sm font-semibold text-text-secondary mb-3">Payment Method</p>
              <div className="flex gap-2 mb-4">
                {PAYMENT_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setPaymentMethod(tab.id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all',
                      paymentMethod === tab.id
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-white/5 border-white/8 text-text-muted hover:text-white'
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Payment fields */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Expiry" placeholder="MM/YY" value={expiry}
                        onChange={(e) => setExpiry(e.target.value)} maxLength={5} />
                      <Input label="CVV" placeholder="•••" value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} maxLength={3} type="password" />
                    </div>
                  </motion.div>
                )}
                {paymentMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Input label="UPI ID" placeholder="yourname@paytm" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                  </motion.div>
                )}
                {paymentMethod === 'netbanking' && (
                  <motion.div key="nb" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="grid grid-cols-3 gap-2">
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'].map(bank => (
                        <button key={bank} className="py-2.5 text-xs font-medium text-text-secondary border border-white/8 rounded-xl hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all">
                          {bank}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">You're donating</p>
                <p className="text-xl font-bold text-primary font-sans">{finalAmount ? formatCurrency(finalAmount) : '₹0'}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Lock className="w-3 h-3" />
                Secured by Razorpay
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              loading={donate.isPending}
              disabled={!finalAmount || finalAmount < 1}
              fullWidth
              size="lg"
              className="mt-2"
            >
              <Heart className="w-4 h-4" />
              {donate.isPending ? 'Processing...' : `Donate ${finalAmount ? formatCurrency(finalAmount) : ''}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
