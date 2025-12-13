import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { getUserProjects, getActiveProjectId } from "./actions/projects";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liru.app MVP",
  description: "Interior Design Platform MVP",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user and their projects for the sidebar
  let projects: Array<{
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    status: string;
    createdAt: Date;
  }> = [];
  let currentProjectId = '';
  let user: {
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser?.email) {
      const profile = await prisma.profile.findUnique({
        where: { email: authUser.email },
        select: {
          email: true,
          fullName: true,
          avatarUrl: true,
        }
      });

      if (profile) {
        user = profile;
        projects = await getUserProjects();

        // Get active project from cookie or use first project
        let activeId = await getActiveProjectId();
        if (!activeId && projects.length > 0) {
          activeId = projects[0].id;
        }
        currentProjectId = activeId || '';
      }
    }
  } catch (error) {
    console.error('Error loading layout data:', error);
  }

  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ClientLayout
          projects={projects.map(p => ({
            ...p,
            icon: p.icon || undefined,
            color: p.color || undefined
          }))}
          currentProjectId={currentProjectId}
          user={user ? {
            email: user.email,
            fullName: user.fullName || undefined,
            avatarUrl: user.avatarUrl || undefined
          } : undefined}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
