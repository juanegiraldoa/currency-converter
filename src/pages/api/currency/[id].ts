import type { APIRoute } from "astro";

const BASE_URL = "https://duckduckgo.com/js/spice/currency_convert";

export interface Currency {
	timestamp: Date;
}

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, url }) => {
	const currency = params.id;
	if (!currency) return new Response("Send currency param");

	const searchParams = new URLSearchParams(url.search);
	const amount = parseFloat(searchParams.get("amount") || "1");

	const { CURRENCIES } = locals.runtime.env;
	const currentString = (await CURRENCIES.get(currency)) || "{}";
	const current = JSON.parse(currentString) as Currency;

	const today = new Date();
	const currentTime = new Date(current.timestamp);

	if (today.getMinutes() !== currentTime.getMinutes()) {
		const response = await fetch(`${BASE_URL}/${amount}/USD/${currency}`);
		const data = await response.json();
		const { to, timestamp } = data as any;
		const [quote] = to;
		const result = { ...quote, timestamp, amount };
		CURRENCIES.put(currency, JSON.stringify(result));
		return new Response(JSON.stringify(result));
	}

	const result = { ...current, amount };
	return new Response(JSON.stringify(result));
};
