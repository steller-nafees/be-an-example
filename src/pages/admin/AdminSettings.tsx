import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Save, CreditCard, User, Store } from "lucide-react";

const tabs = [
  { id: "store", label: "Store", icon: Store },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
] as const;

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("store");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white/90">Settings</h1>
        <p className="text-sm text-white/40 mt-0.5">Manage your store configuration</p>
      </div>

      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="settings-tab" className="absolute bottom-0 left-0 right-0 h-px bg-white" />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-2xl"
      >
        {activeTab === "store" && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Brand Name</label>
                <input
                  type="text"
                  defaultValue="BE AN EXAMPLE"
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Brand Description</label>
                <textarea
                  rows={3}
                  defaultValue="Don't follow trends. Set them."
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Logo</label>
                <div className="border-2 border-dashed border-white/[0.08] rounded-lg p-6 flex flex-col items-center gap-2 hover:border-white/[0.16] transition-colors cursor-pointer">
                  <Upload size={20} className="text-white/20" />
                  <p className="text-xs text-white/30">Click to upload logo</p>
                </div>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-md hover:bg-white/90 transition-colors">
              <Save size={15} />
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-md border border-white/[0.04]">
                <div className="w-10 h-10 rounded-md bg-[#635BFF]/20 flex items-center justify-center">
                  <CreditCard size={18} className="text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">Stripe</p>
                  <p className="text-xs text-white/40">Accept credit cards, Apple Pay, Google Pay</p>
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold border border-white/[0.1] rounded-md text-white/60 hover:text-white hover:border-white/20 transition-colors">
                  Connect
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Currency</label>
                <select className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors appearance-none">
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-md hover:bg-white/90 transition-colors">
              <Save size={15} />
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center text-xl font-bold text-white/30">
                  A
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold border border-white/[0.1] rounded-md text-white/60 hover:text-white hover:border-white/20 transition-colors">
                  Change Avatar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">First Name</label>
                  <input type="text" defaultValue="Admin" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input type="text" defaultValue="User" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" defaultValue="admin@beanexample.com" className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-md px-3 text-sm text-white focus:outline-none focus:border-white/20 transition-colors" />
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-md hover:bg-white/90 transition-colors">
              <Save size={15} />
              Save Profile
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
