import { NextRequest } from "next/server";
import { getSession } from "@repo/auth/lib/server";
import { db } from "@repo/database";
import { config } from "@repo/config";
import { getSignedUrl } from "@repo/storage";

type RouteContext = {
  params: Promise<{ 
    bucket: string;
    path: string[];
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      console.error('File access attempt without session');
      return new Response("Unauthorized", { status: 401 });
    }

    const { bucket, path } = await context.params;
    const filePath = path.join("/");
    
    console.log(`File access attempt: bucket=${bucket}, path=${filePath}, user=${session.user.email}, role=${session.user.role}`);

    // Validate bucket
    const allowedBuckets = Object.values(config.storage.bucketNames);
    if (!allowedBuckets.includes(bucket)) {
      console.error(`Invalid bucket access attempt: ${bucket}`);
      return new Response("Invalid bucket", { status: 403 });
    }

    // ADMIN ONLY ACCESS - Only administrators can access verification documents
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      console.error(`Forbidden access attempt by non-admin user: ${session.user.email}, role: ${session.user.role}`);
      return new Response("Forbidden - Admin access required for document verification", { status: 403 });
    }

    // Get signed URL for the file
    console.log(`Getting signed URL for: ${filePath}`);
    const signedUrl = await getSignedUrl(filePath, { 
      bucket, 
      expiresIn: 300 // 5 minutes
    });

    if (!signedUrl) {
      console.error(`Failed to get signed URL for: ${filePath}`);
      return new Response("File not found", { status: 404 });
    }

    console.log(`Signed URL obtained, fetching file from storage`);
    // Fetch the file from storage
    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) {
      console.error(`Failed to fetch file from storage: ${fileResponse.status} ${fileResponse.statusText}`);
      return new Response("File not found", { status: 404 });
    }

    // Get file extension to determine content type
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentType = getContentType(ext);
    
    console.log(`Serving file: ${filePath}, content-type: ${contentType}`);

    // According to Next.js docs: Return Response with proper headers for iframe embedding
    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        'Content-Disposition': 'inline', // Display in browser, not download
        'X-Frame-Options': 'SAMEORIGIN', // Allow iframe embedding from same origin
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Error serving file:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function getContentType(ext: string | undefined): string {
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
