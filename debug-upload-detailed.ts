// Comprehensive Upload Debugging Utility
// This script helps debug 403 Forbidden errors in the student ID card upload flow

import { config } from "@repo/config";

interface DebugUploadOptions {
  userId: string;
  fileName: string;
  bucket: string;
}

export class UploadDebugger {
  static async debugUploadFlow({ userId, fileName, bucket }: DebugUploadOptions) {
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
    console.log(`   Required variables:`);
    console.log(`   - SUPABASE_URL (for storage API)`);
    console.log(`   - SUPABASE_SERVICE_ROLE_KEY (for signed URLs)`);
    console.log(`   - SUPABASE_ANON_KEY (for client operations)`);
    console.log(`   - Database connection strings`);
    
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
  
  static simulateRequest(userId: string, fileName: string, bucket: string = "student-id-cards") {
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
  
  static generateTestCommands(userId: string = "test-user-123") {
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
}

// Example usage
if (require.main === module) {
  const testUserId = "cm4a1234567890abcdef"; // Example Cuid
  const testFileName = "student-id.jpg";
  
  UploadDebugger.debugUploadFlow({
    userId: testUserId,
    fileName: testFileName,
    bucket: "student-id-cards"
  });
  
  UploadDebugger.simulateRequest(testUserId, testFileName);
  UploadDebugger.generateTestCommands(testUserId);
}

export default UploadDebugger;
