import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  
  experimental: {
    
  }
};

export default nextConfig;

/**
 * import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // === CORE CONFIGURATION ===
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // === RENDERING ===
  trailingSlash: false,
  skipTrailingSlashRedirect: false,
  
  // === IMAGE OPTIMIZATION ===
  images: {
    domains: ['example.com', 'assets.vercel.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
        port: '',
        pathname: '/assets/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default',
    path: '/_next/image',
    loaderFile: '',
  },

  // === COMPILER ===
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: {
      displayName: true,
      ssr: true,
      fileName: false,
      cssProp: true,
      namespace: '',
      minify: true,
      transpileTemplateLiterals: true,
      pure: false,
    },
    emotion: {
      sourceMap: true,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    },
  },

  // === EXPERIMENTAL FEATURES ===
  experimental: {
    appDir: true,
    serverActions: true,
    serverComponentsExternalPackages: ['mongoose', 'typeorm'],
    typedRoutes: true,
    optimizeCss: true,
    scrollRestoration: true,
    optimizePackageImports: ['@heroicons/react', 'lodash'],
    instrumentationHook: true,
    webpackBuildWorker: true,
    optimizeServerReact: true,
    ppr: false, // Partial Prerendering
    // Turbopack options (if using)
    turbopack: {
      resolveAlias: {
        '~': './src',
      },
    },
  },

  // === WEBPACK CONFIG ===
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Custom webpack configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '~': './src',
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Important: return the modified config
    return config
  },

  // === ENVIRONMENT VARIABLES ===
  env: {
    CUSTOM_KEY: 'custom-value',
    API_URL: process.env.API_URL,
  },

  // === PUBLIC RUNTIME CONFIG ===
  publicRuntimeConfig: {
    staticFolder: '/static',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },

  // === SERVER RUNTIME CONFIG ===
  serverRuntimeConfig: {
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,
  },

  // === HEADERS ===
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },

  // === REDIRECTS ===
  async redirects() {
    return [
      {
        source: '/old-blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/redirect',
        destination: '/target',
        permanent: false,
      },
    ]
  },

  // === REWRITES ===
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.example.com/:path*',
      },
      {
        source: '/rewrite',
        destination: '/another-page',
      },
    ]
  },

  // === I18N ===
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
    localeDetection: true,
    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en',
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
      },
    ],
  },

  // === OUTPUT ===
  output: 'standalone', // or 'export' for static export

  // === STATIC EXPORT ===
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',
  basePath: '/docs', // for when your app is under a subpath

  // === BUNDLE ANALYSIS ===
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
  },

  // === TYPESCRIPT ===
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // === ESLINT ===
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'lib'],
  },

  // === CUSTOM PAGE EXTENSIONS ===
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // === ON DEMAND ENTRY HANDLING ===
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // === COMPRESSION ===
  compress: true,

  // === LOGGING ===
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // === MODULARIZE IMPORTS ===
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },

  // === CACHE HANDLING ===
  cacheHandler: undefined, // For custom cache handlers
  cacheMaxMemorySize: 50, // MB

  // === TRANSITIVE PACKAGES ===
  transpilePackages: ['@acme/ui', 'lodash-es'],

  // === SECURITY ===
  skipMiddlewareUrlNormalize: false,
  skipTrailingSlashRedirect: false,
}

export default nextConfig
 */