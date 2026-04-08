import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, Briefcase, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../store/useStore';

export default function Dashboard() {
  const token = useStore((state) => state.token);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await axios.get('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  const { user } = useStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-800">Chào buổi sáng, {user?.name || 'Admin'}</h1>
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600 text-sm tracking-wide">Total Leads</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-bold">{isLoading ? '...' : stats?.totalLeads}</div>
        </div>
        
        {/* Total Deals */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600 text-sm tracking-wide">Active Deals</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Briefcase className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-bold">{isLoading ? '...' : stats?.totalDeals}</div>
        </div>

        {/* Total Expected Revenue */}
        <div className="bg-white p-6 rounded-xl border shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600 text-sm tracking-wide">Expected Revenue Pipeline</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <div className="text-3xl font-bold text-green-700">{isLoading ? '...' : formatter.format(stats?.totalRevenue || 0)}</div>
        </div>
      </div>

      {/* Activity and Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border shadow-sm p-6 flex flex-col min-h-[300px]">
           <h3 className="font-semibold text-gray-800 mb-4">Doanh thu kỳ vọng theo Pipeline</h3>
           <div className="flex-1 w-full min-h-[250px]">
               {isLoading ? <div className="text-gray-400">Loading chart...</div> : (
                   <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={stats?.chartData || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} />
                           <YAxis tickFormatter={(val) => `${val/1000000}M`} axisLine={false} tickLine={false} />
                           <Tooltip formatter={(value) => formatter.format(value)} />
                           <Line type="monotone" dataKey="total" stroke="#714B67" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                       </LineChart>
                   </ResponsiveContainer>
               )}
           </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center"><Activity className="w-4 h-4 mr-2" /> Recent Deals</h3>
          <div className="space-y-4">
             {isLoading ? (
                 <p className="text-sm text-gray-500">Loading...</p>
             ) : stats?.recentDeals?.map(deal => (
                 <div key={deal.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                    <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{deal.title}</p>
                        <p className="text-xs text-gray-500">{deal.stage}</p>
                    </div>
                    <p className="text-xs font-semibold text-green-700">{formatter.format(deal.value)}</p>
                 </div>
             ))}
             {!isLoading && stats?.recentDeals?.length === 0 && <p className="text-sm text-gray-500">No recent deals.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
