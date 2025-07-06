import { BookingList } from "../../modules/bookings/components/booking-list";
import { auth } from "@repo/auth";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
	const session = await auth();
	
	if (!session?.user) {
		redirect("/auth/login");
	}

	// Get user type from session
	const userType = session.user.userType as "STUDENT" | "PROVIDER" | "ADMIN";

	if (!userType) {
		redirect("/app/onboarding");
	}

	return (
		<main className="max-w-6xl mx-auto py-8 px-4">
			<BookingList userType={userType} />
		</main>
	);
}
