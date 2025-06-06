import type { OnboardingFormValues } from "../onboarding-schema";

export async function registerOnboarding(
	data: OnboardingFormValues,
): Promise<{ ok: boolean; error?: string; status?: number }> {
	try {
		const res = await fetch("/api/onboarding/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
			credentials: "include",
		});
		const result = await res.json();
		return { ok: res.ok, error: result.error, status: res.status };
	} catch (e: any) {
		return { ok: false, error: e.message || "Network error" };
	}
}
