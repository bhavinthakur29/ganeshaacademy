"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4">
      <h2 className="text-xl font-semibold text-primary">Something went wrong</h2>
      <p className="text-muted-foreground text-center">{error?.message}</p>
      <Button onClick={() => reset()} variant="default">
        Try again
      </Button>
    </div>
  );
}
