#!/usr/bin/env node

/**
 * Send Welcome Emails to All Logged-In Users
 * Sends the new futuristic welcome email with logo to all users
 */

import { getDb } from './server/db.js';
import { users } from '@shared/schema';
import { sendWelcomeEmail } from './server/services/email.js';

async function sendWelcomeEmailsToAllUsers() {
  console.log('🚀 Starting Welcome Email Campaign...\n');
  
  try {
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
    process.exit(1);
  }
}

// Run the script
sendWelcomeEmailsToAllUsers();

