import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/explain")({
  server: {
    handlers: {
      GET: () => new Response(null, { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const { handleExplain } = await import("@/server/explain-handler.server");
        return handleExplain(request);
      },
    },
  },
});
