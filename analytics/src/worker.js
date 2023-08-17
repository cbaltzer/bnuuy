/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		let url = new URL(request.url);
		let path = url.pathname;
		env.ANALYTICS.writeDataPoint({
			'blobs': [
				request.cf.colo,
				request.cf.city,
				request.cf.postalCode,
				request.cf.region,
				request.cf.timezone,
				request.cf.country
			],
			'doubles': [
				request.cf.metroCode,
				request.cf.longitude,
				request.cf.latitude
			],
			'indexes': [
				path
			]
		});

		return fetch(request);
	},
};
