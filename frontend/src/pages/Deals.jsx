import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Briefcase, Star, Plus, X, MessageSquare, Send, Search, Trash2 } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Item Component ---
function SortableDealCard({ deal, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });

  SortableDealCard.propTypes = {
    deal: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      priority: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
      lead_name: PropTypes.string.isRequired,
    }).isRequired,
    onClick: PropTypes.func.isRequired,
  };
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick(deal)}
      className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition touch-none">
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold text-sm text-gray-900 leading-tight">{deal.title}</div>
        <div className="flex text-yellow-500">
          {[...Array(3)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < deal.priority ? 'fill-current' : 'text-gray-200'}`} />
          ))}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-800 mb-2">
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deal.value)}
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded">
          <Briefcase className="w-3 h-3 mr-1" /> <span className="truncate max-w-[80px]">{deal.lead_name}</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Kanban Board ---
export default function Deals() {
  const token = useStore((state) => state.token);
  const queryClient = useQueryClient();
  const stages = ['Proposal', 'Negotiation', 'Won', 'Lost'];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', value: 0, priority: 0, leadId: '', stage: 'Proposal' });
  const [chatterText, setChatterText] = useState('');

  const { data: dealsData, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await axios.get('/api/deals', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  const { data: leadsData } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await axios.get('/api/leads', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  const [localDeals, setLocalDeals] = useState([]);
  useEffect(() => { if (dealsData) setLocalDeals(dealsData); }, [dealsData]);

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }) => {
      await axios.patch(`/api/deals/${id}/stage`, { stage }, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSettled: () => queryClient.invalidateQueries(['deals']),
  });

  const createDealMutation = useMutation({
    mutationFn: async (newDeal) => {
      await axios.post('/api/deals', newDeal, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      toast.success('Khởi tạo cơ hội thành công!');
      closeCreateModal();
    }
  });

  const updateDealMutation = useMutation({
    mutationFn: async (updatedDeal) => {
      await axios.put(`/api/deals/${updatedDeal.id}`, updatedDeal, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      toast.success('Lưu các thay đổi thành công!');
      setIsEditMode(false);
      // Update selected deal to show new values
      setSelectedDeal(prev => ({ ...prev, ...formData }));
    }
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id) => {
      if (window.confirm("Bạn có chắc muốn xoá thương vụ này?")) {
        await axios.delete(`/api/deals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deals']);
      toast.success('Đã xoá thương vụ này.');
      setSelectedDeal(null);
    }
  });

  // DnD logic
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeDeal = localDeals.find(d => d.id === activeId);
    if (!activeDeal) return;
    const isOverColumn = stages.includes(String(overId));
    let newStage = activeDeal.stage;
    if (isOverColumn) { newStage = String(overId); }
    else {
      const overDeal = localDeals.find(d => d.id === overId);
      if (overDeal && overDeal.stage !== activeDeal.stage) { newStage = overDeal.stage; }
    }
    if (activeDeal.stage !== newStage) {
      setLocalDeals(prev => prev.map(d => d.id === activeId ? { ...d, stage: newStage } : d));
      updateStageMutation.mutate({ id: activeId, stage: newStage });
    }
  };

  const { data: notes } = useQuery({
    queryKey: ['notes', selectedDeal?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/notes/${selectedDeal.id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    },
    enabled: !!selectedDeal
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      await axios.post('/api/notes', { content, dealId: selectedDeal.id }, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', selectedDeal?.id]);
      toast.success('Đã ghi vào sổ tay Chatter!');
      setChatterText('');
    }
  });

  const filteredDeals = localDeals.filter(deal =>
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.lead_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({ title: '', value: 0, priority: 0, leadId: '', stage: 'Proposal' });
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

  const startEdit = () => {
    setFormData({
      title: selectedDeal.title,
      value: Number(selectedDeal.value),
      priority: selectedDeal.priority,
      probability: selectedDeal.probability || 10,
      expected_closing_date: selectedDeal.expected_closing_date ? new Date(selectedDeal.expected_closing_date).toISOString().split('T')[0] : '',
      color_index: selectedDeal.color_index || 0,
      stage: selectedDeal.stage
    });
    setIsEditMode(true);
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải luồng Pipeline...</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Cơ hội (Pipeline)</h1>
          <button onClick={openCreateModal} className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 font-medium text-sm transition shadow-sm">
            <Plus className="w-4 h-4 mr-1" /> Tạo Mới
          </button>
        </div>
        <div className="flex bg-white px-3 py-2 border rounded shadow-sm items-center w-full md:w-80 focus-within:ring-2 ring-primary/20 transition">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm deal hoặc khách..."
            className="w-full text-sm outline-none bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto flex space-x-4 pb-4 items-start">
          {stages.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const totalValue = stageDeals.reduce((acc, d) => acc + Number(d.value), 0);

            return (
              <div key={stage} className="flex-shrink-0 w-72 flex flex-col bg-gray-50 rounded-md border border-gray-200 shadow-sm max-h-full">
                <div className="p-3 bg-white border-b border-gray-200 cursor-default rounded-t-md group">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-semibold text-gray-700 text-sm group-hover:text-primary transition uppercase tracking-wider">{stage}</h2>
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{stageDeals.length}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalValue)}
                  </div>
                  <div className={`mt-2 h-1 w-full rounded ${stage === 'Won' ? 'bg-green-500' : 'bg-primary/40'}`} />
                </div>
                <div className="flex-1 p-2 overflow-y-auto overflow-x-hidden min-h-[150px]">
                  <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2 h-full" id={stage}>
                      {stageDeals.map(deal => <SortableDealCard key={deal.id} deal={deal} onClick={setSelectedDeal} />)}
                      {!stageDeals.length && <div id={stage} className="h-20 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300 text-xs italic">Kéo thả vào đây</div>}
                    </div>
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* Detail Slide View */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end transition-opacity backdrop-blur-sm">
          <div className="w-full md:w-[900px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="h-14 bg-gray-50 border-b flex items-center justify-between px-6">
              <div className="flex flex-1 items-center gap-1">
                {stages.map((s) => (
                  <div key={s} className="flex relative items-center">
                    <span className={`px-4 py-1 text-xs font-bold uppercase border ${s === selectedDeal.stage ? 'bg-primary text-white border-primary border-r-0 rounded-l shadow-sm' : 'bg-white text-gray-400 border-gray-200'} transition`}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => deleteDealMutation.mutate(selectedDeal.id)} className="text-gray-400 hover:text-red-500 p-2 transition rounded-full hover:bg-red-50">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button onClick={() => setSelectedDeal(null)} className="text-gray-400 hover:text-gray-900 font-bold p-2 transition rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Data Section */}
              <div className="flex-1 p-8 border-r overflow-y-auto bg-white">
                <div className="flex justify-between items-start mb-6 border-b pb-4">
                  {!isEditMode ? (
                    <h1 className="text-3xl font-bold text-gray-900">{selectedDeal.title}</h1>
                  ) : (
                    <input type="text" className="text-3xl font-bold text-gray-900 border rounded px-2 w-full outline-primary"
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  )}
                  <button onClick={isEditMode ? () => updateDealMutation.mutate({ ...formData, id: selectedDeal.id }) : startEdit}
                    className={`ml-4 px-4 py-2 rounded font-medium text-sm transition shadow-sm ${isEditMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {isEditMode ? 'Lưu Lại' : 'Chỉnh Sửa'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-y-8 text-sm max-w-lg">
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Khách hàng liên hệ</span>
                    <span className="text-gray-900 font-medium py-1">{selectedDeal.lead_name}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Doanh thu mong đợi</span>
                    {!isEditMode ? (
                      <span className="text-2xl font-bold text-green-700">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedDeal.value)}</span>
                    ) : (
                      <input type="number" className="text-xl font-bold text-green-700 border rounded px-2 outline-primary"
                        value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Xác suất thành công</span>
                      {!isEditMode ? (
                        <span className="text-gray-900 font-medium">{selectedDeal.probability || 10}%</span>
                      ) : (
                        <input type="number" className="border rounded px-2 py-1 outline-primary"
                          value={formData.probability} onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Độ nóng</span>
                      {!isEditMode ? (
                        <div className="flex text-yellow-500 py-1">
                          {[...Array(3)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < selectedDeal.priority ? 'fill-current' : 'text-gray-200'}`} />)}
                        </div>
                      ) : (
                        <input type="number" min="0" max="3" className="border rounded px-2 py-1 outline-primary w-20"
                          value={formData.priority} onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })} />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Ngày chốt dự kiến</span>
                    {!isEditMode ? (
                      <span className="text-gray-900 font-medium">{selectedDeal.expected_closing_date ? new Date(selectedDeal.expected_closing_date).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}</span>
                    ) : (
                      <input type="date" className="border rounded px-2 py-1 outline-primary"
                        value={formData.expected_closing_date} onChange={e => setFormData({ ...formData, expected_closing_date: e.target.value })} />
                    )}
                  </div>
                </div>
              </div>

              {/* Chatter Area */}
              <div className="w-full md:w-[350px] bg-gray-50 flex flex-col border-l">
                <div className="p-4 border-b font-bold text-[10px] uppercase text-gray-400 tracking-widest bg-white">Lịch sử tương tác (Chatter)</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {notes?.map(note => (
                    <div key={note.id} className="bg-white p-3 border rounded shadow-sm hover:shadow transition">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-xs text-primary">{note.author_name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                  {notes?.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-gray-400">
                      <MessageSquare className="w-10 h-10 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">Không có ghi chú</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border-t shadow-inner">
                  <form onSubmit={(e) => { e.preventDefault(); if (chatterText.trim()) addNoteMutation.mutate(chatterText); }} className="relative">
                    <input type="text" className="w-full border rounded-full h-10 pl-4 pr-12 text-sm outline-primary focus:ring-4 focus:ring-primary/10 transition"
                      placeholder="Nhập ghi chú quan trọng..." value={chatterText} onChange={e => setChatterText(e.target.value)} />
                    <button type="submit" disabled={!chatterText.trim() || addNoteMutation.isPending} className="absolute right-1 top-1 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:bg-gray-200 transition">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-700">Khởi Tạo Cơ Hội Mới</h3>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-900 p-1 rounded-full hover:bg-gray-200 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createDealMutation.mutate(formData); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tên Thương vụ *</label>
                <input required type="text" className="w-full border rounded p-2 text-sm outline-primary"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="VD: Hợp đồng triển khai App" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Khách hàng liên đới</label>
                <select className="w-full border rounded p-2 text-sm outline-primary cursor-pointer" required
                  value={formData.leadId} onChange={e => setFormData({ ...formData, leadId: e.target.value })}>
                  <option value="">-- Chọn khách hàng mục tiêu --</option>
                  {leadsData?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Giá trị (VND)</label>
                  <input type="number" className="w-full border rounded p-2 text-sm outline-primary"
                    value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ưu tiên (0-3)</label>
                  <input type="number" min="0" max="3" className="w-full border rounded p-2 text-sm outline-primary"
                    value={formData.priority} onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })} />
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeCreateModal} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition">Huỷ bỏ</button>
                <button type="submit" disabled={createDealMutation.isPending} className="px-6 py-2 bg-primary text-white rounded text-sm font-bold shadow-lg hover:bg-primary/90 transition disabled:opacity-50">Tạo Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
