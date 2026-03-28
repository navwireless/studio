// src/app/admin/layout.tsx
import type { Metadata } from "next";
import AdminSidebar from "@/components/layout/admin-sidebar";

export const metadata: Metadata = {
    title: "Admin Panel",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}