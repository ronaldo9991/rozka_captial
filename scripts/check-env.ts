#!/usr/bin/env tsx
/**
 * Quick Environment Variables Check
 * Shows what environment variables are currently set
 */

import "dotenv/config";

console.log("🔍 Current Environment Variables Status\n");
console.log("=" .repeat(60));

const categories = {
  "Required": [
    "SESSION_SECRET",
  ],
  "Database": [
    "DATABASE_URL",
    "DATABASE_PUBLIC_URL",
    "DATABASE_PATH",
  ],
  "MT5 Integration": [
    "MT5_ENABLED",
    "MT5_HOST",
    "MT5_PORT",
    "MT5_MANAGER_LOGIN",
    "MT5_MANAGER_PASSWORD",
    "PHP_BINARY",
  ],
  "Stripe": [
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  "Server": [
    "NODE_ENV",
    "PORT",
  ],
  "Platform": [
    "RAILWAY_ENVIRONMENT",
    "VERCEL",
    "AWS_EXECUTION_ENV",
  ],
};

function maskValue(key: string, value: string): string {
  if (key.includes("SECRET") || key.includes("PASSWORD") || key.includes("KEY")) {
    return value.length > 8 ? "***" + value.slice(-4) : "***";
  }
  if (key === "DATABASE_URL" && value.length > 40) {
    return value.substring(0, 30) + "..." + value.slice(-10);
  }
  if (value.length > 50) {
    return value.substring(0, 30) + "...";
  }
  return value;
}

let totalSet = 0;
let totalMissing = 0;

for (const [category, keys] of Object.entries(categories)) {
  console.log(`\n📦 ${category}:`);
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      const display = maskValue(key, value);
      console.log(`   ✅ ${key} = ${display}`);
      totalSet++;
    } else {
      console.log(`   ❌ ${key} = (not set)`);
      totalMissing++;
    }
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Set: ${totalSet}`);
console.log(`   ❌ Missing: ${totalMissing}`);

// Check deployment platform
console.log(`\n🌐 Deployment Platform:`);
if (process.env.RAILWAY_ENVIRONMENT) {
  console.log(`   ✅ Railway detected`);
}
if (process.env.VERCEL) {
  console.log(`   ✅ Vercel detected`);
}
if (process.env.AWS_EXECUTION_ENV) {
  console.log(`   ✅ AWS detected`);
}
if (!process.env.RAILWAY_ENVIRONMENT && !process.env.VERCEL && !process.env.AWS_EXECUTION_ENV) {
  console.log(`   ℹ️  Local/Development environment`);
}

// Check critical variables
console.log(`\n🔐 Critical Variables:`);
const critical = ["SESSION_SECRET", "DATABASE_URL"];
let allCriticalSet = true;
for (const key of critical) {
  if (process.env[key]) {
    console.log(`   ✅ ${key} is set`);
  } else {
    console.log(`   ❌ ${key} is MISSING (required)`);
    allCriticalSet = false;
  }
}

if (allCriticalSet) {
  console.log(`\n✅ All critical variables are set!`);
  process.exit(0);
} else {
  console.log(`\n⚠️  Some critical variables are missing.`);
  console.log(`   Please set them in your deployment platform or .env file.`);
  process.exit(1);
}

