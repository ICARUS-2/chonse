import { withSentryConfig } from "@sentry/nextjs";
import { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { BASE_PATH } from "@/globals";

const nextConfig = (phase: string): NextConfig => ({
  output: "export",
  basePath: '/chonse',
  assetPrefix: BASE_PATH,
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "/chonse",
  },
  headers:
    phase === PHASE_PRODUCTION_BUILD
      ? undefined
      : async () => [
          {
            source: "/",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
          {
            source: "/engines/:blob*",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
              {
                key: "Cache-Control",
                value: "public, max-age=31536000, immutable",
              },
              {
                key: "Age",
                value: "181921",
              },
            ],
          },
          {
            source: "/play",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
          {
            source: "/database",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "require-corp",
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin",
              },
            ],
          },
        ],
});

export default withSentryConfig(nextConfig, {
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
  org: process.env.SENTRY_ORG,
  project: "javascript-nextjs",
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  hideSourceMaps: true,
  disableLogger: true,
  telemetry: false
});
