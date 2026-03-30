import { UserDashboardScreen } from "./components/UserDashboardScreen";
import { WalletOverview } from "./components/WalletOverview";
import { TransactionHistory } from "./components/TransactionHistory";

export default function UserDashboardPage() {
  return (
    <UserDashboardScreen>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome Back! 👋</h2>
           <p className="text-muted-foreground">Here is what happening with your money today.</p>
        </div>
        
        <WalletOverview />
        
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          <TransactionHistory />
          <div className="space-y-8">
             {/* Quick Actions or Stats could go here */}
             <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-xl shadow-primary/20">
                <h3 className="text-xl font-bold mb-4">Send Money Instantly</h3>
                <p className="opacity-80 text-sm mb-8 font-medium">Transfer funds to any E-Wallet user by their email or wallet ID without any fees.</p>
                <button className="w-full bg-white text-primary py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all">
                   Transfer Now
                </button>
             </div>
          </div>
        </div>
      </div>
    </UserDashboardScreen>
  );
}
