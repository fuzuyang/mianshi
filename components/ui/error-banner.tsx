import { ReactNode } from "react";

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm text-red-700">
      {children}
    </div>
  );
}
