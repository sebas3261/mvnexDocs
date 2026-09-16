import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const origin = site?.origin ?? "https://mvnex.sebas3261.com";

  return new Response(
    ["User-agent: *", "Allow: /", "", `Sitemap: ${origin}/sitemap-index.xml`, ""].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
