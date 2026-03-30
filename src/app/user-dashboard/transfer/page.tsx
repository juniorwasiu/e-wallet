import { UserDashboardScreen } from "../components/UserDashboardScreen";
import { TransferModal } from "../components/TransferModal";

export default function UserTransferPage() {
  return (
    <UserDashboardScreen>
       <div className="space-y-8">
          <h2 className="text-3xl font-black">Send Money</h2>
          <TransferModal isOpen={true} onClose={() => {}} />
       </div>
    </UserDashboardScreen>
  );
}
