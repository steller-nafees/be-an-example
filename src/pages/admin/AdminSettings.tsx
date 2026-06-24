import { useRef, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Upload, Save, CreditCard, User, Store, X, RotateCcw } from "lucide-react";
import { defaultBrandSettings, type BrandSettings, useBrandSettings, useLogo } from "@/context/LogoContext";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const tabs = [
  { id: "store", label: "Store", icon: Store },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
] as const;

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<string>("store");
  const { logo, uploadLogo, removeLogo } = useLogo();
  const { settings, updateSettings, resetSettings } = useBrandSettings();
  const [settingsDraft, setSettingsDraft] = useState<BrandSettings>(settings);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSettingChange = (field: keyof BrandSettings, value: string | number) => {
    setSettingsDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSaveStoreSettings = () => {
    updateSettings(settingsDraft);
    toast({
      title: "Store settings saved",
      description: "Company details now update across the store.",
    });
  };

  const handleResetStoreSettings = () => {
    resetSettings();
    setSettingsDraft(defaultBrandSettings);
    toast({
      title: "Store settings reset",
      description: "Default company details have been restored.",
    });
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await uploadLogo(file);
      toast({
        title: "Logo uploaded successfully",
        description: "Your logo has been updated across the store",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your store configuration</p>
      </div>

      <div className="flex items-center gap-1 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="settings-tab" className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
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
            <div className="bg-background border border-border rounded-lg p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Brand Name"
                  value={settingsDraft.brandName}
                  onChange={(value) => handleSettingChange("brandName", value)}
                />
                <Field
                  label="Company Name"
                  value={settingsDraft.companyName}
                  onChange={(value) => handleSettingChange("companyName", value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Tagline</label>
                <textarea
                  rows={3}
                  value={settingsDraft.tagline}
                  onChange={(event) => handleSettingChange("tagline", event.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Support Email"
                  type="email"
                  value={settingsDraft.supportEmail}
                  onChange={(value) => handleSettingChange("supportEmail", value)}
                />
                <Field
                  label="Privacy Email"
                  type="email"
                  value={settingsDraft.privacyEmail}
                  onChange={(value) => handleSettingChange("privacyEmail", value)}
                />
                <Field
                  label="Legal Email"
                  type="email"
                  value={settingsDraft.legalEmail}
                  onChange={(value) => handleSettingChange("legalEmail", value)}
                />
                <Field
                  label="Shipping Email"
                  type="email"
                  value={settingsDraft.shippingEmail}
                  onChange={(value) => handleSettingChange("shippingEmail", value)}
                />
                <Field
                  label="Affiliate Email"
                  type="email"
                  value={settingsDraft.affiliateEmail}
                  onChange={(value) => handleSettingChange("affiliateEmail", value)}
                />
                <Field
                  label="Admin Email"
                  type="email"
                  value={settingsDraft.adminEmail}
                  onChange={(value) => handleSettingChange("adminEmail", value)}
                />
                <Field
                  label="Phone"
                  type="tel"
                  value={settingsDraft.phone}
                  onChange={(value) => handleSettingChange("phone", value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Address Line 1"
                  value={settingsDraft.addressLine1}
                  onChange={(value) => handleSettingChange("addressLine1", value)}
                />
                <Field
                  label="Address Line 2"
                  value={settingsDraft.addressLine2}
                  onChange={(value) => handleSettingChange("addressLine2", value)}
                />
                <Field
                  label="Weekday Hours"
                  value={settingsDraft.weekdayHours}
                  onChange={(value) => handleSettingChange("weekdayHours", value)}
                />
                <Field
                  label="Weekend Hours"
                  value={settingsDraft.weekendHours}
                  onChange={(value) => handleSettingChange("weekendHours", value)}
                />
                <Field
                  label="Closed Note"
                  value={settingsDraft.closedNote}
                  onChange={(value) => handleSettingChange("closedNote", value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Facebook URL"
                  value={settingsDraft.facebookUrl}
                  onChange={(value) => handleSettingChange("facebookUrl", value)}
                />
                <Field
                  label="Instagram URL"
                  value={settingsDraft.instagramUrl}
                  onChange={(value) => handleSettingChange("instagramUrl", value)}
                />
                <Field
                  label="Twitter URL"
                  value={settingsDraft.twitterUrl}
                  onChange={(value) => handleSettingChange("twitterUrl", value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Logo</label>
                <div className="space-y-4">
                  {logo ? (
                    <div className="relative bg-muted rounded-lg p-4 border border-border">
                      <img
                        src={logo}
                        alt="Store logo"
                        className="max-w-full object-contain mx-auto"
                        style={{ height: `${Math.max(12, Math.round(40 * (settingsDraft.logoScale ?? 1)))}px` }}
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex-1 px-3 py-2 text-xs font-semibold border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
                        >
                          Change Logo
                        </button>
                        <button
                          onClick={removeLogo}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 border border-red-600/20 rounded-md hover:bg-red-600/5 transition-colors"
                        >
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-foreground/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={20} className="text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground">
                        {isUploading ? "Uploading..." : "Click to upload logo"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </button>
                  )}
                  <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Logo size</p>
                        <p className="text-xs text-muted-foreground">Adjust how large the logo appears across the store.</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {Math.round((settingsDraft.logoScale ?? 1) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[Math.round((settingsDraft.logoScale ?? 1) * 100)]}
                      min={50}
                      max={150}
                      step={1}
                      onValueChange={([value]) => handleSettingChange("logoScale", value / 100)}
                    />
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>Smaller</span>
                      <span>Default</span>
                      <span>Larger</span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveStoreSettings}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 transition-colors"
              >
                <Save size={15} />
                Save Changes
              </button>
              <button
                onClick={handleResetStoreSettings}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-sm font-semibold rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <RotateCcw size={15} />
                Reset Defaults
              </button>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-5 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-md border border-border">
                <div className="w-10 h-10 rounded-md bg-[#635BFF]/10 flex items-center justify-center">
                  <CreditCard size={18} className="text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Stripe</p>
                  <p className="text-xs text-muted-foreground">Accept credit cards, Apple Pay, Google Pay</p>
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Connect
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Currency</label>
                <select
                  value={settingsDraft.currency}
                  onChange={(event) => handleSettingChange("currency", event.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors appearance-none"
                >
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                <input
                  type="number"
                  defaultValue="0"
                  className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={handleSaveStoreSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 transition-colors"
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground">
                  A
                </div>
                <button className="px-4 py-1.5 text-xs font-semibold border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Change Avatar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">First Name</label>
                  <input type="text" defaultValue="Admin" className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Last Name</label>
                  <input type="text" defaultValue="User" className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" value={settingsDraft.adminEmail} onChange={(event) => handleSettingChange("adminEmail", event.target.value)} className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors" />
              </div>
            </div>
            <button
              onClick={handleSaveStoreSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-md hover:bg-foreground/90 transition-colors"
            >
              <Save size={15} />
              Save Profile
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        className="w-full h-10 bg-background border border-border rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
      />
    </div>
  );
}
