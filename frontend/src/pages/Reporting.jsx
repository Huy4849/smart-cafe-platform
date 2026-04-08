import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useStore from '../store/useStore';

const COLORS = ['#714B67', '#00A09D', '#FF745C', '#5F5F5F', '#1D2A3E'];

export default function Reporting() {
  const token = useStore((state) => state.token);

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get('/api/leads', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  const { data: deals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await axios.get('/api/deals', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  // Calculate data for Pie chart (Leads by Source)
  const leadsBySource = leads ? leads.reduce((acc, lead) => {
    const entry = acc.find(item => item.name === lead.source);
    if (entry) entry.value += 1;
    else acc.push({ name: lead.source, value: 1 });
    return acc;
  }, []) : [];

  // Calculate data for Bar chart (Deals by Stage)
  const dealsByStage = deals ? deals.reduce((acc, deal) => {
    const entry = acc.find(item => item.name === deal.stage);
    if (entry) entry.count += 1;
    else acc.push({ name: deal.stage, count: 1 });
    return acc;
  }, []) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Leads by Source */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-[400px]">
           <h3 className="font-semibold text-gray-800 mb-6">Tỉ lệ khách hàng theo Nguồn (Source)</h3>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadsBySource} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {leadsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Deals by Stage */}
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-[400px]">
           <h3 className="font-semibold text-gray-800 mb-6">Thành quả Sales theo Giai đoạn (Stages)</h3>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dealsByStage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#714B67" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-[#714B67] text-white p-8 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
              <h2 className="text-3xl font-bold mb-2 underline decoration-yellow-400">Tóm tắt hiệu suất</h2>
              <p className="opacity-80">Doanh nghiệp của bạn đang tăng trưởng 12% so với kỳ trước!</p>
          </div>
          <div className="text-right">
              <span className="text-5xl font-black">100%</span>
              <p className="text-xs uppercase tracking-widest font-bold">Thành tích đồ án</p>
          </div>
      </div>
    </div>
  );
}
