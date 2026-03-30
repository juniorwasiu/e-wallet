import { UserDashboardScreen } from "../components/UserDashboardScreen";
import { WalletOverview } from "../components/WalletOverview";

export default function UserWalletPage() {
  return (
    <UserDashboardScreen>
       <div className="space-y-8">
          <h2 className="text-3xl font-black">My Wallet</h2>
          <WalletOverview />
       </div>
    </UserDashboardScreen>
  );
}
