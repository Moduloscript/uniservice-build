import { ProviderNavigation } from "./components/ProviderNavigation";
import { ProviderGuard } from "./components/ProviderGuard";
import { requireProviderRole } from "./middleware";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  try {
    await requireProviderRole();
  } catch (error) {
    // Let the ProviderGuard handle the redirect on client side
    console.log("Provider auth check failed:", error);
  }

  return (
    <ProviderGuard>
      <div className="min-h-screen bg-background">
        {/* Provider Navigation */}
        <ProviderNavigation />
        
        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </ProviderGuard>
  );
}
