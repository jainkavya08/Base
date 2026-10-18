"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useDockStore } from "@/lib/dock-store";
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
  const widthSync = useTransform(distance, [-120, 0, 120], [44, 62, 44]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 });

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
          className={cn(
            "rounded-[4px] bg-[#FDFAF4] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center justify-center relative cursor-pointer overflow-hidden transition-colors hover:bg-[#FFE14D] hover:shadow-[3px_3px_0px_0px_#1A1A1A] active:translate-x-[1px] active:translate-y-[1px]"
          )}
        >
          {link.type === 'system' && link.icon ? (
            <link.icon className="w-5 h-5 text-[#1A1A1A] relative z-10" strokeWidth={2} />
          ) : link.icon && AVAILABLE_ICONS[link.icon as IconName] ? (
            (() => {
              const Icon = AVAILABLE_ICONS[link.icon as IconName];
              return <Icon className="w-5 h-5 text-[#1A1A1A] relative z-10" strokeWidth={2} />;
            })()
          ) : favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt={link.name} className="w-2/3 h-2/3 object-contain pointer-events-none rounded-[2px]" />
          ) : (
            <span className="text-sm font-serif font-bold text-[#1A1A1A] pointer-events-none">{link.name.charAt(0).toUpperCase()}</span>
          )}
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2.5 py-1 bg-[#1A1A1A] text-white text-[11px] font-sans font-medium rounded-[2px] border border-[#1A1A1A] shadow-[2px_2px_0px_0px_#FF4D00] whitespace-nowrap z-50">
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
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF4D00] text-white border border-[#1A1A1A] rounded-[2px] flex items-center justify-center opacity-0 group-hover/dock-item:opacity-100 transition-opacity hover:bg-[#1A1A1A] z-10 shadow-[1px_1px_0px_0px_#1A1A1A]"
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
        className="flex items-end gap-2.5 px-4 py-2.5 rounded-[6px] bg-[#FDFAF4] border-2 border-[#1A1A1A] shadow-[5px_5px_0px_0px_#1A1A1A]"
      >
        {displayLinks.map((link) => (
          <DockItem key={link.id} link={link} mouseX={mouseX} />
        ))}
        
        {/* Divider if we have custom links */}
        {quickLinks.length > 0 && hasHydrated && (
          <div className="w-[1px] h-8 bg-[#1A1A1A]/30 mx-1 self-center" />
        )}
        
        <AddLinkDialog />
      </motion.div>
    </div>
  );
}
