import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/premium")({
  server: {
    handlers: {
      GET: () => new Response(null, { status: 405, headers: { allow: "POST" } }),
      POST: async ({ request }: { request: Request }) => {
        const { handleVerify } = await import("@/server/explain-handler.server");
        return handleVerify(request);
      },
    },
  },
});
