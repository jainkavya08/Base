"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useDockStore, QuickLink } from "@/lib/dock-store";
import { AddLinkDialog, AVAILABLE_ICONS, IconName } from "./add-link-dialog";
import { Trash2, Home, CheckCircle, Timer, ListTodo, Wallet } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SYSTEM_LINKS = [
  { id: "sys-home", type: "system", name: "Home", url: "/", icon: Home },
  { id: "sys-habits", type: "system", name: "Habits", url: "/habits", icon: CheckCircle },
  { id: "sys-pomodoro", type: "system", name: "Pomodoro", url: "/pomodoro", icon: Timer },
  { id: "sys-todos", type: "system", name: "Todos", url: "/todos", icon: ListTodo },
  { id: "sys-finance", type: "system", name: "Finance", url: "/finance", icon: Wallet },
];
function DockItem({ 
  link, 
  mouseX 
}: { 
  link: any;
  mouseX: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const removeQuickLink = useDockStore((state) => state.removeQuickLink);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Calculate width/scale based on distance to mouse
  const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  const favicon = getFaviconUrl(link.url);

  return (
    <div className="relative group/dock-item">
      <Link 
        href={link.url}
        target={link.type === 'system' ? undefined : "_blank"}
        rel={link.type === 'system' ? undefined : "noopener noreferrer"}
        className="block relative"
      >
        <motion.div
          ref={ref}
          style={{ width, height: width }}
          className="rounded-2xl bg-surface-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow relative cursor-pointer overflow-hidden group"
        >
          {link.type === 'system' && link.icon ? (
            <link.icon className="w-6 h-6 text-ink relative z-10" strokeWidth={2} />
          ) : link.icon && AVAILABLE_ICONS[link.icon as IconName] ? (
            (() => {
              const Icon = AVAILABLE_ICONS[link.icon as IconName];
              return <Icon className="w-6 h-6 text-ink relative z-10" strokeWidth={2} />;
            })()
          ) : favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt={link.name} className="w-2/3 h-2/3 object-contain pointer-events-none rounded-lg" />
          ) : (
            <span className="text-xl font-medium text-ink pointer-events-none">{link.name.charAt(0).toUpperCase()}</span>
          )}
          
          {/* Tooltip */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-3 py-1.5 bg-surface-dark/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            {link.name}
          </div>
        </motion.div>
      </Link>
      
      {/* Remove Button for custom links */}
      {link.type !== 'system' && (
        <>
          <AddLinkDialog linkToEdit={link} />
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeQuickLink(link.id);
            }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-surface-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover/dock-item:opacity-100 transition-opacity hover:bg-accent-coral z-10"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
}

export function QuickDock() {
  const quickLinks = useDockStore((state) => state.quickLinks);
  const hasHydrated = useDockStore((state) => state._hasHydrated);
  const mouseX = useMotionValue(Infinity);

  const displayLinks = hasHydrated ? [...SYSTEM_LINKS, ...quickLinks] : SYSTEM_LINKS;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:block">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 rounded-3xl bg-canvas/30 backdrop-blur-xl border border-border/30 shadow-2xl"
      >
        {displayLinks.map((link) => (
          <DockItem key={link.id} link={link} mouseX={mouseX} />
        ))}
        
        {/* Divider if we have custom links */}
        {quickLinks.length > 0 && hasHydrated && (
          <div className="w-px h-10 bg-border/50 mx-1 self-center" />
        )}
        
        <AddLinkDialog />
      </motion.div>
    </div>
  );
}
