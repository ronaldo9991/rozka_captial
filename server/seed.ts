import { getDb } from "./db";
import { users, adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    const db = await getDb();
    // Check if demo user exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      console.log("Creating demo user...");
      // Create demo user
      await db.insert(users).values({
        username: "demo",
        password: await bcrypt.hash("demo123", 10),
        email: "demo@binofox.com",
        fullName: "Demo User",
        phone: "+1234567890",
        country: "United States",
        city: "New York",
        address: "123 Trading Street",
        zipCode: "10001",
        verified: true,
        enabled: true,
      });
      console.log("✓ Demo user created");
    }

    // Check and create admin users individually (in case some exist but others don't)
    console.log("Checking admin users...");
    
    const adminConfigs = [
      {
        username: "superadmin",
        password: "Admin@12345",
        email: "superadmin@binofox.com",
        fullName: "Super Administrator",
        role: "super_admin",
      },
      {
        username: "middleadmin",
        password: "Middle@12345",
        email: "middleadmin@binofox.com",
        fullName: "Middle Administrator",
        role: "middle_admin",
      },
      {
        username: "normaladmin",
        password: "Normal@12345",
        email: "normaladmin@binofox.com",
        fullName: "Normal Administrator",
        role: "normal_admin",
      },
    ];

    for (const adminConfig of adminConfigs) {
      try {
        const existing = await db.select().from(adminUsers)
          .where(eq(adminUsers.username, adminConfig.username))
          .limit(1);
        
        if (existing.length === 0) {
          console.log(`Creating ${adminConfig.role}...`);
          await db.insert(adminUsers).values({
            username: adminConfig.username,
            password: await bcrypt.hash(adminConfig.password, 10),
            email: adminConfig.email,
            fullName: adminConfig.fullName,
            role: adminConfig.role,
            enabled: true,
            createdBy: null,
          });
          console.log(`✓ ${adminConfig.role} created`);
        } else {
          // Update password hash in case it was changed or corrupted
          const hashedPassword = await bcrypt.hash(adminConfig.password, 10);
          await db.update(adminUsers)
            .set({ 
              password: hashedPassword,
              enabled: true, // Ensure admin is enabled
            })
            .where(eq(adminUsers.username, adminConfig.username));
          console.log(`✓ ${adminConfig.role} already exists, password updated`);
        }
      } catch (error: any) {
        console.error(`Error creating/updating ${adminConfig.role}:`, error.message);
        // Continue with other admins even if one fails
      }
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

