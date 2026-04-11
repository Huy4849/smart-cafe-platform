import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Plus,
    Search,
    TrendingUp,
    X,
    TrendingDown,
    CheckCircle2,
    XCircle,
    Target,
    ArrowRight,
    Filter,
    Users,
    AlertCircle,
    Clock
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const STAGES = ['Tiềm năng', 'Báo giá', 'Thương thảo', 'Thành công', 'Thất bại'];

const STAGE_COLORS = {
    'Tiềm năng': 'border-indigo-200 bg-indigo-50/30 text-indigo-700',
    'Báo giá': 'border-blue-200 bg-blue-50/30 text-blue-700',
    'Thương thảo': 'border-amber-200 bg-amber-50/30 text-amber-700',
    'Thành công': 'border-emerald-200 bg-emerald-50/30 text-emerald-700',
    'Thất bại': 'border-rose-200 bg-rose-50/30 text-rose-700'
};

const PipelinePage = () => {
    const token = useStore((state) => state.token);
    const [deals, setDeals] = useState([]);
    const [, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [ownerFilter, setOwnerFilter] = useState(searchParams.get('owner') || 'all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [users, setUsers] = useState([]);
    const [draggingId, setDraggingId] = useState(null);

    const [dealForm, setDealForm] = useState({
        title: '',
        value: 0,
        stage: 'Tiềm năng',
        priority: 1,
        probability: 10,
        nextStep: '',
        expected_closing_date: '',
        customer_id: '',
        owner_id: ''
    });

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/deals?search=${search}&owner_id=${ownerFilter}`);
            const mappedDeals = (response.data.data.deals || []).map(d => {
                const stageMap = {
                    'Qualification': 'Tiềm năng',
                    'Proposal': 'Báo giá',
                    'Negotiation': 'Thương thảo',
                    'Won': 'Thành công',
                    'Lost': 'Thất bại'
                };
                return { ...d, stage: stageMap[d.stage] || d.stage };
            });
            setDeals(mappedDeals);
        } catch (err) {
            toast.error('Không thể đồng bộ dữ liệu Thương vụ');
        } finally {
            setLoading(false);
        }
    }, [search, ownerFilter]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data.data.customers || []);
        } catch (err) {
            console.error('Lấy danh sách khách hàng thất bại');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data.data.users || []);
        } catch (err) {
            console.error('Lấy danh sách nhân sự thất bại');
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchDeals();
        fetchCustomers();
        fetchUsers();
    }, [token, ownerFilter, search, fetchDeals, fetchCustomers, fetchUsers]);

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const matchesPriority = priorityFilter === 'all' || deal.priority === Number(priorityFilter);
            const stageParam = searchParams.get('stage');
            const matchesStage = !stageParam || deal.stage === stageParam;
            return matchesPriority && matchesStage;
        });
    }, [deals, priorityFilter, searchParams]);

    const handleSaveDeal = async (e) => {
        if (e) e.preventDefault();
        if (!dealForm.title.trim() || !dealForm.customer_id) return toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');

        try {
            const reverseStageMap = {
                'Tiềm năng': 'Qualification',
                'Báo giá': 'Proposal',
                'Thương thảo': 'Negotiation',
                'Thành công': 'Won',
                'Thất bại': 'Lost'
            };
            const payload = {
                ...dealForm,
                value: Number(dealForm.value),
                stage: reverseStageMap[dealForm.stage] || dealForm.stage
            };

            if (selectedDeal) {
                await api.put(`/deals/${selectedDeal.id}`, payload);
                toast.success('Đã cập nhật cơ hội kinh doanh');
            } else {
                await api.post('/deals', payload);
                toast.success('Đã khởi tạo cơ hội mới');
            }
            setShowModal(false);
            resetForm();
            fetchDeals();
        } catch (err) {
            toast.error('Giao dịch thất bại');
        }
    };

    const handleUpdateStage = async (id, stage) => {
        try {
            const reverseStageMap = {
                'Tiềm năng': 'Qualification',
                'Báo giá': 'Proposal',
                'Thương thảo': 'Negotiation',
                'Thành công': 'Won',
                'Thất bại': 'Lost'
            };
            const dbStage = reverseStageMap[stage] || stage;
            await api.patch(`/deals/${id}/stage`, { stage: dbStage });

            if (stage === 'Thành công') {
                toast.success('Giao dịch THÀNH CÔNG! Đã tự động khởi tạo dự án triển khai.');
            } else {
                toast.success(`Đã chuyển thương vụ sang: ${stage}`);
            }
            fetchDeals();
        } catch (err) {
            toast.error('Cập nhật giai đoạn thất bại');
        }
    };

    const handleDeleteDeal = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thương vụ này?')) return;
        try {
            await api.delete(`/deals/${id}`);
            toast.success('Đã xóa thương vụ');
            fetchDeals();
        } catch (err) {
            toast.error('Xóa thương vụ thất bại');
        }
    };

    const onDragStart = (e, dealId) => {
        setDraggingId(dealId);
        e.dataTransfer.setData('dealId', dealId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e, targetStage) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        if (dealId) {
            handleUpdateStage(Number(dealId), targetStage);
            setDraggingId(null);
        }
    };

    const resetForm = () => {
        setSelectedDeal(null);
        setDealForm({
            title: '', value: 0, stage: 'Tiềm năng', priority: 1,
            probability: 10, nextStep: '', expected_closing_date: '', customer_id: '', owner_id: ''
        });
    };

    const openEdit = (deal) => {
        setSelectedDeal(deal);
        setDealForm({
            title: deal.title,
            value: Number(deal.value),
            stage: deal.stage,
            priority: deal.priority,
            probability: deal.probability,
            nextStep: deal.next_step || '',
            expected_closing_date: deal.expected_closing_date ? new Date(deal.expected_closing_date).toISOString().split('T')[0] : '',
            customer_id: deal.customer_id,
            owner_id: deal.owner_id || ''
        });
        setShowModal(true);
    };

    const formatValue = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase italic underline decoration-indigo-200 decoration-4">{selectedDeal ? 'Chỉnh sửa thương vụ' : 'Thương vụ mới'}</h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Cấu hình các tham số cơ hội kinh doanh</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all text-gray-400 hover:text-red-500 bg-white border border-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleSaveDeal} className="p-10 space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề chiến lược</label>
                                        <input required type="text" className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all text-sm"
                                            placeholder="Ví dụ: Cung cấp máy pha cafe cho Starbuck"
                                            value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hồ sơ khách hàng</label>
                                        <select required className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all cursor-pointer text-sm"
                                            value={dealForm.customer_id} onChange={e => setDealForm({ ...dealForm, customer_id: e.target.value })}>
                                            <option value="">Chọn khách hàng mục tiêu...</option>
                                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} • {c.company}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Người phụ trách</label>
                                        <select className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all cursor-pointer text-sm"
                                            value={dealForm.owner_id} onChange={e => setDealForm({ ...dealForm, owner_id: e.target.value })}>
                                            <option value="">Dành cho quản trị viên...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Giá trị thương vụ (VND)</label>
                                        <input type="number" className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all text-sm"
                                            value={dealForm.value} onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Xác suất thành công (%)</label>
                                        <input type="number" min="0" max="100" className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all text-sm"
                                            value={dealForm.probability} onChange={e => setDealForm({ ...dealForm, probability: Number(e.target.value) })} />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ngày chốt dự kiến (Kỳ hạn Thương vụ)</label>
                                    <input type="date" className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all text-sm"
                                        value={dealForm.expected_closing_date} onChange={e => setDealForm({ ...dealForm, expected_closing_date: e.target.value })} />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Bước tiếp theo cần làm</label>
                                    <textarea className="p-3 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-gray-900 transition-all resize-none h-20 text-sm"
                                        placeholder="Ví dụ: Gọi điện báo giá cho khách hàng..."
                                        value={dealForm.nextStep} onChange={e => setDealForm({ ...dealForm, nextStep: e.target.value })} />
                                </div>

                            </form>
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-4 bg-white text-gray-500 border border-gray-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                                Hủy bỏ
                            </button>
                            <button onClick={handleSaveDeal} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                                {selectedDeal ? 'Lưu thay đổi' : 'Xác nhận Thêm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 italic uppercase">Cơ hội kinh doanh</h1>
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Quy trình Thương vụ & Tốc độ chốt đơn</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex flex-col items-end mr-6">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng giá trị Thương vụ</span>
                        <span className="text-2xl font-black text-indigo-600 tracking-tighter">{formatValue(deals.reduce((sum, d) => sum + Number(d.value), 0))}</span>
                    </div>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:bg-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                        <Plus className="w-4 h-4" /> Thêm thương vụ
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
                <div className="relative w-full lg:max-w-md group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input type="text" placeholder="Tìm kiếm tên, giá trị, khách hàng..."
                        className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white transition-all text-xs font-black uppercase placeholder:text-gray-300"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mr-2"><Users className="w-3 h-3" /> Nhân sự:</div>
                    <select
                        className="px-4 py-3 bg-white border-2 border-gray-50 rounded-xl text-[10px] font-black uppercase text-slate-500 outline-none focus:border-indigo-200 transition-all cursor-pointer"
                        value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
                        <option value="all">Tất cả nhân sự</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>

                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mr-2"><Filter className="w-3 h-3" /> Độ ưu tiên:</div>
                    {[1, 2, 3].map(p => (
                        <button
                            key={p} onClick={() => setPriorityFilter(priorityFilter === p ? 'all' : p)}
                            className={`px-6 py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex-shrink-0 ${priorityFilter === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-50 text-gray-400 hover:border-indigo-200'}`}
                        >
                            {p === 3 ? 'Cao' : p === 2 ? 'Trung bình' : 'Thấp'}
                        </button>
                    ))}
                    {priorityFilter !== 'all' && (
                        <button onClick={() => setPriorityFilter('all')} className="text-[10px] font-black p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition">Xóa lọc</button>
                    )}
                </div>
            </div>

            {/* KANBAN BOARD */}
            <div className="flex space-x-8 overflow-x-auto pb-8 scrollbar-hide min-h-[70vh]">
                {STAGES.map(stage => (
                    <div
                        key={stage}
                        className="flex-shrink-0 w-[22rem] flex flex-col group/column"
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, stage)}
                    >
                        <div className="mb-6 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] ${STAGE_COLORS[stage].split(' ')[2]}`}></div>
                                <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">{stage}</h3>
                                <span className="text-[10px] font-black text-gray-300">{filteredDeals.filter(d => d.stage === stage).length}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black text-gray-900">{formatValue(filteredDeals.filter(d => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0))}</div>
                                <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Kỳ vọng: {formatValue(filteredDeals.filter(d => d.stage === stage).reduce((sum, d) => sum + Number(d.probability_weighted_value || 0), 0))}</div>
                            </div>
                        </div>

                        <div className={`space-y-5 rounded-[2.5rem] p-3 transition-colors min-h-[500px] border-2 border-transparent ${draggingId ? 'bg-indigo-50/20 border-dashed border-indigo-100' : ''}`}>
                            {filteredDeals.filter(d => d.stage === stage).map(deal => (
                                <div
                                    key={deal.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, deal.id)}
                                    className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm transition-all relative group cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:-rotate-1 ${STAGE_COLORS[deal.stage]} ${draggingId === deal.id ? 'opacity-40 animate-pulse' : 'hover:shadow-2xl hover:shadow-indigo-100/40 hover:border-white'}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <h4 onClick={() => openEdit(deal)} className="font-black text-gray-900 group-hover:text-indigo-600 transition cursor-pointer leading-none text-lg tracking-tight truncate uppercase mb-1">{deal.title}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                                <Target className="w-3 h-3" /> {deal.customer_name || 'Khách hàng mục tiêu'}
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-xl border-2 ${deal.priority === 3 ? 'bg-rose-50 border-rose-100 text-rose-600' : deal.priority === 2 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {deal.next_step && (
                                            <div className="bg-white/60 p-3 rounded-2xl border border-dashed border-current/20">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Bước tiếp theo</p>
                                                <p className="text-[10px] font-bold text-gray-600 line-clamp-2">{deal.next_step}</p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">
                                                <span>Tiến độ chốt</span>
                                                <span>{deal.probability}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${deal.probability >= 80 ? 'bg-emerald-500' : deal.probability >= 40 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${deal.probability}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="px-3 py-1.5 bg-gray-900 text-white rounded-xl font-black text-xs tracking-tighter">
                                                {formatValue(deal.value)}
                                            </div>
                                            {deal.expected_closing_date && (
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase">{new Date(deal.expected_closing_date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-5 border-t border-gray-100/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-xl shadow-black/20 italic">
                                                    {deal.owner_name?.[0] || 'Q'}
                                                </div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[80px]">{deal.owner_name?.split(' ')[0] || 'Admin'}</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleDeleteDeal(deal.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-4 h-4" /></button>
                                                {stage !== 'Thành công' && (
                                                    <button onClick={() => handleUpdateStage(deal.id, 'Thành công')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110"><CheckCircle2 className="w-5 h-5" /></button>
                                                )}
                                                {stage !== 'Thất bại' && (
                                                    <button onClick={() => handleUpdateStage(deal.id, 'Thất bại')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110"><XCircle className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredDeals.filter(d => d.stage === stage).length === 0 && (
                                <div className="py-20 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all group-hover/column:bg-white/50">
                                    <div className="p-4 bg-gray-50 rounded-[2rem] mb-4"><TrendingDown className="w-8 h-8 text-gray-300" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 text-center px-4">Trống giai đoạn này</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelinePage;
