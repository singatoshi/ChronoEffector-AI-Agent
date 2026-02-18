import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { Header } from "../components/layout/Header";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function RootComponent() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="dark min-h-screen bg-neutral-950 text-zinc-50">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
