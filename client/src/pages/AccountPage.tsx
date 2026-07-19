import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Package, Heart, Settings, LogOut, Edit2, Save } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const MOCK_ORDERS = [
  { id: 'HD-ABC123', date: '2024-12-15', status: 'Delivered', total: 285, items: 2 },
  { id: 'HD-DEF456', date: '2024-12-01', status: 'Shipped', total: 490, items: 1 },
  { id: 'HD-GHI789', date: '2024-11-20', status: 'Processing', total: 175, items: 3 },
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const { user, profile, signOut, updateProfile } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl font-bold text-black dark:text-white mb-4">Sign in required</h1>
        <p className="text-neutral-400 mb-8">Please sign in to access your account.</p>
        <Link to="/auth"><Button size="lg">Sign In</Button></Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    success('Signed out successfully')
  }

  const statusColor = {
    Delivered: 'text-green-500 bg-green-50 dark:bg-green-950/20',
    Shipped: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
    Processing: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    Cancelled: 'text-red-500 bg-red-50 dark:bg-red-950/20',
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-neutral-50 dark:bg-dark-muted">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-black dark:text-white mb-10">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="bg-white dark:bg-dark-card rounded-xl overflow-hidden"
              style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)' }}
            >
              <div className="px-6 py-5 border-b border-neutral-100 dark:border-dark-border">
                <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-lg font-bold mb-3">
                  {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <p className="font-semibold text-black dark:text-white text-sm">{profile?.full_name || 'User'}</p>
                <p className="text-neutral-400 text-xs truncate">{user.email}</p>
              </div>
              <nav className="p-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium transition-colors text-left ${activeTab === id ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-muted'}`}
                  >
                    <Icon size={16} /> {label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left mt-1"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white dark:bg-dark-card rounded-xl p-6"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-black dark:text-white text-lg">Profile Information</h2>
                  <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                    {editing ? <><Save size={15} /> Save</> : <><Edit2 size={15} /> Edit</>}
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={profile?.full_name || ''} disabled={!editing} />
                  <Input label="Email" defaultValue={user.email || ''} disabled type="email" />
                  <Input label="Phone" defaultValue={profile?.phone || ''} disabled={!editing} />
                </div>
                {editing && (
                  <Button className="mt-4" onClick={() => { setEditing(false); success('Profile updated!') }}>
                    Save Changes
                  </Button>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white dark:bg-dark-card rounded-xl p-6"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)' }}
              >
                <h2 className="font-semibold text-black dark:text-white text-lg mb-6">Order History</h2>
                {MOCK_ORDERS.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={40} className="text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {MOCK_ORDERS.map((order, oi) => (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{
                          default: { duration: 0.35, delay: oi * 0.08, ease: 'easeOut' },
                          x: { type: 'spring', stiffness: 340, damping: 26 },
                        }}
                        className="border border-neutral-100 dark:border-dark-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-default"
                        style={{
                          boxShadow: '0 2px 10px -2px rgba(0,0,0,0.06)',
                          transition: 'box-shadow 0.3s ease',
                        }}
                        onHoverStart={(e) => {
                          (e.target as HTMLElement).style.boxShadow = '0 6px 24px -4px rgba(196,163,90,0.2), 0 2px 6px rgba(0,0,0,0.06)'
                        }}
                        onHoverEnd={(e) => {
                          (e.target as HTMLElement).style.boxShadow = '0 2px 10px -2px rgba(0,0,0,0.06)'
                        }}
                      >
                        <div>
                          <p className="font-medium text-black dark:text-white text-sm">{order.id}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{order.date} · {order.items} items</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded ${statusColor[order.status as keyof typeof statusColor] || ''}`}>
                            {order.status}
                          </span>
                          <span className="font-semibold text-sm text-black dark:text-white">${order.total}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white dark:bg-dark-card rounded-xl p-6"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)' }}
              >
                <h2 className="font-semibold text-black dark:text-white text-lg mb-4">Saved Items</h2>
                <Link to="/wishlist">
                  <Button variant="outline">View Full Wishlist</Button>
                </Link>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="bg-white dark:bg-dark-card rounded-xl p-6 space-y-6"
                style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.10)' }}
              >
                <h2 className="font-semibold text-black dark:text-white text-lg">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-neutral-100 dark:border-dark-border">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Email Notifications</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Receive updates about your orders and new arrivals</p>
                    </div>
                    <button className="w-12 h-6 bg-black dark:bg-brand-gold rounded-full relative transition-colors">
                      <span className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-neutral-100 dark:border-dark-border">
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Marketing Emails</p>
                      <p className="text-xs text-neutral-400 mt-0.5">Receive promotions and exclusive offers</p>
                    </div>
                    <button className="w-12 h-6 bg-neutral-200 dark:bg-dark-border rounded-full relative transition-colors">
                      <span className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow" />
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <button onClick={handleSignOut} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1.5">
                    <LogOut size={15} /> Sign Out of All Devices
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
