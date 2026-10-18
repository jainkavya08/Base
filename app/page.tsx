"use client";

import { BentoGrid } from "@/components/home/bento-grid";
import { format } from "date-fns";
import { useAppStore } from "@/lib/store";
import { QuickDock } from "@/components/home/quick-dock";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function Home() {
  const today = new Date();
  const name = useAppStore((state) => state.settings?.profile?.name || "Friend");

  return (
    <>
      <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-10 md:gap-14 relative pb-32">
        {/* Hero Section: The Tactile Desk Stage */}
        <section className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 pt-6">
          <div className="max-w-3xl">
            <h1 data-rise style={{ "--i": 0 } as React.CSSProperties} className="text-5xl sm:text-7xl lg:text-8xl font-medium text-ink tracking-tight leading-[0.94]">
              {getGreeting(name)}
            </h1>
            <p data-rise style={{ "--i": 1 } as React.CSSProperties} className="text-ink text-lg sm:text-xl mt-4 max-w-xl leading-relaxed">
              Your tactile desk ledger. Today is {format(today, "EEEE, MMMM do, yyyy")}. Keep focus deliberate, log habits, and cultivate stillness.
            </p>
          </div>

          {/* Quick Action Band */}
          <div data-rise style={{ "--i": 2 } as React.CSSProperties} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link
              href="/pomodoro"
              className="px-6 py-3.5 rounded-2xl bg-surface-dark text-canvas hover:opacity-95 font-medium text-base flex items-center gap-2 transition-opacity"
            >
              Start Focus Session
              <ArrowUpRight className="w-4 h-4 text-canvas/70" />
            </Link>
            <Link
              href="/habits"
              className="px-6 py-3.5 rounded-2xl bg-surface-card hover:bg-surface-card/80 text-ink font-medium text-base flex items-center gap-2 transition-colors"
            >
              Log Daily Habits
              <ArrowUpRight className="w-4 h-4 text-ink-muted" />
            </Link>
          </div>
        </section>

        {/* Curated Atmospheric Desk Imagery Suite (4 authentic pictures + video loop) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Main Focus Study Visual */}
          <div data-rise style={{ "--i": 3 } as React.CSSProperties} className="md:col-span-7 relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[380px] bg-surface-dark flex flex-col justify-end p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/desk-with-notebook-pens-and-glasses.jpg"
              alt="Desk with notebook, pens, and reading glasses in evening study"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity filter contrast-110"
            />
            <div className="relative z-10 max-w-md">
              <p className="text-xl sm:text-2xl font-medium text-canvas leading-snug">
                One deliberate task at a time. Free of digital noise.
              </p>
            </div>
          </div>

          {/* Mechanical Pendulum Rhythm Video */}
          <div data-rise style={{ "--i": 4 } as React.CSSProperties} className="md:col-span-5 relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[380px] bg-surface-card flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-ink">Mechanical escapement cadence</span>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-yellow inline-block" />
            </div>

            <div className="my-auto py-2">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/assets/mechanical-movement-of-pendulum-clock-poster.jpg"
                className="w-full h-36 object-cover rounded-2xl"
                aria-hidden="true"
              >
                <source src="/assets/mechanical-movement-of-pendulum-clock.webm" type="video/webm" />
              </video>
            </div>

            <p className="text-base text-ink leading-relaxed">
              Real mechanical pendulum escapement recording (Darklanlan, CC0).
            </p>
          </div>

          {/* Architectural Elevation Plan */}
          <div data-rise style={{ "--i": 5 } as React.CSSProperties} className="md:col-span-4 relative rounded-3xl overflow-hidden min-h-[220px] bg-surface-dark flex flex-col justify-end p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/plan-of-the-center-of-the-city.jpg"
              alt="Historical architectural plan drawing"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
            />
            <div className="relative z-10">
              <p className="text-base font-medium text-canvas">Structural symmetry and plan</p>
            </div>
          </div>

          {/* Chicago Lakefront Plan */}
          <div data-rise style={{ "--i": 6 } as React.CSSProperties} className="md:col-span-4 relative rounded-3xl overflow-hidden min-h-[220px] bg-surface-dark flex flex-col justify-end p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/plate-49-from-plan-of-chicago-1909.jpg"
              alt="Archival urban perspective study"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
            />
            <div className="relative z-10">
              <p className="text-base font-medium text-canvas">Tactile stationery margins</p>
            </div>
          </div>

          {/* Desk Notebook Surface */}
          <div data-rise style={{ "--i": 7 } as React.CSSProperties} className="md:col-span-4 relative rounded-3xl overflow-hidden min-h-[220px] bg-surface-dark flex flex-col justify-end p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/desk-laptop-notebook-pen-23958719819.jpg"
              alt="Minimalist workspace notebook desk setup"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity filter contrast-125"
            />
            <div className="relative z-10">
              <p className="text-base font-medium text-canvas">Daily analog rhythm</p>
            </div>
          </div>
        </section>

        {/* Interactive Desk Grid: Bento Widgets */}
        <section data-rise style={{ "--i": 8 } as React.CSSProperties} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-medium text-ink">Active Modules</h2>
            <span className="text-base text-ink font-medium">Reorder widgets by drag</span>
          </div>
          <BentoGrid />
        </section>

        {/* Quick Links Dock: Tactile desk tray */}
        <section className="flex justify-center pt-2">
          <QuickDock />
        </section>

        {/* Footer: Designed Close with Credits */}
        <footer className="mt-16 pt-12 flex flex-col gap-6 text-base text-ink">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-ink font-medium text-base">
              <span className="w-3 h-3 rounded-full bg-accent-yellow inline-block" />
              Base Personal Dashboard
            </div>
            <div className="flex items-center gap-6 text-base text-ink">
              <span>Local IndexedDB</span>
              <span>Zero Telemetry</span>
              <span>Crafted for stillness</span>
            </div>
          </div>

          <p className="text-base text-ink leading-relaxed max-w-2xl">
            Artwork and Footage: “Design for a Bookcase with Writing Desk” (ca. 1550–70, Met Open Access); “Plate 49 from Plan of Chicago 1909” (Daniel Burnham, AIC CC0); “Desk with notebook pens and glasses” (Shixart1985, CC BY 2.0); “Mechanical movement of pendulum clock” (Darklanlan, CC0).
          </p>
        </footer>
      </div>
    </>
  );
}
