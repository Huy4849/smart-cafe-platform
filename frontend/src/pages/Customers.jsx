import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useStore from '../store/useStore';

export default function Customers() {
  const token = useStore((state) => state.token);
  
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await axios.get('/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers CRM</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
            Add Customer
        </button>
      </div>
      
      <div className="rounded-md border bg-white">
        <table className="w-full text-sm text-left">
            <thead className="border-b bg-gray-50/50">
                <tr>
                    <th className="p-4 font-medium text-gray-500">Name</th>
                    <th className="p-4 font-medium text-gray-500">Phone</th>
                    <th className="p-4 font-medium text-gray-500">Points</th>
                    <th className="p-4 font-medium text-gray-500 text-right">Total Spent</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                ) : customers?.map((customer) => (
                    <tr key={customer.id} className="border-b transition-colors hover:bg-gray-50/50">
                        <td className="p-4 font-medium">{customer.name}</td>
                        <td className="p-4">{customer.phone}</td>
                        <td className="p-4">{customer.points}</td>
                        <td className="p-4 text-right">{customer.total_spent?.toLocaleString()} ₫</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
