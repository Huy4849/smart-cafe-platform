import PropTypes from 'prop-types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    ComposedChart,
    AreaChart,
    Line,
    Area
} from 'recharts';
import {
    TrendingUp,
    DollarSign,
    Target,
    Download,
    Filter,
    ArrowUpRight,
    TrendingDown,
    Activity,
    Award,
    Zap,
    Clock,
    BarChart3
} from 'lucide-react';
import useStore from '../store/useStore';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value || 0);
};

const Reports = () => {
    const token = useStore((state) => state.token);
    const [ownerFilter, setOwnerFilter] = useState('all');
    const [period, setPeriod] = useState('month');

    const { data: usersData = [] } = useQuery({
        queryKey: ['users-list-reports'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data.data.users || [];
        },
        enabled: !!token
    });

    const { data: stats, isLoading } = useQuery({
        queryKey: ['sales-reports-v7', ownerFilter, period],
        queryFn: async () => {
            const res = await api.get(`/reports/summary?owner_id=${ownerFilter}&period=${period}`);
            return res.data.data;
        },
        enabled: !!token,
        staleTime: 60000
    });

    const totalPotential = stats?.budgetAnalysis?.reduce((sum, d) => sum + d.budget, 0) || 0;
    const wonRevenue = stats?.teamPerformance?.reduce((sum, p) => sum + Number(p.revenue), 0) || 0;
    const wonCount = stats?.completionStats?.find(s => s.status === 'Won' || s.status === 'Thành công' || s.status === 'Thành công')?.count || 0;
    const lostCount = stats?.completionStats?.find(s => s.status === 'Lost' || s.status === 'Thất bại')?.count || 0;
    const accuracy = (wonCount + lostCount) > 0 ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(1) : 0;

    const STAGE_MAP = {
        'Qualification': 'Tiềm năng',
        'Proposal': 'Báo giá',
        'Negotiation': 'Thương thảo',
        'Won': 'Thành công',
        'Lost': 'Thất bại'
    };

    const PRIORITY_MAP = {
        'High': 'Cao',
        'Medium': 'Trung bình',
        'Low': 'Thấp'
    };

    const mappedPriorityData = (stats?.priorityDistribution || []).map(item => ({
        ...item,
        priority: PRIORITY_MAP[item.priority] || item.priority
    }));

    const mappedBudgetAnalysis = (stats?.budgetAnalysis || []).map(item => ({
        ...item,
        name: STAGE_MAP[item.name] || item.name
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-5 border border-slate-100 shadow-2xl rounded-[2rem] animate-in zoom-in duration-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{label}</p>
                    {payload.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                            <p className="text-sm font-black text-slate-900">
                                {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatCurrency(entry.value) : entry.value}
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    CustomTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.array,
        label: PropTypes.string
    };

    const handleExport = () => {
        if (!stats) return toast.error('Không có dữ liệu để xuất');

        const headers = ['Mục', 'Giá trị'];
        const formatCSVRow = (arr) => arr.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");

        const rows = [
            ['Doanh thu thực tế', formatCurrency(wonRevenue)],
            ['Giá trị Thương vụ', formatCurrency(totalPotential)],
            ['Tỷ lệ thành công (%)', `${accuracy}%`],
            ['---', '---'],
            ['Giai đoạn', 'Ngân sách'],
            ...(stats.budgetAnalysis || []).map(b => [STAGE_MAP[b.name] || b.name, formatCurrency(b.budget)]),
            ['---', '---'],
            ['Nhân sự', 'Doanh số'],
            ...(stats.teamPerformance || []).map(t => [t.name, formatCurrency(t.revenue)])
        ];

        // Ensure UTF-8 with BOM for Excel compatibility
        const csvString = [headers, ...rows].map(formatCSVRow).join("\n");
        const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Bao-cao-SmartCRM-${period}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Xuất báo cáo thành công!');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Đang khởi tạo trí tuệ kinh doanh...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic underline decoration-indigo-100 decoration-8">Phân tích kinh doanh</h1>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">Thông tin hiệu suất & Dự báo doanh thu thông minh</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1 shadow-sm">
                        {['month', 'quarter', 'year'].map(p => (
                            <button
                                key={p} onClick={() => setPeriod(p)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${period === p ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
                            >
                                {p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1 shadow-sm">
                        <select
                            value={ownerFilter}
                            onChange={(e) => setOwnerFilter(e.target.value)}
                            className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-slate-500 px-3 cursor-pointer"
                        >
                            <option value="all">Tất cả nhân sự</option>
                            {usersData.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition font-black text-xs uppercase tracking-widest"
                    >
                        <Download className="w-4 h-4" /> Xuất báo cáo
                    </button>
                </div>
            </div>

            {/* Chỉ số hàng đầu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div whileHover={{ y: -5 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-indigo-600" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tổng doanh thu thực tế</p>
                    <div className="text-4xl font-black text-slate-900 mb-4 tracking-tighter truncate italic">{formatCurrency(wonRevenue)}</div>
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black italic uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4" /> Dựa trên các thương vụ đã chốt
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Giá trị dự báo (Thương vụ)</p>
                    <div className="text-4xl font-black text-indigo-600 mb-4 tracking-tighter truncate italic">{formatCurrency(totalPotential)}</div>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black italic uppercase tracking-widest">
                        <Activity className="w-4 h-4" /> Toàn bộ phễu Thương vụ
                    </div>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white bg-gradient-to-br from-indigo-700 to-indigo-900">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Tỷ lệ chốt thành công</p>
                    <div className="text-5xl font-black mb-4 italic tracking-tighter">{accuracy}%</div>
                    <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-black italic uppercase tracking-widest">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Hiệu suất thực tế SmartCRM
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* PHÂN BỔ GIAI ĐOẠN Thương vụ */}
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Giá trị từng giai đoạn</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Filter className="w-3 h-3" /> Phân bổ nguồn lực theo phễu bán hàng
                            </p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <DollarSign className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="w-full h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={mappedBudgetAnalysis}>
                                <defs>
                                    <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black', textTransform: 'uppercase' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black' }} tickFormatter={(v) => `${v / 1000000}M`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="budget" name="Ngân sách" fill="url(#barColor)" radius={[15, 15, 0, 0]} barSize={50} />
                                <Line type="monotone" dataKey="task_count" name="Số Thương vụ" stroke="#f59e0b" strokeWidth={5} dot={{ r: 8, fill: '#f59e0b', strokeWidth: 0 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bảng xếp hạng nhân viên */}
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Bảng xếp hạng đại lý</h2>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Award className="w-3 h-3" /> Thành tích đóng góp doanh số thực tế
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Zap className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="w-full h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.teamPerformance || []} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 'black', textTransform: 'uppercase' }} width={120} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" name="Doanh số chốt" radius={[0, 20, 20, 0]} barSize={40}>
                                    {(stats?.teamPerformance || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* XU HƯỚNG DOANH THU */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">Xu hướng tăng trưởng</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Lịch sử doanh thu {period === 'month' ? '6 tháng' : period === 'quarter' ? '12 tháng' : '5 năm'}
                        </p>
                    </div>
                    <button className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                        Chi tiết <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.revenueTrend || []}>
                            <defs>
                                <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black', textTransform: 'uppercase' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black' }} tickFormatter={(v) => `${v / 1000000}M`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#4F46E5" strokeWidth={6} fillOpacity={1} fill="url(#areaColor)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Phân bổ ưu tiên */}
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm flex flex-col items-center hover:shadow-2xl transition-all">
                    <h3 className="text-sm font-black text-slate-900 uppercase italic mb-10 tracking-widest underline decoration-indigo-100 decoration-4">Độ ưu tiên Thương vụ</h3>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mappedPriorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="priority"
                                    stroke="none"
                                >
                                    {mappedPriorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Thống kê hiệu suất thông minh */}
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm lg:col-span-2 hover:shadow-2xl transition-all">
                    <h3 className="text-sm font-black text-slate-900 uppercase italic mb-12 tracking-widest underline decoration-indigo-100 decoration-4">Thông tin tình báo kinh doanh</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-sm border border-indigo-100 italic font-black">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full w-fit mb-2">Giá trị Thương vụ trung bình</h4>
                                <p className="text-3xl font-black text-indigo-600 italic tracking-tighter">{formatCurrency(totalPotential / (stats?.completionStats?.reduce((sum, s) => sum + Number(s.count), 0) || 1))}</p>
                                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Kỳ vọng trên mỗi cơ hội</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-sm border border-emerald-100 italic font-black">
                                <Target className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full w-fit mb-2">Chỉ số ROI dự kiến</h4>
                                <p className="text-3xl font-black text-emerald-600 italic tracking-tighter">4.8x</p>
                                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Hiệu suất nỗ lực Marketing</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0 shadow-sm border border-amber-100 italic font-black">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full w-fit mb-2">Chu kỳ chốt hợp đồng</h4>
                                <p className="text-3xl font-black text-amber-600 italic tracking-tighter">18.4 Ngày</p>
                                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Trung bình thời gian tư vấn</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 flex-shrink-0 shadow-sm border border-rose-100 italic font-black">
                                <TrendingDown className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-slate-400 text-[9px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full w-fit mb-2">Tỷ lệ rời bỏ dự kiến</h4>
                                <p className="text-3xl font-black text-rose-600 italic tracking-tighter">4.2%</p>
                                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Xác suất mất tiềm năng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
