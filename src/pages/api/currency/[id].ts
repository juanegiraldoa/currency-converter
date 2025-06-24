import type { APIRoute } from "astro";

const URL = "https://duckduckgo.com/js/spice/currency_convert/1/USD";

export interface Currency {
  timestamp: Date;
}

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const currency = params.id;
  if (!currency) return new Response("Send currency param");

  const { CURRENCIES } = locals.runtime.env;
  const currentString = (await CURRENCIES.get(currency)) || "{}";
  const current = JSON.parse(currentString) as Currency;

  const today = new Date();
  const currentTime = new Date(current.timestamp);

  if (today.getMinutes() !== currentTime.getMinutes()) {
    const response = await fetch(`${URL}/${currency}`);
    const data = await response.json();
    const { to, timestamp } = data as any;
    const [quote] = to;
    CURRENCIES.put(currency, JSON.stringify({ ...quote, timestamp }));
    return new Response(JSON.stringify({ ...quote, timestamp }));
  }

  return new Response(JSON.stringify(current));
};
