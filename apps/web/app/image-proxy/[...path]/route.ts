import { config } from "@repo/config";
import { getSignedUrl } from "@repo/storage";
import { NextResponse } from "next/server";

export const GET = async (
	_req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) => {
	const { path } = await params;

	const [bucket, ...filePathParts] = path;
	const filePath = filePathParts.join("/");

	if (!(bucket && filePath)) {
		return new Response("Invalid path", { status: 400 });
	}

	if (
		bucket === config.storage.bucketNames.avatars ||
		bucket === config.storage.bucketNames.verificationDocs ||
		bucket === config.storage.bucketNames.studentIdCards
	) {
		const signedUrl = await getSignedUrl(filePath, {
			bucket,
			expiresIn: 60 * 60,
		});

		return NextResponse.redirect(signedUrl, {
			headers: { "Cache-Control": "max-age=3600" },
		});
	}

	return new Response("Not found", {
		status: 404,
	});
};
