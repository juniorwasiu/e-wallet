import { AdminPanelScreen } from "./components/AdminPanelScreen";
import { AdminOverview } from "./components/AdminOverview";

export default function AdminDashboardPage() {
  return (
    <AdminPanelScreen>
      <div className="space-y-8">
        <div>
           <h2 className="text-3xl font-black text-slate-900">Overview</h2>
           <p className="text-slate-500 font-bold text-sm tracking-tight">Real-time system health and performance metrics.</p>
        </div>
        
        <AdminOverview />
        
        <div className="grid lg:grid-cols-2 gap-8">
           <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                 {[1, 2, 3, 4, 5].map((i) => (
                   <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">U</div>
                      <div className="flex-1">
                         <p className="text-sm font-bold">New user registered: <span className="text-primary underline cursor-pointer">user{i}@example.com</span></p>
                         <p className="text-xs text-slate-400 font-medium">2 minutes ago</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm text-center flex flex-col justify-center items-center">
              <div className="w-20 h-20 rounded-[2rem] bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                 <ShieldAlert size={40} />
              </div>
              <h3 className="text-xl font-black mb-2">Pending Actions</h3>
              <p className="text-slate-500 text-sm font-bold mb-8 max-w-xs">There are 12 KYC requests and 5 deposit requests waiting for your approval.</p>
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-primary/20 transition-all">
                 Go to Queue
              </button>
           </div>
        </div>
      </div>
    </AdminPanelScreen>
  );
}
