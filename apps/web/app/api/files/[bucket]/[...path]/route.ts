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
      return new Response("Unauthorized", { status: 401 });
    }

    const { bucket, path } = await context.params;
    const filePath = path.join("/");

    // Validate bucket
    const allowedBuckets = Object.values(config.storage.bucketNames);
    if (!allowedBuckets.includes(bucket)) {
      return new Response("Invalid bucket", { status: 403 });
    }

    // ADMIN ONLY ACCESS - Only administrators can access files
    if (session.user.role !== "admin") {
      return new Response("Forbidden - Admin access required", { status: 403 });
    }

    // Get signed URL for the file
    const signedUrl = await getSignedUrl(filePath, { 
      bucket, 
      expiresIn: 300 // 5 minutes
    });

    if (!signedUrl) {
      return new Response("File not found", { status: 404 });
    }

    // Fetch the file from storage
    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) {
      return new Response("File not found", { status: 404 });
    }

    // Get file extension to determine content type
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentType = getContentType(ext);

    // According to Next.js docs: Return Response with proper headers
    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        'Content-Disposition': 'inline', // Display in browser, not download
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
