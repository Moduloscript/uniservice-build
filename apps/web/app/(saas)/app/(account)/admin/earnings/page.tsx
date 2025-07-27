import { Metadata } from "next";
import { AdminEarningsBackfill } from "../components/AdminEarningsBackfill";

export const metadata: Metadata = {
  title: "Earnings Management - Admin",
  description: "Manage platform earnings and backfill processes",
};

export default function AdminEarningsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Earnings Management</h1>
        <p className="text-muted-foreground">
          Manage platform earnings, process backfills, and monitor financial operations.
        </p>
      </div>

      {/* Earnings Backfill Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Earnings Backfill</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Process missing earnings records for completed bookings.
          </p>
        </div>
        
        <AdminEarningsBackfill />
      </div>

      {/* Future sections can be added here */}
      {/* 
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Platform Statistics</h2>
        <AdminEarningsStats />
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Payout Management</h2>
        <AdminPayoutManagement />
      </div>
      */}
    </div>
  );
}
