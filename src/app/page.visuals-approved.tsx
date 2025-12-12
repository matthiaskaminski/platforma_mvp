"use client";

import React from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ClipboardList, Palette, Image as ImageIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Mock Data
const budgetData = [
  { name: "Wydano", value: 168400, color: "#F3F3F3" },
  { name: "Planowane", value: 115200, color: "#6E6E6E" },
  { name: "Pozostało", value: 86400, color: "#232323" },
];

const tiles = [
  { label: "Mieszkanie", value: "", sub: "Rodzaj zabudowy" },
  { label: "85m²", value: "", sub: "Metraż" },
  { label: "1", value: "", sub: "Liczba pięter" },
  { label: "6", value: "", sub: "Pomieszczenia" },
  { label: "73", value: "", sub: "Produkty" },
  { label: "12", value: "", sub: "Wykonane zadania" },
];

const newProducts = [
  {
    name: "Łóżko z drewna z plecionką",
    brand: "Westwing",
    price: "3 719,00 zł",
    image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/DEQ23WES93078-204130_d6587456a27fd9ecc8c678b730505a43_dtl_1.webp"
  },
  {
    name: "Stolik pomocniczy Tarse",
    brand: "Kave Home",
    price: "489,00 zł",
    image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png"
  },
  {
    name: "Dywan Tigris - Beige/Brown",
    brand: "Nordic Knots",
    price: "2 750,00 zł",
    image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/509_0776c21ac3-tigr-bei-pp-1600.jpg"
  },
];

const visualizationImages = [
  "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526570979_1355299693265757_7539015905078556121_n.jpg",
  "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg",
  "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg",
  "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/527337457_1355299866599073_4633219416307881665_n.jpg"
];

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
      {/* Header Bar */}
      <div className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[28px] font-bold tracking-tight text-[#E5E5E5]">Cześć, Sonya! 👋</h2>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="text-muted-foreground">Status projektu:</span>
          <span className="flex items-center gap-2 text-foreground text-[20px]"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Aktywny</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="text-muted-foreground">Data rozpoczęcia:</span>
          <span className="text-foreground text-[20px]">20.01.2024</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="text-muted-foreground">Data zakończenia:</span>
          <span className="text-foreground text-[20px]">22.12.2025</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span className="text-muted-foreground">Pozostało:</span>
          <span className="text-foreground text-[20px]">70 dni</span>
        </div>
      </div>

      {/* Grid Layout - 3 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1 min-h-0">

        {/* Column 1: Stats & Calendar */}
        <div className="xl:col-span-3 flex flex-col gap-3 h-full min-h-0">
          {/* Stats Tiles Grid */}
          <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
            {tiles.map((tile, i) => (
              <div key={i} className={`p-4 rounded-2xl border border-[var(--color-border)]/50 flex flex-col justify-between hover:bg-[var(--color-card)]/80 transition-colors bg-[var(--color-card)]`}>
                <span className="text-[28px] font-semibold">{tile.label}</span>
                <span className="text-sm text-muted-foreground font-medium tracking-wide">{tile.sub}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex flex-col justify-center shrink-0 min-h-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-[20px]">Październik</h3>
              <div className="flex gap-2">
                <button className="p-1 hover:text-white text-muted-foreground transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:text-white text-muted-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-muted-foreground font-medium mb-1">
              {['Po', 'Wt', 'Śr', 'Cz', 'Pi', 'So', 'Nd'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 content-center">
              {[29, 30].map((day) => (
                <div key={`prev-${day}`} className="aspect-square flex items-center justify-center rounded-lg text-sm bg-[#1B1B1B] text-muted-foreground/50">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 10;
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer border border-transparent
                      ${isToday
                        ? 'bg-[#F3F3F3] text-black font-bold'
                        : 'bg-[#232323] text-muted-foreground hover:border-zinc-600 hover:text-white'
                      }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Column 2: Budget & Tasks/Interactions */}
        <div className="xl:col-span-5 flex flex-col gap-3 h-full min-h-0">
          {/* Budget */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center relative overflow-hidden flex-1 min-h-0">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"></div>
            <div className="flex-1 space-y-2 w-full h-full flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start shrink-0 mb-4">
                <h3 className="font-medium text-[20px]">Budżet</h3>
              </div>

              <div className="space-y-2 lg:space-y-3 text-sm flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-3 text-[14px] font-medium text-[#6E6E6E]"><div className="w-6 h-3 rounded-full bg-white"></div> Wydano</span>
                  <span className="font-mono text-[16px] font-normal">158 400,00 zł</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-3 text-[14px] font-medium text-[#6E6E6E]"><div className="w-6 h-3 rounded-full bg-zinc-600"></div> Planowane</span>
                  <span className="font-mono text-[16px] font-normal">115 200,00 zł</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-3 text-[14px] font-medium text-[#6E6E6E]"><div className="w-6 h-3 rounded-full bg-zinc-800"></div> Pozostało</span>
                  <span className="font-mono text-[16px] font-normal">86 400,00 zł</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-1 flex justify-between items-center font-bold text-[16px]">
                  <span className="text-[#6E6E6E] text-[14px] font-medium">Łącznie</span>
                  <span className="font-mono text-[16px] font-normal">380 000,00 zł</span>
                </div>
              </div>

              <button className="w-fit text-sm font-medium bg-secondary hover:bg-secondary/80 px-4 py-1.5 rounded-lg transition-colors text-secondary-foreground border border-[var(--color-border)]/50 shrink-0">
                Wyświetl planer budżetu
              </button>
            </div>

            {/* Pie Chart */}
            <div className="w-full max-w-[45%] h-full relative flex-shrink-0 min-h-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    innerRadius="75%"
                    outerRadius="85%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-medium tracking-tighter">75%</span>
              </div>
            </div>
          </div>

          {/* Split Row: Tasks & Interactions */}
          <div className="grid grid-cols-2 gap-3 flex-[1.4] min-h-0">
            {/* Tasks */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex flex-col h-full min-h-0">
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="font-medium flex items-center gap-2 text-[20px]">Lista zadań <span className="bg-white text-black text-sm font-bold px-2 py-0.5 rounded-full">2</span></h3>
                <button className="text-sm border border-[var(--color-border)]/50 px-3 py-1 rounded-full bg-[#232323] hover:bg-[#232323]/80 transition-colors">Zarządzaj</button>
              </div>

              <button className="w-full py-4 border border-dashed border-[var(--color-border)]/50 hover:border-zinc-600 rounded-lg mb-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition-all flex flex-col items-center justify-center gap-2 shrink-0">
                <span>+ Dodaj nowe zadanie</span>
              </button>

              <div className="space-y-3 flex-1 flex flex-col overflow-y-auto pr-1 min-h-0 no-scrollbar">
                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 rounded-xl border border-[var(--color-border)]/50">
                  <h4 className="text-[16px] font-medium mb-1">Skontaktować się z dostawcą lamp</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]"></span> Przeterminowane</span>
                    <span className="text-muted-foreground">Salon</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                    <span>Data zakończenia</span>
                    <span>10.11.2025</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 rounded-xl border border-[var(--color-border)]/50">
                  <h4 className="text-[16px] font-medium mb-1">Zatwierdzić próbki tkanin do sofy</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]"></span> Przeterminowane</span>
                    <span className="text-muted-foreground">Salon</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                    <span>Data zakończenia</span>
                    <span>11.11.2025</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 rounded-xl border border-[var(--color-border)]/50">
                  <h4 className="text-[16px] font-medium mb-1">Wybrać łóżko z drewnianą ramą</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span> W trakcie</span>
                    <span className="text-muted-foreground">Sypialnia</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                    <span>Data zakończenia</span>
                    <span>26.11.2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex flex-col h-full min-h-0">
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="font-medium text-[20px]">Interakcja z klientem</h3>
                <button className="text-sm border border-[var(--color-border)]/50 px-3 py-1 rounded-full bg-[#232323] hover:bg-[#232323]/80 transition-colors">Zarządzaj</button>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
                {[
                  { name: "Ankiety", created: 3, sent: 3, replies: 2, icon: ClipboardList },
                  { name: "Style", created: 1, sent: 1, replies: 1, icon: Palette },
                  { name: "Moodboardy", created: 4, sent: 2, replies: 2, icon: ImageIcon, newReply: true },
                ].map((item, i) => (
                  <div key={i} className={`flex-1 flex flex-col justify-between p-3 bg-secondary/30 rounded-xl border border-[var(--color-border)]/50`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[16px] font-medium">{item.name}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5 text-sm text-muted-foreground">
                      <div className="flex justify-between"><span>Stworzone</span> <span className="text-foreground">{item.created}</span></div>
                      <div className="flex justify-between"><span>Wysłane</span> <span className="text-foreground">{item.sent}</span></div>
                      <div className="flex justify-between"><span>Odpowiedzi</span> <span className="text-foreground">{item.replies}</span></div>
                      {item.newReply && <div className="pt-1 text-white/80">Masz nową odpowiedź!</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Products & Visualizations */}
        <div className="xl:col-span-4 flex flex-col gap-3 h-full min-h-0">
          {/* Last Added */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="font-medium text-[20px]">Ostatnio dodane produkty</h3>
              <button className="text-sm border border-[var(--color-border)]/50 px-3 py-1 rounded-full bg-[#232323] hover:bg-[#232323]/80 transition-colors">Zarządzaj</button>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
              {newProducts.map((prod, i) => (
                <div key={i} className="flex-1 flex gap-4 items-center p-2 bg-[#1B1B1B] rounded-xl border border-[var(--color-border)]/50 group cursor-pointer hover:bg-zinc-800 transition-colors overflow-hidden">
                  <div className="h-full aspect-square bg-white rounded-lg flex-shrink-0 relative flex items-center justify-center p-2">
                    <img src={prod.image} className="max-w-full max-h-full object-contain" alt={prod.name} />
                  </div>
                  <div className="flex-1 min-w-0 py-1 pr-2">
                    <div className="flex justify-between items-start">
                      <div className="text-[16px] font-medium leading-tight mb-1 line-clamp-2">{prod.name}</div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">{prod.brand}</div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="text-[16px] font-semibold">{prod.price}</div>
                      <div className="text-sm text-muted-foreground">1szt.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visualizations */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)]/50 rounded-2xl p-4 flex-1 min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-5 shrink-0">
              <h3 className="font-medium text-[20px]">Wizualizacje</h3>
              <button className="text-sm border border-[var(--color-border)]/50 px-3 py-1 rounded-full bg-[#232323] hover:bg-[#232323]/80 transition-colors">Zarządzaj</button>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-0 flex-1">
              {visualizationImages.slice(0, 4).map((imgSrc, i) => (
                <div key={i} className="relative bg-zinc-800 rounded-lg border border-[var(--color-border)]/50 overflow-hidden group w-full h-full">
                  <img src={imgSrc} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Wizualizacja ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
