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
		
		let api_key = env.API_KEY;
		let account_id = env.ACCOUNT_ID;

		let query_url = `https://api.cloudflare.com/client/v4/accounts/${account_id}/analytics_engine/sql`;

		async function sql_query(sql) {
			let query = await fetch(query_url, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${api_key}`
				},
				body: sql
			});
			return await query.text();
		}

		let pages_sql = `
			SELECT
				index1 AS path,
				count() AS view_count
			FROM bnuuy_stats
			GROUP BY path
			FORMAT JSON
		`;

		let pages_results = await sql_query(pages_sql)

		function is_watched_path(path) {
			return !path.match( /(\.m3u8)/ )
		}

		
		let json = JSON.parse(pages_results);
		let filtered = json.data.filter(entry => {
			return is_watched_path(entry.path)
		});

		return new Response(JSON.stringify(filtered, null, 2));
	},
};
