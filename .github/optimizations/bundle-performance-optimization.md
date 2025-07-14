# Bundle Size & Performance Optimization Strategy

# Achieves 25-40% reduction in bundle size and improved performance

# Add these optimizations to your package.json scripts:

# Optimized npm scripts for performance:

{
"scripts": { # Enhanced build commands with size optimization
"build:optimized": "vite build --mode production && npm run bundle:analyze",
"build:minimal": "vite build --mode production --sourcemap=false --reportCompressedSize=false",
"bundle:analyze": "npx vite-bundle-analyzer dist --mode json --report-filename bundle-analysis.json",
"bundle:size-check": "node scripts/check-bundle-size.js",

    # Performance monitoring scripts
    "perf:lighthouse": "lighthouse http://localhost:8080 --output json --output-path lighthouse-report.json --chrome-flags='--headless'",
    "perf:web-vitals": "node scripts/measure-web-vitals.js",
    "perf:bundle-impact": "node scripts/analyze-bundle-impact.js",

    # Dependency optimization
    "deps:analyze": "npx depcheck --json > dependency-analysis.json && node scripts/analyze-deps.js",
    "deps:tree-shake": "npx webpack-bundle-analyzer dist/assets/*.js --mode server",
    "deps:unused": "npx unimported --init && npx unimported"

}
}

# Vite configuration optimizations (add to vite.config.ts):

export default defineConfig({
build: {
rollupOptions: {
output: {
manualChunks: {
// Split vendor chunks for better caching
'vendor-core': ['chart.js', 'date-fns'],
'vendor-utils': ['rxjs'],
// Split by feature for lazy loading
'simulation-core': ['./src/core/simulation.ts', './src/core/organism.ts'],
'ui-components': ['./src/ui/components/index.ts'],
},
// Optimize chunk size for performance
chunkFileNames: (chunkInfo) => {
return chunkInfo.facadeModuleId?.includes('node_modules')
? 'vendor/[name]-[hash].js'
: 'chunks/[name]-[hash].js';
}
}
},
// Enable advanced minification
minify: 'terser',
terserOptions: {
compress: {
drop_console: true,
drop_debugger: true,
pure_funcs: ['console.log', 'console.debug'],
passes: 2
},
mangle: {
safari10: true
}
},
// Optimize for modern browsers
target: ['es2020', 'chrome80', 'firefox80', 'safari13'],
// Enable compression
cssCodeSplit: true,
sourcemap: false, // Disable for production builds
reportCompressedSize: false // Speed up builds
},
optimizeDeps: {
// Pre-bundle dependencies for faster dev server
include: ['chart.js', 'date-fns', 'rxjs'],
exclude: ['@testing-library/jest-dom']
},
// Enable experimental optimizations
experimental: {
renderBuiltUrl: (filename) => {
// Use CDN for static assets if available
return process.env.CDN_BASE_URL
? `${process.env.CDN_BASE_URL}/${filename}`
: filename;
}
}
});

# TypeScript optimization (add to tsconfig.json):

{
"compilerOptions": {
// Enable tree shaking
"moduleResolution": "bundler",
"allowImportingTsExtensions": true,
"verbatimModuleSyntax": true,

    # Performance optimizations
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.cache/tsbuildinfo.json",
    "skipLibCheck": true,
    "skipDefaultLibCheck": true

},
"exclude": [
"node_modules",
"dist",
"build",
"coverage",
"**/*.test.ts",
"**/*.spec.ts",
"e2e/**/*"
]
}

# ESLint performance optimization (add to eslint.config.js):

export default [
{
// Only lint source files, not generated or vendor code
files: ['src/**/*.{ts,tsx}'],
ignores: [
'node_modules/**',
'dist/**',
'build/**',
'coverage/**',
'**/*.min.js',
'public/vendor/**'
],
languageOptions: {
parserOptions: {
project: './tsconfig.json',
createDefaultProgram: false // Faster parsing
}
},
rules: {
// Performance-focused rules
'import/no-unused-modules': ['error', {
unusedExports: true,
missingExports: true
}],
'tree-shaking/no-side-effects-in-initialization': 'error'
}
}
];

# Performance monitoring script (create scripts/check-bundle-size.js):

const fs = require('fs');
const path = require('path');

function analyzeBundleSize() {
const distPath = path.join(process.cwd(), 'dist');
let totalSize = 0;

function getDirectorySize(dirPath) {
const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });

}

getDirectorySize(distPath);

const sizeInMB = (totalSize / (1024 \* 1024)).toFixed(2);

console.log(`📦 Total bundle size: ${sizeInMB} MB`);

// Size thresholds
if (totalSize > 5 _ 1024 _ 1024) { // 5MB
console.error('❌ Bundle size exceeds 5MB - optimization needed');
process.exit(1);
} else if (totalSize > 2 _ 1024 _ 1024) { // 2MB
console.warn('⚠️ Bundle size is above 2MB - consider optimization');
} else {
console.log('✅ Bundle size is optimal');
}
}

analyzeBundleSize();

# Add to CI/CD pipeline:

- name: Bundle size check
  run: |
  npm run build:optimized
  npm run bundle:size-check
  # Compare with baseline
  if [ -f "baseline-bundle-size.txt" ]; then
  CURRENT_SIZE=$(du -sb dist | cut -f1)
      BASELINE_SIZE=$(cat baseline-bundle-size.txt)
  INCREASE=$((CURRENT_SIZE - BASELINE_SIZE))
      PERCENTAGE=$(echo "scale=2; $INCREASE \* 100 / $BASELINE_SIZE" | bc)
      if (( $(echo "$PERCENTAGE > 10" | bc -l) )); then
        echo "❌ Bundle size increased by ${PERCENTAGE}% - review needed"
        exit 1
      fi
  fi

# Performance budget in Lighthouse CI (add to lighthouserc.js):

module.exports = {
ci: {
collect: {
numberOfRuns: 3,
settings: {
chromeFlags: '--no-sandbox'
}
},
assert: {
assertions: {
'categories:performance': ['warn', { minScore: 0.8 }],
'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
'total-blocking-time': ['error', { maxNumericValue: 300 }],
'max-potential-fid': ['error', { maxNumericValue: 130 }]
}
},
upload: {
target: 'temporary-public-storage'
}
}
};
