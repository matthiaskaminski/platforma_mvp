import React from "react";
import { ChevronLeft, ChevronRight, Search, Settings, Filter, ChevronDown, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevDate: () => void;
    onNextDate: () => void;
    onToday: () => void;
    view: "month" | "week" | "day";
    onViewChange: (view: "month" | "week" | "day") => void;
}

export function CalendarHeader({ currentDate, onPrevDate, onNextDate, onToday, view, onViewChange }: CalendarHeaderProps) {
    const formattedDate = format(currentDate, "LLLL yyyy", { locale: pl });
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <div className="mb-3 shrink-0">
            <div className="bg-[#151515] px-4 h-[80px] rounded-2xl flex flex-col xl:flex-row gap-4 items-center justify-between">

                {/* Left Side: Search */}
                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative group flex-1 xl:w-[350px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-white transition-colors z-10" />
                        <Input
                            type="text"
                            placeholder="Wyszukaj w kalendarzu..."
                            className="w-full pl-10"
                        />
                    </div>
                </div>

                {/* Right Side: Filters & Navigation */}
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">

                    {/* Filters */}
                    <Button variant="secondary">
                        Osoba przypisana <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                    </Button>
                    <Button variant="secondary">
                        Typ <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                    </Button>
                    <Button variant="secondary">
                        Status <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                    </Button>

                    {/* Divider */}
                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    {/* Date Nav */}
                    <Button variant="secondary" onClick={onToday}>
                        Dzisiaj
                    </Button>

                    <div className="flex items-center bg-[#1B1B1B] rounded-xl p-1 h-[48px]">
                        <Button variant="ghost" size="icon" onClick={onPrevDate} className="h-full w-9 hover:bg-white/5 text-muted-foreground hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground px-4 min-w-[140px] text-center">
                            {capitalizedDate}
                        </span>
                        <Button variant="ghost" size="icon" onClick={onNextDate} className="h-full w-9 hover:bg-white/5 text-muted-foreground hover:text-white">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    <Button variant="secondary" onClick={() => onViewChange("month")}>
                        Miesiąc <ChevronDown className="w-4 h-4 opacity-50 ml-1" />
                    </Button>

                    <div className="flex gap-2 ml-2">
                        <Button variant="secondary" size="icon">
                            <List className="w-5 h-5" />
                        </Button>
                        <Button variant="secondary" size="icon">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
