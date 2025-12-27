import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ankieta - Liru.app",
    description: "Wypelnij ankiete dla projektanta wnetrz",
};

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simple layout without dashboard sidebar
    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {children}
        </div>
    );
}
