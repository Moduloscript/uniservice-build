export { PrismaClient } from "@prisma/client";
export * from "./src/client";
export * from "./src/zod";

declare global {
	namespace PrismaJson {
		type AIChatMessages = Array<{
			role: "user" | "assistant";
			content: string;
		}>;
	}
}
