#!/usr/bin/env tsx
/**
 * Setup Verification Script
 * Verifies that all connections (Database, MT5) are properly configured
 */

import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

interface VerificationResult {
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
}

const results: VerificationResult[] = [];

function addResult(name: string, status: "pass" | "fail" | "warning", message: string) {
  results.push({ name, status, message });
  const icon = status === "pass" ? "✅" : status === "fail" ? "❌" : "⚠️";
  console.log(`${icon} ${name}: ${message}`);
}

async function checkEnvironmentVariables() {
  console.log("\n📋 Checking Environment Variables...\n");
  
  // Check all possible sources (process.env, .env file, deployment platform)
  const envSources = [
    "process.env (runtime)",
    process.env.RAILWAY_ENVIRONMENT ? "Railway" : null,
    process.env.VERCEL ? "Vercel" : null,
    process.env.AWS_EXECUTION_ENV ? "AWS" : null,
  ].filter(Boolean);
  
  if (envSources.length > 0) {
    console.log(`   Environment detected from: ${envSources.join(", ")}`);
  }
  
  const required = ["SESSION_SECRET"];
  const optional = [
    "DATABASE_URL", 
    "DATABASE_PUBLIC_URL",
    "MT5_HOST", 
    "MT5_ENABLED", 
    "MT5_MANAGER_LOGIN",
    "MT5_MANAGER_PASSWORD",
    "STRIPE_SECRET_KEY",
    "NODE_ENV",
    "PORT"
  ];
  
  for (const key of required) {
    const value = process.env[key];
    if (value) {
      // Mask sensitive values
      const displayValue = key.includes("SECRET") || key.includes("PASSWORD") 
        ? "***" + value.slice(-4) 
        : value.length > 50 
          ? value.substring(0, 30) + "..." 
          : value;
      addResult(`Env: ${key}`, "pass", `Set (${displayValue})`);
    } else {
      addResult(`Env: ${key}`, "fail", "Missing (required)");
    }
  }
  
  for (const key of optional) {
    const value = process.env[key];
    if (value) {
      const displayValue = key.includes("SECRET") || key.includes("PASSWORD") || key.includes("KEY")
        ? "***" + value.slice(-4)
        : key === "DATABASE_URL" && value.length > 30
          ? value.substring(0, 30) + "..." 
          : value;
      addResult(`Env: ${key}`, "pass", `Set (${displayValue})`);
    } else {
      addResult(`Env: ${key}`, "warning", "Not set (optional)");
    }
  }
  
  // Check for deployment platform specific variables
  if (process.env.RAILWAY_ENVIRONMENT) {
    addResult("Platform: Railway", "pass", "Detected");
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway")) {
      addResult("Database: Railway PostgreSQL", "pass", "Auto-configured");
    }
  }
  
  if (process.env.VERCEL) {
    addResult("Platform: Vercel", "pass", "Detected");
  }
}

async function checkDatabase() {
  console.log("\n🗄️  Checking Database Connection...\n");
  
  try {
    const { dbInit, ensureDbReady } = await import("../server/db.js");
    await dbInit;
    const db = await ensureDbReady();
    
    // Try a simple query
    if (process.env.DATABASE_URL?.startsWith("postgresql://") || 
        process.env.DATABASE_URL?.startsWith("postgres://")) {
      const { pool } = await import("../server/db.js");
      if (pool) {
        const result = await pool.query("SELECT NOW() as current_time");
        addResult("Database: PostgreSQL", "pass", `Connected - Server time: ${result.rows[0].current_time}`);
      } else {
        addResult("Database: PostgreSQL", "fail", "Connection pool not initialized");
      }
    } else {
      // SQLite
      const result = await db.select().from((await import("../shared/schema.js")).users).limit(1);
      addResult("Database: SQLite", "pass", "Connected and accessible");
    }
  } catch (error: any) {
    addResult("Database", "fail", `Connection failed: ${error.message}`);
  }
}

async function checkMT5() {
  console.log("\n🔌 Checking MT5 Integration...\n");
  
  const mt5Enabled = process.env.MT5_ENABLED === "true";
  
  if (!mt5Enabled) {
    addResult("MT5: Status", "warning", "MT5 integration is disabled (MT5_ENABLED=false)");
    return;
  }
  
  // Check required MT5 environment variables
  const required = ["MT5_HOST", "MT5_MANAGER_LOGIN", "MT5_MANAGER_PASSWORD"];
  let allSet = true;
  
  for (const key of required) {
    if (!process.env[key]) {
      addResult(`MT5: ${key}`, "fail", "Missing (required when MT5_ENABLED=true)");
      allSet = false;
    } else {
      addResult(`MT5: ${key}`, "pass", "Set");
    }
  }
  
  if (!allSet) {
    addResult("MT5: Connection", "fail", "Cannot test connection - missing credentials");
    return;
  }
  
  // Check PHP installation
  try {
    await new Promise<void>((resolve, reject) => {
      const php = spawn(process.env.PHP_BINARY || "php", ["--version"]);
      let output = "";
      
      php.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      php.on("close", (code) => {
        if (code === 0) {
          const version = output.match(/PHP (\d+\.\d+)/)?.[1] || "unknown";
          addResult("MT5: PHP", "pass", `Installed (version ${version})`);
          resolve();
        } else {
          addResult("MT5: PHP", "fail", "PHP not found or not working");
          reject(new Error("PHP not available"));
        }
      });
      
      php.on("error", () => {
        addResult("MT5: PHP", "fail", "PHP not found in PATH");
        reject(new Error("PHP not found"));
      });
    });
  } catch (error) {
    addResult("MT5: Connection", "fail", "Cannot test - PHP not available");
    return;
  }
  
  // Check MT5 API files
  const fs = await import("fs");
  const mt5ApiPath = join(rootDir, "mt5_api", "mt5_api.php");
  if (fs.existsSync(mt5ApiPath)) {
    addResult("MT5: API Files", "pass", "MT5 API files found");
  } else {
    addResult("MT5: API Files", "fail", "MT5 API files not found");
    return;
  }
  
  // Try to ping MT5 server
  try {
    const { mt5Service } = await import("../server/mt5-service.js");
    const isAlive = await mt5Service.ping();
    if (isAlive) {
      addResult("MT5: Connection", "pass", "Successfully connected to MT5 server");
    } else {
      addResult("MT5: Connection", "fail", "Cannot connect to MT5 server - check credentials and network");
    }
  } catch (error: any) {
    addResult("MT5: Connection", "fail", `Connection test failed: ${error.message}`);
  }
}

async function checkStripe() {
  console.log("\n💳 Checking Stripe Configuration...\n");
  
  if (process.env.STRIPE_SECRET_KEY) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key.startsWith("sk_live_")) {
      addResult("Stripe: Mode", "pass", "Production mode (LIVE)");
    } else if (key.startsWith("sk_test_")) {
      addResult("Stripe: Mode", "warning", "Test mode (TEST)");
    } else {
      addResult("Stripe: Mode", "fail", "Invalid key format");
    }
    
    if (process.env.STRIPE_PUBLISHABLE_KEY) {
      addResult("Stripe: Publishable Key", "pass", "Set");
    } else {
      addResult("Stripe: Publishable Key", "warning", "Not set (frontend payments may not work)");
    }
  } else {
    addResult("Stripe: Configuration", "warning", "Not configured (payments will be disabled)");
  }
}

async function checkFileStructure() {
  console.log("\n📁 Checking File Structure...\n");
  
  const fs = await import("fs");
  const requiredDirs = [
    "server",
    "client",
    "shared",
    "mt5_api",
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      addResult(`Directory: ${dir}`, "pass", "Exists");
    } else {
      addResult(`Directory: ${dir}`, "fail", "Missing");
    }
  }
  
  const requiredFiles = [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "drizzle.config.ts",
    "server/index.ts",
    "shared/schema.ts",
  ];
  
  for (const file of requiredFiles) {
    const filePath = join(rootDir, file);
    if (fs.existsSync(filePath)) {
      addResult(`File: ${file}`, "pass", "Exists");
    } else {
      addResult(`File: ${file}`, "fail", "Missing");
    }
  }
}

async function main() {
  console.log("🚀 Binofox Platform Setup Verification\n");
  console.log("=" .repeat(50));
  
  await checkFileStructure();
  await checkEnvironmentVariables();
  await checkDatabase();
  await checkMT5();
  await checkStripe();
  
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Summary:\n");
  
  const passed = results.filter(r => r.status === "pass").length;
  const failed = results.filter(r => r.status === "fail").length;
  const warnings = results.filter(r => r.status === "warning").length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log("\n❌ Some checks failed. Please fix the issues above before deploying.");
    process.exit(1);
  } else if (warnings > 0) {
    console.log("\n⚠️  Some optional configurations are missing, but the system should work.");
    process.exit(0);
  } else {
    console.log("\n✅ All checks passed! Your setup looks good.");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("\n❌ Verification script error:", error);
  process.exit(1);
});

