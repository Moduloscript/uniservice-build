// Comprehensive Upload Debugging Utility (JavaScript version)
// This script helps debug 403 Forbidden errors in the student ID card upload flow

const config = {
  storage: {
    bucketNames: {
      avatars: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME || "avatars",
      verificationDocs: process.env.NEXT_PUBLIC_VERIFICATION_DOCS_BUCKET_NAME || "verification-docs",
      studentIdCards: process.env.NEXT_PUBLIC_STUDENT_ID_CARDS_BUCKET_NAME || "student-id-cards"
    }
  }
};

class UploadDebugger {
  static async debugUploadFlow({ userId, fileName, bucket }) {
    console.log("🔍 Starting Upload Debug Analysis");
    console.log("====================================");
    
    // 1. Verify bucket configuration
    console.log("\n1. 📋 Bucket Configuration Check");
    console.log(`   Requested bucket: ${bucket}`);
    console.log(`   Allowed buckets:`, Object.values(config.storage.bucketNames));
    
    const allowedBuckets = Object.values(config.storage.bucketNames);
    if (!allowedBuckets.includes(bucket)) {
      console.error(`   ❌ ISSUE FOUND: Invalid bucket '${bucket}' not in allowed list`);
      return;
    }
    console.log(`   ✅ Bucket '${bucket}' is valid`);
    
    // 2. Verify file path format
    console.log("\n2. 📁 File Path Format Check");
    const expectedPathFormat = `${userId}-${fileName}`;
    console.log(`   User ID: ${userId}`);
    console.log(`   File name: ${fileName}`);
    console.log(`   Expected path: ${expectedPathFormat}`);
    
    if (bucket === config.storage.bucketNames.studentIdCards) {
      if (!expectedPathFormat.startsWith(`${userId}-`)) {
        console.error(`   ❌ ISSUE FOUND: Path doesn't start with user ID for student-id-cards bucket`);
        return;
      }
      console.log(`   ✅ Path format is correct for student-id-cards bucket`);
    }
    
    // 3. Verify file extension
    console.log("\n3. 📄 File Extension Check");
    const ext = fileName.split('.').pop()?.toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];
    console.log(`   File extension: ${ext}`);
    console.log(`   Allowed extensions:`, allowedExts);
    
    if (!ext || !allowedExts.includes(ext)) {
      console.error(`   ❌ ISSUE FOUND: Invalid file extension '${ext}'`);
      return;
    }
    console.log(`   ✅ File extension '${ext}' is valid`);
    
    // 4. Check RLS Policy Requirements
    console.log("\n4. 🔐 RLS Policy Requirements Check");
    console.log(`   For bucket '${bucket}', RLS policies expect:`);
    console.log(`   - File path to start with user ID: ${userId}-`);
    console.log(`   - User to be authenticated`);
    console.log(`   - OR service role with proper naming convention`);
    
    // 5. Authentication Check Points
    console.log("\n5. 🔑 Authentication Check Points");
    console.log(`   Key things to verify:`);
    console.log(`   - User session is valid and contains user ID`);
    console.log(`   - Session cookie is being sent with requests`);
    console.log(`   - Auth middleware is extracting user correctly`);
    console.log(`   - User ID in session matches the one in file path`);
    
    // 6. Environment Variables Check
    console.log("\n6. 🌐 Environment Variables to Verify");
    console.log(`   Supabase variables:`);
    console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const isServiceKeySet = serviceKey && !serviceKey.includes('[YOU_NEED_TO_ADD_THIS');
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${isServiceKeySet ? '✅ Set' : '❌ Missing/Invalid'}`);
    
    console.log(`   S3 Storage variables:`);
    console.log(`   - S3_ENDPOINT: ${process.env.S3_ENDPOINT ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - S3_ACCESS_KEY_ID: ${process.env.S3_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - S3_SECRET_ACCESS_KEY: ${process.env.S3_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   - S3_REGION: ${process.env.S3_REGION ? '✅ Set' : '❌ Missing'}`);
    
    console.log(`   Database:`);
    console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
    
    if (!isServiceKeySet) {
      console.error(`   \n❌ CRITICAL ISSUE: SUPABASE_SERVICE_ROLE_KEY is missing or contains placeholder text!`);
      console.error(`      This is required for generating signed upload URLs.`);
      console.error(`      Please get the service role key from your Supabase project dashboard.`);
    }
    
    // 7. Storage Provider Check
    console.log("\n7. 💾 Storage Provider Configuration");
    console.log(`   Current setup uses S3-compatible API with Supabase`);
    console.log(`   Key considerations:`);
    console.log(`   - Signed URLs are generated with service role`);
    console.log(`   - Actual upload bypasses normal user auth`);
    console.log(`   - RLS policies must account for service role uploads`);
    
    // 8. Common 403 Causes
    console.log("\n8. ⚠️  Common Causes of 403 Forbidden Errors");
    console.log(`   1. User not authenticated (session expired/invalid)`);
    console.log(`   2. File path doesn't match RLS policy expectations`);
    console.log(`   3. Bucket name mismatch between frontend and backend`);
    console.log(`   4. Invalid file extension`);
    console.log(`   5. RLS policies too restrictive for service role`);
    console.log(`   6. Missing or incorrect environment variables`);
    console.log(`   7. CORS issues with Supabase storage`);
    
    // 9. Debugging Steps
    console.log("\n9. 🛠️  Recommended Debugging Steps");
    console.log(`   1. Check browser network tab for exact error response`);
    console.log(`   2. Verify user session in browser dev tools`);
    console.log(`   3. Check Supabase dashboard logs for storage errors`);
    console.log(`   4. Test with different user IDs`);
    console.log(`   5. Verify RLS policies in Supabase dashboard`);
    console.log(`   6. Test signed URL generation separately`);
    console.log(`   7. Check if issue is with URL generation or actual upload`);
    
    console.log("\n✅ Debug analysis complete!");
  }
  
  static simulateRequest(userId, fileName, bucket = "student-id-cards") {
    console.log("\n🎯 Simulating Upload Request");
    console.log("=============================");
    
    const path = `${userId}-${fileName}`;
    const signedUrlEndpoint = `/api/uploads/signed-upload-url?bucket=${bucket}&path=${encodeURIComponent(path)}`;
    
    console.log(`POST ${signedUrlEndpoint}`);
    console.log(`Headers: {`);
    console.log(`  "Content-Type": "application/json",`);
    console.log(`  "Cookie": "[session cookie]",`);
    console.log(`  "credentials": "include"`);
    console.log(`}`);
    
    console.log(`\nExpected backend processing:`);
    console.log(`1. Auth middleware extracts user from session`);
    console.log(`2. Validates bucket '${bucket}' is allowed`);
    console.log(`3. Checks if path '${path}' starts with user ID '${userId}'`);
    console.log(`4. Validates file extension`);
    console.log(`5. Generates signed URL with service role credentials`);
    console.log(`6. Returns signed URL to frontend`);
    
    console.log(`\nCommon failure points:`);
    console.log(`- Step 1: Session invalid/expired (401 error)`);
    console.log(`- Step 3: Path validation fails (403 error)`);
    console.log(`- Step 4: Invalid file type (400 error)`);
    console.log(`- Step 5: Storage service error (500 error)`);
  }
  
  static generateTestCommands(userId = "test-user-123") {
    console.log("\n🧪 Test Commands to Run");
    console.log("=======================");
    
    console.log(`\n# Test 1: Check if user is authenticated`);
    console.log(`curl -X POST http://localhost:3000/api/uploads/signed-upload-url \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  --cookie-jar cookies.txt \\`);
    console.log(`  -d '{"bucket":"student-id-cards","path":"${userId}-test.jpg"}'`);
    
    console.log(`\n# Test 2: Check with different bucket`);
    console.log(`curl -X POST http://localhost:3000/api/uploads/signed-upload-url \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  --cookie cookies.txt \\`);
    console.log(`  -d '{"bucket":"verification-docs","path":"${userId}-test.jpg"}'`);
    
    console.log(`\n# Test 3: Check with invalid path`);
    console.log(`curl -X POST http://localhost:3000/api/uploads/signed-upload-url \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  --cookie cookies.txt \\`);
    console.log(`  -d '{"bucket":"student-id-cards","path":"wrong-user-test.jpg"}'`);
    
    console.log(`\n# Note: You'll need valid session cookies for these tests to work`);
    console.log(`# Login through the browser first and export cookies`);
  }

  static async checkCurrentEnvironment() {
    console.log("\n🌍 Current Environment Check");
    console.log("============================");
    
    // Check if we're in a Next.js project
    const fs = require('fs');
    const path = require('path');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      console.log(`   Project: ${packageJson.name || 'Unknown'}`);
      console.log(`   Next.js version: ${packageJson.dependencies?.next || 'Not found'}`);
      
      // Check for key files
      const keyFiles = [
        'apps/web/modules/shared/hooks/use-file-upload.ts',
        'packages/api/src/routes/uploads.ts', 
        'packages/api/src/middleware/auth.ts',
        'config/index.ts'
      ];
      
      console.log(`\n   Key files check:`);
      keyFiles.forEach(file => {
        const exists = fs.existsSync(file);
        console.log(`   - ${file}: ${exists ? '✅' : '❌'}`);
      });
      
    } catch (error) {
      console.log(`   ❌ Could not read package.json: ${error.message}`);
    }
  }
}

// Run the debugging analysis
async function main() {
  const testUserId = "cm4a1234567890abcdef"; // Example Cuid
  const testFileName = "student-id.jpg";
  
  await UploadDebugger.checkCurrentEnvironment();
  
  await UploadDebugger.debugUploadFlow({
    userId: testUserId,
    fileName: testFileName,
    bucket: "student-id-cards"
  });
  
  UploadDebugger.simulateRequest(testUserId, testFileName);
  UploadDebugger.generateTestCommands(testUserId);
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { UploadDebugger };
