// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
	// For best results consider enabling R2 caching
	// See https://opennext.js.org/cloudflare/caching for more details
	// incrementalCache: r2IncrementalCache
});

// Avoid resolving the `workerd` condition for pg-cloudflare during bundle-time.
config.cloudflare = {
  ...config.cloudflare,
  useWorkerdCondition: false,
};

export default config;
