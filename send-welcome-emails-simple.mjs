#!/usr/bin/env node

/**
 * Send Welcome Emails to All Users
 * Uses the compiled backend to send emails
 */

import { storage } from './dist/server/storage.js';
import { sendWelcomeEmail } from './dist/server/services/email.js';

async function sendWelcomeEmailsToAllUsers() {
  console.log('🚀 Starting Welcome Email Campaign...\n');
  
  try {
    // Get all users - we'll need to query the database directly
    // For now, let's use a workaround by getting users from activity logs or creating an endpoint
    // Actually, let's use the database directly via storage
    
    // Since we don't have getAllUsers, let's create a simple script that uses the API
    console.log('📧 This script will send welcome emails to all users.');
    console.log('   Please use the admin panel or API endpoint to trigger this.\n');
    console.log('   Alternatively, we can create an admin endpoint for this.\n');
    
    // For now, let's create a simple version that works with what we have
    // We'll need to access the database directly
    
    const { getDb } = await import('./dist/server/db.js');
    const { users } = await import('./dist/shared/schema.js');
    const db = await getDb();
    
    // Get all users
    const allUsers = await db.select().from(users);
    
    console.log(`📊 Found ${allUsers.length} users in the database\n`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found to send emails to.');
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Send emails to all users
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const userName = user.fullName || user.username || 'Trader';
      const referralId = user.referralId || 'N/A';
      
      console.log(`[${i + 1}/${allUsers.length}] Sending to ${user.email}...`);
      
      try {
        await sendWelcomeEmail(user.email, userName, referralId);
        console.log(`   ✅ Email sent successfully to ${user.email}`);
        successCount++;
        
        // Small delay to avoid rate limiting
        if (i < allUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`   ❌ Failed to send email to ${user.email}:`, error.message);
        errorCount++;
        errors.push({
          email: user.email,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📧 Email Campaign Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully sent: ${successCount} emails`);
    console.log(`❌ Failed: ${errorCount} emails`);
    console.log(`📊 Total users: ${allUsers.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.email}: ${err.error}`);
      });
    }
    
    console.log('\n✅ Campaign completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
sendWelcomeEmailsToAllUsers();

