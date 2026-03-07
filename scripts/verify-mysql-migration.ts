import { createMySQLTables } from "../server/mysql-migrations.js";
import mysql from "mysql2/promise";

async function verifyMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith("mysql://")) {
    console.error("❌ DATABASE_URL not set or not MySQL");
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const config = {
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  console.log("🔍 Connecting to MySQL database...");
  const pool = mysql.createPool(config);

  try {
    // Test connection
    await pool.execute("SELECT 1");
    console.log("✅ Connected to MySQL");

    // Run migrations
    console.log("🗄️ Running MySQL migrations...");
    await createMySQLTables(pool);

    // Verify tables
    const [tables] = await pool.execute("SHOW TABLES");
    const tableNames = tables.map((t: any) => Object.values(t)[0]);
    
    const requiredTables = [
      "admin_users",
      "users",
      "deposits",
      "withdrawals",
      "trading_accounts",
      "documents",
      "support_tickets",
      "support_ticket_replies",
      "notifications",
      "trading_history",
      "admin_country_assignments",
      "activity_logs",
      "fund_transfers",
      "ib_cb_wallets",
      "stripe_payments",
      "crypto_wallets",
      "user_sessions",
    ];

    console.log("\n=== MIGRATION VERIFICATION ===\n");
    let allExist = true;
    requiredTables.forEach((t) => {
      const exists = tableNames.includes(t);
      console.log((exists ? "✓" : "✗") + " " + t);
      if (!exists) allExist = false;
    });

    console.log(`\nTotal tables: ${tableNames.length}`);
    console.log(`Required tables: ${requiredTables.length}`);
    console.log(`Missing: ${requiredTables.filter((t) => !tableNames.includes(t)).length}`);

    if (allExist) {
      console.log("\n✅ All tables exist! Migration complete.");
    } else {
      console.log("\n⚠️ Some tables are missing. Check errors above.");
    }

    await pool.end();
    process.exit(allExist ? 0 : 1);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

verifyMigration();

