import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type BrandSettings = {
  brandName: string;
  companyName: string;
  tagline: string;
  logoScale: number;
  supportEmail: string;
  privacyEmail: string;
  legalEmail: string;
  shippingEmail: string;
  affiliateEmail: string;
  adminEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  weekdayHours: string;
  weekendHours: string;
  closedNote: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
};

export const defaultBrandSettings: BrandSettings = {
  brandName: "BE AN EXAMPLE",
  companyName: "Be An Example Inc.",
  tagline: "Make Your Style An Example.",
  logoScale: 1,
  supportEmail: "support@beanexample.com",
  privacyEmail: "privacy@beanexample.com",
  legalEmail: "legal@beanexample.com",
  shippingEmail: "shipping@beanexample.com",
  affiliateEmail: "affiliates@beanexample.com",
  adminEmail: "admin@beanexample.com",
  phone: "",
  addressLine1: "Headquarters in major US city",
  addressLine2: "Global operations across 50+ countries",
  weekdayHours: "Mon - Fri: 9:00 AM - 6:00 PM EST",
  weekendHours: "Sat - Sun: 10:00 AM - 4:00 PM EST",
  closedNote: "Closed on major holidays",
  facebookUrl: "https://www.facebook.com/beanexample",
  instagramUrl: "#",
  twitterUrl: "#",
};

const BRAND_SETTINGS_KEY = "brand-settings";
const REMOTE_BRAND_KEY = "brand";
const REMOTE_LOGO_KEY = "logo";

const loadBrandSettings = (): BrandSettings => {
  if (typeof window === "undefined") return defaultBrandSettings;

  try {
    const saved = localStorage.getItem(BRAND_SETTINGS_KEY);
    if (!saved) return defaultBrandSettings;
    return { ...defaultBrandSettings, ...JSON.parse(saved) };
  } catch {
    return defaultBrandSettings;
  }
};

interface LogoContextType {
  logo: string | null;
  settings: BrandSettings;
  setLogo: (logo: string | null) => void;
  updateSettings: (settings: BrandSettings) => void;
  resetSettings: () => void;
  uploadLogo: (file: File) => Promise<void>;
  removeLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logo, setLogo] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("brand-logo");
  });
  const [settings, setSettings] = useState<BrandSettings>(loadBrandSettings);

  useEffect(() => {
    let cancelled = false;

    const loadRemoteSettings = async () => {
      const [{ data: brandData }, { data: logoData }] = await Promise.all([
        supabase.from("site_settings").select("value").eq("key", REMOTE_BRAND_KEY).maybeSingle(),
        supabase.from("site_settings").select("value").eq("key", REMOTE_LOGO_KEY).maybeSingle(),
      ]);

      if (cancelled) return;

      const remoteSettings = brandData?.value as Partial<BrandSettings> | null | undefined;
      if (remoteSettings) {
        const nextSettings = { ...defaultBrandSettings, ...remoteSettings };
        localStorage.setItem(BRAND_SETTINGS_KEY, JSON.stringify(nextSettings));
        setSettings(nextSettings);
      }

      const remoteLogo = logoData?.value as { dataUrl?: string | null } | null | undefined;
      if (remoteLogo?.dataUrl) {
        localStorage.setItem("brand-logo", remoteLogo.dataUrl);
        setLogo(remoteLogo.dataUrl);
      }
    };

    void loadRemoteSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const upsertRemoteSetting = async (key: string, value: unknown) => {
    await supabase.from("site_settings").upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
  };

  const updateSettings = (nextSettings: BrandSettings) => {
    localStorage.setItem(BRAND_SETTINGS_KEY, JSON.stringify(nextSettings));
    setSettings(nextSettings);
    void upsertRemoteSetting(REMOTE_BRAND_KEY, nextSettings);
  };

  const resetSettings = () => {
    localStorage.removeItem(BRAND_SETTINGS_KEY);
    setSettings(defaultBrandSettings);
    void upsertRemoteSetting(REMOTE_BRAND_KEY, defaultBrandSettings);
  };

  const uploadLogo = async (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        localStorage.setItem("brand-logo", dataUrl);
        setLogo(dataUrl);
        void upsertRemoteSetting(REMOTE_LOGO_KEY, { dataUrl });
        resolve();
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeLogo = () => {
    localStorage.removeItem("brand-logo");
    setLogo(null);
    void upsertRemoteSetting(REMOTE_LOGO_KEY, { dataUrl: null });
  };


  return (
    <LogoContext.Provider value={{ logo, settings, setLogo, updateSettings, resetSettings, uploadLogo, removeLogo }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error("useLogo must be used within LogoProvider");
  }
  return context;
}

export function useBrandSettings() {
  const context = useLogo();
  return {
    settings: context.settings,
    updateSettings: context.updateSettings,
    resetSettings: context.resetSettings,
  };
}
