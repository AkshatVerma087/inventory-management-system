"use client";

import { useEffect, useState } from "react";

export function CountdownTimer({
  expiresAt,
  status,
}: {
  expiresAt: string;
  status: string;
}) {
  const [remaining, setRemaining] = useState(
    Math.max(0, new Date(expiresAt).getTime() - Date.now())
  );

  useEffect(() => {
    if (remaining <= 0 || status !== "PENDING") return;

    const interval = setInterval(() => {
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setRemaining(diff);

      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, status, remaining]);

  if (remaining <= 0 || status !== "PENDING") {
    return <span className="text-destructive font-medium">Expired</span>;
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  const isUrgent = remaining < 60000;

  return (
    <span
      className={
        isUrgent
          ? "text-destructive font-medium animate-pulse"
          : "font-medium"
      }
    >
      {mins}:{secs}
    </span>
  );
}
