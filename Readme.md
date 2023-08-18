# Bnuuy

A [Cloudflare Workers](https://developers.cloudflare.com/workers/) demo, serving Big Buck Bunny (and maybe others soon). 

### Streams

```
https://bnuuy.stream/assets/big_buck_bunny/index.m3u8
```

```
https://bnuuy.stream/encrypted/big_buck_bunny/index.m3u8
```


## Components


### Web

The `web` directory stores the website and video files. It's uploaded and served by [Cloudflare Pages](https://developers.cloudflare.com/pages/) as-is.


### Analytics 

A small Worker that dumps some logs from incoming request into [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) then 
forwards the request on. 


### Crypto

Catches requests under the `encrypted/` path and rewrites the HLS manifests to include an `EXT-X-KEY`. Also catches requests for media chunks and 
encrypts them on the fly with the same key. Keys are generated dynamically, based on the current date for simplicity.


### Stats

Queries [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/) and totals up view-counts for the different manifests. 

