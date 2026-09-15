"use client";

import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function MobileGreeting() {
  const { settings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="md:hidden flex flex-col gap-1 mt-2 animate-pulse">
        <div className="h-8 bg-canvas rounded w-48"></div>
        <div className="h-4 bg-canvas rounded w-32 mt-1"></div>
      </div>
    );
  }

  // Get first name
  const firstName = settings?.profile?.name ? settings.profile.name.split(" ")[0] : "User";

  return (
    <div className="md:hidden flex flex-col gap-1 mt-2">
      <h1 className="text-[26px] font-medium text-ink leading-tight">Morning, {firstName}</h1>
      <p className="text-[13px] text-ink-muted font-medium">{format(new Date(), 'EEEE, d MMMM, yyyy')}</p>
    </div>
  );
}
