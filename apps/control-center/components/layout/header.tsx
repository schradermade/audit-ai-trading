"use client";

import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Control Center</h2>
        <Badge variant="outline">Development</Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Placeholder for future user menu, notifications, etc. */}
      </div>
    </header>
  );
}
