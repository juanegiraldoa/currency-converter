import type { APIRoute } from "astro";

const BASE_URL = "https://duckduckgo.com/js/spice/currency_convert";
const CACHE_TTL = 60;

export interface Currency {
  timestamp: Date;
  converted: number;
  conversion: number;
  amount: number;
}

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, url }) => {
  const currency = params.id;
  if (!currency) return new Response("Send currency param");

  const searchParams = new URLSearchParams(url.search);
  const amount = parseFloat(searchParams.get("amount") || "1");
  const force = searchParams.get("force") === "true";

  const { CURRENCIES } = locals.runtime.env;

  if (!force) {
    const cachedData = await CURRENCIES.get(currency);

    if (cachedData) {
      const cached = JSON.parse(cachedData) as Currency;
      const cacheTime = new Date(cached.timestamp);
      const now = new Date();
      const cacheAge = (now.getTime() - cacheTime.getTime()) / 1000;

      if (cacheAge < CACHE_TTL) {
        const result = {
          ...cached,
          amount,
          cached: true,
          cacheAge: Math.floor(cacheAge),
        };
        return new Response(JSON.stringify(result));
      }
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/${amount}/USD/${currency}`);
    const data = await response.json();
    const { to, timestamp } = data as any;
    const [quote] = to;
    const result = {
      ...quote,
      timestamp,
      amount,
      cached: false,
    };

    await CURRENCIES.put(currency, JSON.stringify(result), {
      expirationTtl: CACHE_TTL,
    });

    return new Response(JSON.stringify(result));
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch currency data",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
};
