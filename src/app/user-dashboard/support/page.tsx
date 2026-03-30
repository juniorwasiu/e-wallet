import { UserDashboardScreen } from "../components/UserDashboardScreen";
import { SupportSection } from "../components/SupportSection";

export default function UserSupportPage() {
  return (
    <UserDashboardScreen>
       <div className="space-y-8">
          <h2 className="text-3xl font-black">Help & Support</h2>
          <SupportSection />
       </div>
    </UserDashboardScreen>
  );
}
