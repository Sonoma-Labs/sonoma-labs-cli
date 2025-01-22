#!/usr/bin/env node

// Check Node.js version
const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.');
const major = semver[0];

if (major < 16) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Sonoma Labs CLI requires Node 16 or higher. \n' +
      'Please update your version of Node.'
  );
  process.exit(1);
}

// Enable source map support for stack traces
require('source-map-support').install();

// Handle uncaught errors
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Import and run CLI
require('../dist/index.js');