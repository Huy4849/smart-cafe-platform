import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, X, Edit2, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function Leads() {
  const token = useStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: 'Website', status: 'New' });

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get('/api/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newLead) => {
      await axios.post('/api/leads', newLead, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Đã tạo khách hàng mới thành công!');
      closeModal();
    },
    onError: () => toast.error('Có lỗi xảy ra khi tạo khách hàng!')
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedLead) => {
      await axios.put(`/api/leads/${updatedLead.id}`, updatedLead, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Đã cập nhật thông tin thành công!');
      closeModal();
    },
    onError: () => toast.error('Cập nhật thất bại!')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (window.confirm("Bạn có chắc muốn xoá khách hàng này?")) {
        await axios.delete(`/api/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        toast.success('Đã xoá khách hàng thành công!');
    }
  });

  const openModal = (lead = null) => {
    if (lead) {
      setSelectedLead(lead);
      setFormData({ name: lead.name, email: lead.email, phone: lead.phone, source: lead.source, status: lead.status });
    } else {
      setSelectedLead(null);
      setFormData({ name: '', email: '', phone: '', source: 'Website', status: 'New' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
    setFormData({ name: '', email: '', phone: '', source: 'Website', status: 'New' });
  };

  const filteredLeads = leads?.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
        case 'New': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">New</span>;
        case 'Contacted': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Contacted</span>;
        case 'Qualified': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Qualified</span>;
        case 'Lost': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Lost</span>;
        default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Khách tiềm năng (Leads)</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center w-max bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-primary/90 transition font-medium"
        >
            <Plus className="w-4 h-4 mr-2" /> Thêm Mới
        </button>
      </div>

      <div className="flex bg-white p-2 border rounded shadow-sm items-center focus-within:ring-2 ring-primary/20 transition">
        <Search className="w-5 h-5 text-gray-400 mr-2 ml-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm tên khách, SĐT hoặc email..." 
          className="w-full text-sm outline-none bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded border bg-white shadow-sm overflow-hidden min-h-[400px]">
        <table className="w-full text-sm text-left">
            <thead className="border-b bg-gray-50 uppercase text-xs font-semibold text-gray-500">
                <tr>
                    <th className="px-6 py-4">Tên Khách</th>
                    <th className="px-6 py-4">Liên hệ</th>
                    <th className="px-6 py-4">Nguồn</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : filteredLeads?.map((lead) => (
                    <tr key={lead.id} className="transition-colors hover:bg-gray-50/50 group">
                        <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                        <td className="px-6 py-4">
                           <div className="text-gray-900">{lead.phone}</div>
                           <div className="text-gray-400 text-xs">{lead.email}</div>
                        </td>
                        <td className="px-6 py-4">{lead.source}</td>
                        <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => openModal(lead)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteMutation.mutate(lead.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xoá">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {!isLoading && filteredLeads?.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Không tìm thấy khách hàng nào phù hợp.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-in fade-in p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-lg">{selectedLead ? 'Cập Nhật Lead' : 'Tạo Lead Mới'}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"><X className="w-5 h-5"/></button>
                </div>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (selectedLead) {
                        updateMutation.mutate({ ...formData, id: selectedLead.id });
                    } else {
                        createMutation.mutate(formData); 
                    }
                  }} 
                  className="p-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                        <input required type="text" className="w-full border rounded p-2 text-sm outline-primary" 
                               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input type="tel" className="w-full border rounded p-2 text-sm outline-primary" 
                                   value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full border rounded p-2 text-sm outline-primary" 
                                   value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn</label>
                            <select className="w-full border rounded p-2 text-sm outline-primary" 
                                    value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                                <option>Website</option>
                                <option>Referral</option>
                                <option>Ads</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <select className="w-full border rounded p-2 text-sm outline-primary" 
                                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option>New</option>
                                <option>Contacted</option>
                                <option>Qualified</option>
                                <option>Lost</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-6 border-t flex justify-end gap-3 mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition">Huỷ bỏ</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition shadow-sm">
                            {selectedLead ? 'Lưu Thay Đổi' : 'Tạo Mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
