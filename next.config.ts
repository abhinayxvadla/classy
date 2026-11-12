import type { NextConfig } from "next";
import querystring from "node:querystring";
import withSerwistInit from "@serwist/next";

// Patch querystring.escape to encode '!' as '%21' to prevent Webpack
// from splitting workspace paths containing '!' (e.g. UniGo!) as loader delimiters.
const origEscape = querystring.escape;
querystring.escape = (str: string) => {
  return origEscape(str).replace(/!/g, "%21");
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
