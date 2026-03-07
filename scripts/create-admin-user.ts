import { getDb } from "../server/db.js";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function createAdminUser() {
  try {
    const db = await getDb();
    
    const adminConfig = {
      username: "superadmin",
      password: "Admin@12345",
      email: "superadmin@binofox.com",
      fullName: "Super Administrator",
      role: "super_admin",
    };

    // Check if admin exists
    const existing = await db.select().from(adminUsers)
      .where(eq(adminUsers.username, adminConfig.username))
      .limit(1);
    
    if (existing.length > 0) {
      console.log("Admin user already exists, updating password...");
      const hashedPassword = await bcrypt.hash(adminConfig.password, 10);
      await db.update(adminUsers)
        .set({ 
          password: hashedPassword,
          enabled: true,
        })
        .where(eq(adminUsers.username, adminConfig.username));
      console.log("✓ Admin user password updated");
    } else {
      console.log("Creating admin user...");
      await db.insert(adminUsers).values({
        id: randomUUID(),
        username: adminConfig.username,
        password: await bcrypt.hash(adminConfig.password, 10),
        email: adminConfig.email,
        fullName: adminConfig.fullName,
        role: adminConfig.role,
        enabled: true,
        createdBy: null,
      });
      console.log("✓ Admin user created");
    }
    
    console.log("✅ Done!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdminUser();

