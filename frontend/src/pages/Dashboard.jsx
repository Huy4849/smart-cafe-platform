import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import useStore from '../store/useStore';

export default function Dashboard() {
  const token = useStore((state) => state.token);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // In real scenario, configure axios global instance with auth header
      const res = await axios.get('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-4 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      
      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats?.totalRevenue?.toLocaleString()} ₫</div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-white shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Top Customers</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">+{stats?.totalCustomers}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Orders</h3>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">+{stats?.totalOrders}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <div className="col-span-4 rounded-xl border bg-white shadow">
            <div className="p-6">
               <h3 className="font-semibold leading-none tracking-tight">Top Customers</h3>
               <p className="text-sm text-muted-foreground">Most loyal customers by spending.</p>
            </div>
            <div className="p-6 pt-0">
               <div className="space-y-8">
                  {stats?.topCustomers?.map(customer => (
                    <div key={customer.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                        <div className="ml-auto font-medium">+{customer.total_spent?.toLocaleString()} ₫</div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
