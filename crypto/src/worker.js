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
		const url = new URL(request.url);
		const filename = url.pathname.split("/").slice(-1)[0];

		if (filename === "key.bin") {
			let keypair = await Crypto.getKeyPair();
			return new Response(keypair.key, {
				headers: {
					"Access-Control-Allow-Origin": "*"
				}
			});
		}

		if (filename.match( /(\.m3u8)$/ )) {
			let manifest_req = await fetch(request);
			var manifest = await manifest_req.text();

			let keypair = await Crypto.getKeyPair();
			manifest = manifest.replace("{{iv}}", Crypto.utils.hexFromBytes(keypair.iv));

			return new Response(manifest, {
				headers: {
					"Content-Type": "application/x-mpegurl",
					"Access-Control-Allow-Origin": "*"
				}
			})
		}

		if (filename.match( /(\.ts|\.fmp4)$/ )) {
			let chunk_req = await fetch(request);
			let chunk = await chunk_req.blob();
			let buffer = await chunk.arrayBuffer();

			let encrypted = await Crypto.encrypt(buffer);

			return new Response(encrypted, {
				headers: {
					"Content-Type": chunk_req.headers.get("Content-Type"),
					"Access-Control-Allow-Origin": "*"
				}
			})
		}

		return new Response("404", {
			status: 404
		});
	},
};

const Crypto = {
	getKeyPair: async function() {
		// generate a "key" 
		let today = new Date().toUTCString().slice(0, 16) + "super_secret_salt";

		// hash it 
		const encoder = new TextEncoder();
		const data = encoder.encode(today);
		const hash = await crypto.subtle.digest("SHA-256", data);

		// Cut it in half because we only need 128 bit
		return {
			key: hash.slice(0, hash.byteLength / 2),
			iv: hash.slice(-(hash.byteLength / 2))
		}
	},
	encrypt: async function(data) {
		let keypair = await this.getKeyPair();
		let aesKey = await crypto.subtle.importKey(
			"raw",
			keypair.key,
			"AES-CBC",
			true,
			["encrypt", "decrypt"]
		);
		let cipher = await crypto.subtle.encrypt(
			{
				"name": "AES-CBC",
				"iv": keypair.iv
			},
			aesKey,
			data
		);

		return cipher;
	},
	utils: {
		bytesFromHex: function(hexString) {
			// https://stackoverflow.com/a/50868276
			return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
		},
		hexFromBytes: function(bytes) {
			// https://stackoverflow.com/a/50868276 + https://stackoverflow.com/a/40031979
			return [...new Uint8Array(bytes)].reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
		},
	}
}