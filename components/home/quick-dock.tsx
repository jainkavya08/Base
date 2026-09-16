"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { AddLinkDialog } from "./add-link-dialog";
import { Trash2 } from "lucide-react";
function DockItem({ 
  link, 
  mouseX 
}: { 
  link: { id: string; name: string; url: string; icon?: string };
  mouseX: any;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const removeQuickLink = useAppStore((state) => state.removeQuickLink);

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
      <a 
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <motion.div
          ref={ref}
          style={{ width, height: width }}
          className="rounded-2xl bg-surface-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow relative cursor-pointer overflow-hidden group"
        >
          {favicon ? (
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
      </a>
      
      {/* Remove Button */}
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
    </div>
  );
}

export function QuickDock() {
  const quickLinks = useAppStore((state) => state.quickLinks);
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:block">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 rounded-3xl bg-canvas/30 backdrop-blur-xl border border-border/30 shadow-2xl"
      >
        {quickLinks.map((link) => (
          <DockItem key={link.id} link={link} mouseX={mouseX} />
        ))}
        
        {/* Divider if we have links */}
        {quickLinks.length > 0 && (
          <div className="w-px h-10 bg-border/50 mx-1 self-center" />
        )}
        
        <AddLinkDialog />
      </motion.div>
    </div>
  );
}
