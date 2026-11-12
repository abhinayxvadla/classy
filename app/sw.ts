import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: [
    // 1. Opened notes pages: NetworkFirst with 30-day offline cache
    {
      matcher({ request, url }) {
        return (
          request.destination === "document" &&
          (url.pathname.startsWith("/s/items/") ||
            url.pathname.includes("/items/"))
        );
      },
      handler: new NetworkFirst({
        cacheName: "classy-notes-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // 2. All other HTML pages: NetworkFirst
    {
      matcher({ request }) {
        return request.destination === "document";
      },
      handler: new NetworkFirst({
        cacheName: "classy-pages-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    // 3. Static assets: CSS, JS, Images: StaleWhileRevalidate
    {
      matcher({ request }) {
        return ["style", "script", "worker", "image"].includes(
          request.destination
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "classy-static-assets",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 128,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 4. Web Fonts: StaleWhileRevalidate
    {
      matcher({ request, url }) {
        return (
          request.destination === "font" ||
          url.origin === "https://fonts.gstatic.com" ||
          url.origin === "https://fonts.googleapis.com"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "classy-fonts-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Fall back to Serwist default cache for any unmatched assets
    ...defaultCache,
  ],
});

serwist.addEventListeners();
