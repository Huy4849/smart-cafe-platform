import { useCallback, useEffect, useState } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    ChevronRight,
    UserPlus,
    X,
    Target
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const STATUS_VARIANTS = {
    'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'inactive': 'bg-gray-100 text-gray-500 border-gray-200',
    'lead': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'vip': 'bg-purple-100 text-purple-700 border-purple-200'
};

const STATUS_LABELS = {
    'active': 'Đang hoạt động',
    'inactive': 'Ngừng giao dịch',
    'lead': 'Tiềm năng',
    'vip': 'Khách hàng VIP'
};

const Customers = () => {
    const { token, user } = useStore();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [customerForm, setCustomerForm] = useState({
        name: '', email: '', phone: '', company: '', status: 'active'
    });

    const [dealForm, setDealForm] = useState({
        title: '', value: 0, customer_id: ''
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/customers?search=${search}&status=${statusFilter}`);
            setCustomers(response.data.data.customers || []);
        } catch (err) {
            toast.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        if (!token) return;
        fetchCustomers();
    }, [token, fetchCustomers]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer.id}`, customerForm);
                toast.success('Đã cập nhật hồ sơ khách hàng');
            } else {
                await api.post('/customers', customerForm);
                toast.success('Đã đăng ký hồ sơ khách hàng mới');
            }
            setShowModal(false);
            resetForm();
            fetchCustomers();
        } catch (err) {
            toast.error('Thao tác thất bại');
        }
    };

    const handleCreateDeal = async (e) => {
        e.preventDefault();
        try {
            await api.post('/deals', {
                ...dealForm,
                customerId: dealForm.customer_id,
                stage: 'Qualification',
                priority: 1,
                probability: 10,
                ownerId: user?.id
            });
            toast.success('Đã chuyển đổi tiềm năng thành cơ hội kinh doanh!');
            setShowDealModal(false);
            fetchCustomers();
        } catch (err) {
            toast.error('Chuyển đổi thất bại');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ khách hàng này không? Tất cả thương vụ và nhật ký liên quan sẽ bị xóa.')) return;
        try {
            await api.delete(`/customers/${id}`);
            // Optimistic update
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success('Đã xóa hồ sơ khách hàng thành công');
        } catch (err) {
            toast.error('Xóa hồ sơ thất bại: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
        }
    };

    const resetForm = () => {
        setSelectedCustomer(null);
        setCustomerForm({ name: '', email: '', phone: '', company: '', status: 'active' });
    };

    const openEdit = (customer) => {
        setSelectedCustomer(customer);
        setCustomerForm({
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            company: customer.company || '',
            status: customer.status || 'active'
        });
        setShowModal(true);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-700">
            {/* Modal Thêm/Sửa Khách hàng */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedCustomer ? 'Sửa hồ sơ' : 'Khách hàng mới'}</h2>
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Quản lý nhận diện SmartCRM</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:rotate-90 transition-transform"><X /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Họ và tên</label>
                                    <input required type="text" className="p-4 bg-slate-50 focus:bg-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all"
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                        value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Email</label>
                                        <input type="email" className="p-4 bg-slate-50 focus:bg-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all"
                                            placeholder="email@example.com"
                                            value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Số điện thoại</label>
                                        <input type="text" className="p-4 bg-slate-50 focus:bg-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all"
                                            placeholder="09xxx..."
                                            value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Công ty</label>
                                    <input type="text" className="p-4 bg-slate-50 focus:bg-white border-2 border-transparent focus:border-indigo-100 rounded-2xl outline-none font-bold transition-all"
                                        value={customerForm.company} onChange={e => setCustomerForm({ ...customerForm, company: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Trạng thái</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(STATUS_LABELS).map(s => (
                                            <button type="button" key={s} onClick={() => setCustomerForm({ ...customerForm, status: s })}
                                                className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${customerForm.status === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white'}`}>
                                                {STATUS_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 transition-all">
                                {selectedCustomer ? 'Lưu hồ sơ' : 'Đăng ký khách hàng'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Chuyển đổi Lead -> Deal */}
            {showDealModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-xl font-black text-gray-900 uppercase italic underline decoration-indigo-200 decoration-4">Khởi tạo cơ hội</h3>
                            <button onClick={() => setShowDealModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreateDeal} className="p-8 space-y-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tên thương vụ</label>
                                <input required type="text" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-indigo-100 transition-all"
                                    value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá trị dự kiến (VND)</label>
                                <input type="number" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-indigo-100 transition-all"
                                    value={dealForm.value} onChange={e => setDealForm({ ...dealForm, value: Number(e.target.value) })} />
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all">
                                Xác nhận chuyển đổi
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Tiêu đề trang */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Danh mục khách hàng</h1>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1">Quản lý quan hệ & lịch sử tương tác</p>
                </div>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:bg-slate-900 transition-all font-black text-xs uppercase tracking-widest">
                    <Plus className="w-5 h-5" /> Thêm khách hàng
                </button>
            </div>

            {/* Thanh công cụ */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex items-center gap-3 bg-white p-2 border border-slate-100 rounded-[1.5rem] shadow-sm overflow-x-auto scrollbar-hide">
                    <button onClick={() => setStatusFilter('all')}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                        Tất cả
                    </button>
                    {Object.keys(STATUS_LABELS).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition" />
                    <input type="text" placeholder="Tìm tên, email, công ty..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-100 transition text-xs font-bold uppercase"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Grid Khách hàng */}
            {loading ? (
                <div className="flex justify-center p-24 text-slate-300 animate-pulse font-bold tracking-widest uppercase text-[10px]">Đang đồng bộ CRM...</div>
            ) : customers.length === 0 ? (
                <div className="bg-white p-24 text-center rounded-[3rem] border-2 border-dashed border-slate-50 font-bold uppercase tracking-widest text-[10px] text-slate-400">Không tìm thấy hồ sơ.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {customers.map(customer => (
                        <div key={customer.id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-300 p-8 group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm italic">
                                    {customer.name?.[0]}
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_VARIANTS[customer.status]}`}>
                                    {STATUS_LABELS[customer.status] || customer.status}
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase truncate">{customer.name}</h3>
                                    {customer.company && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{customer.company}</p>}
                                </div>
                                <div className="space-y-2 text-xs font-bold text-slate-500 italic">
                                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 opacity-30" /> {customer.email || 'N/A'}</div>
                                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 opacity-30" /> {customer.phone || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 mb-8 px-1">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Thương vụ</span>
                                    <span className="text-sm font-black text-slate-900">{customer.total_deals || 0}</span>
                                </div>
                                <div className="w-px h-6 bg-slate-100"></div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Doanh thu chốt</span>
                                    <span className="text-sm font-black text-indigo-600">{formatCurrency(customer.total_revenue || 0)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                {customer.status === 'lead' ? (
                                    <button onClick={() => { setDealForm({ title: `Thương vụ: ${customer.name}`, value: 0, customer_id: customer.id }); setShowDealModal(true); }}
                                        className="flex items-center text-[9px] font-black text-indigo-600 uppercase gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                        <Target className="w-3 h-3" /> Tạo cơ hội
                                    </button>
                                ) : (
                                    <div className="flex items-center text-[9px] font-black text-slate-400 uppercase gap-1">
                                        <ChevronRight className="w-4 h-4" /> Chi tiết
                                    </div>
                                )}
                                <div className="flex gap-1.5">
                                    <button onClick={() => openEdit(customer)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(customer.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Customers;
