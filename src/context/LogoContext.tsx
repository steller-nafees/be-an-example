import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LogoContextType {
  logo: string | null;
  setLogo: (logo: string | null) => void;
  uploadLogo: (file: File) => Promise<void>;
  removeLogo: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLogo = localStorage.getItem("brand-logo");
    if (savedLogo) {
      setLogo(savedLogo);
    }
    setIsLoading(false);
  }, []);

  const uploadLogo = async (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        localStorage.setItem("brand-logo", dataUrl);
        setLogo(dataUrl);
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
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <LogoContext.Provider value={{ logo, setLogo, uploadLogo, removeLogo }}>
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
