import { UserDashboardScreen } from "../components/UserDashboardScreen";
import { KYCSection } from "../components/KYCSection";

export default function UserKYCPage() {
  return (
    <UserDashboardScreen>
       <div className="space-y-8">
          <h2 className="text-3xl font-black">Account Verification</h2>
          <KYCSection />
       </div>
    </UserDashboardScreen>
  );
}
