#!/usr/bin/env node

/**
 * Send Welcome Emails to All Users - Direct Script
 */

import { storage } from './server/storage.js';
import { sendWelcomeEmail } from './server/services/email.js';

async function sendWelcomeEmails() {
  console.log('🚀 Starting Welcome Email Campaign...\n');
  
  try {
    // Get all users
    const allUsers = await storage.getAllUsers();
    
    console.log(`📊 Found ${allUsers.length} users in the database\n`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found to send emails to.');
      process.exit(0);
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log('📧 Sending welcome emails...\n');
    
    // Send emails to all users
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const userName = user.fullName || user.username || 'Trader';
      const referralId = user.referralId || 'N/A';
      
      process.stdout.write(`[${i + 1}/${allUsers.length}] Sending to ${user.email}... `);
      
      try {
        await sendWelcomeEmail(user.email, userName, referralId);
        console.log('✅');
        successCount++;
        
        // Small delay to avoid rate limiting
        if (i < allUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.log(`❌ ${error.message}`);
        errorCount++;
        errors.push({
          email: user.email,
          error: error.message || "Unknown error"
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📧 Email Campaign Summary:');
    console.log('='.repeat(60));
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
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
sendWelcomeEmails();

