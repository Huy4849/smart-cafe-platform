import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  TrendingUp,
  Plus,
  DollarSign,
  Calendar,
  Layers,
  Target,
  ArrowRight,
  Clock,
  Layout,
  BarChart3,
  RefreshCw,
  Search,
  ChevronRight,
  TrendingDown,
  Activity,
  Zap,
  UserCheck,
  Award,
  AlertCircle,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Ánh xạ trạng thái từ DB (Tiếng Anh) sang giao diện (Tiếng Việt)
const STAGE_MAP = {
  'Qualification': 'Tiềm năng',
  'Proposal': 'Báo giá',
  'Negotiation': 'Thương thảo',
  'Won': 'Thành công',
  'Lost': 'Thất bại'
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200/50 rounded-2xl ${className}`}></div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-black text-indigo-600">
          {payload[0].name}: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const EmptyState = ({ message, icon: Icon = Activity }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 px-6 text-center"
  >
    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-slate-200" />
    </div>
    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 max-w-[200px] leading-relaxed italic">
      {message}
    </p>
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function Dashboard() {
  const token = useStore((state) => state.token);
  const { user } = useStore();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');
  const [ownerFilter, setOwnerFilter] = useState('all');

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data.users || [];
    },
    enabled: !!token
  });

  const { data: reportData, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['reports-summary-dashboard-v6', period, ownerFilter],
    queryFn: async () => {
      const res = await api.get(`/reports/summary?period=${period}&owner_id=${ownerFilter}`);
      return res.data.data;
    },
    enabled: !!token,
    staleTime: 60000
  });

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center animate-bounce">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic">Lỗi kết nối dữ liệu</h2>
          <p className="text-slate-400 font-bold text-sm mt-2">Hệ thống đang bảo trì hoặc gặp sự cố kết nối. Vui lòng thử lại sau.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100"
        >
          Tải lại dữ liệu
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Đang khởi tạo trí tuệ kinh doanh...</p>
      </div>
    );
  }

  const stats = reportData || {};
  const currentRevenue = stats?.growthMetrics?.currentMonthRevenue || 0;
  const growth = stats?.growthMetrics?.growthPercentage || 0;
  const revenueGoal = stats.revenueGoal || 25000000;
  const goalProgress = revenueGoal > 0 ? (currentRevenue / revenueGoal) * 100 : 0;

  // Xử lý dữ liệu Completion Stats cho biểu đồ tròn (Pie)
  const mappedCompletionStats = (stats.completionStats || []).map(item => ({
    ...item,
    status: STAGE_MAP[item.status] || item.status,
    dbStatus: item.status // Giữ nguyên để filter
  }));

  const handleStageClick = (stage) => {
    const apiToUI = {
      'Qualification': 'Tiềm năng',
      'Proposal': 'Báo giá',
      'Negotiation': 'Thương thảo',
      'Won': 'Thành công',
      'Lost': 'Thất bại'
    };
    const uiStage = apiToUI[stage] || stage;
    navigate(`/pipeline?stage=${encodeURIComponent(uiStage)}`);
  };

  const handleWarriorClick = (id) => {
    navigate(`/pipeline?owner=${encodeURIComponent(id)}`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* TIÊU ĐỀ CHÍNH */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7 }}
              className="w-12 h-12 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-100 border-2 border-indigo-400/20"
            >
              <BarChart3 className="w-6 h-6" />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Trung tâm Báo cáo</h1>
          </div>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] ml-1">
            SmartCRM Analytics &bull; Hệ thống vận hành thời gian thực &bull; {user?.name || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <button
            onClick={() => refetch()}
            className="p-4 bg-white text-slate-400 rounded-2xl border border-slate-200 hover:text-indigo-600 transition-all hover:shadow-xl hover:border-indigo-100 group"
          >
            <RefreshCw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* TỔNG QUAN CHỈ SỐ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THẺ DOANH THU CHÍNH */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className="lg:col-span-2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 p-10 rounded-[4rem] shadow-2xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between min-h-[350px] group border-4 border-white/10"
        >
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-400/20 blur-[130px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[11px] font-black text-white uppercase tracking-[0.25em] bg-white/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10">
                <Target className="w-4 h-4 text-amber-300 fill-amber-300" /> Doanh thu chốt theo kỳ
              </div>
              <div className="space-y-2">
                <h2 className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                  {isLoading ? '...' : formatCurrency(currentRevenue)}
                </h2>
                <p className="text-indigo-200/60 text-lg font-bold tracking-widest uppercase italic ml-1">
                  Mục tiêu: {formatCurrency(revenueGoal)}
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-[2rem] font-black text-base shadow-2xl backdrop-blur-2xl border border-white/20 ${Number(growth) >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
              >
                {Number(growth) >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {growth}%
              </motion.div>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.3em] mt-6 opacity-60 italic">So với chu kỳ trước</p>
            </div>
          </div>

          <div className="relative z-10 space-y-6 mt-12 bg-white/5 p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-black text-white uppercase tracking-[0.4em] px-2 italic">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Tiến độ hoàn thành mục tiêu</span>
              <span className="bg-indigo-900 text-white px-4 py-1.5 rounded-xl border border-white/20 shadow-lg">{goalProgress.toFixed(1)}% Hoàn tất</span>
            </div>
            <div className="w-full h-6 bg-white/10 rounded-full p-1.5 shadow-inner relative overflow-hidden ring-1 ring-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, goalProgress)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-indigo-400 rounded-full shadow-[0_0_30px_rgba(52,211,153,0.6)] relative group"
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* THẺ THỐNG KÊ NHANH */}
        <div className="grid grid-rows-2 gap-8">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/pipeline')}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden cursor-pointer"
          >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 hover:rotate-6">
              <Layers className="w-10 h-10" />
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                {isLoading ? '...' : (stats.completionStats?.reduce((sum, s) => sum + s.count, 0) || 0)}
              </p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Cơ hội đang xử lý</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-50/30 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-all"></div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/pipeline')}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-2xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden cursor-pointer"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 hover:-rotate-6">
              <Activity className="w-10 h-10" />
            </div>
            <div className="relative z-10">
              <p className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                {isLoading ? '...' : formatCurrency(stats.budgetAnalysis?.reduce((sum, s) => sum + s.budget, 0) || 0)}
              </p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Tổng giá trị dự kiến (Thương vụ)</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-50/30 rounded-full blur-2xl group-hover:bg-emerald-100/50 transition-all"></div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* BIỂU ĐỒ XU HƯỚNG DOANH THU */}
        <motion.div variants={itemVariants} className="xl:col-span-2 bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Xu hướng doanh thu thực tế</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Dữ liệu chốt đơn thành công theo thời gian
              </p>
            </div>
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <BarChart3 className="w-7 h-7" />
            </div>
          </div>
          <div className="h-[380px] w-full">
            {isLoading ? <Skeleton className="w-full h-full" /> :
              stats.revenueTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'black', textTransform: 'uppercase' }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'black' }}
                      tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 2, strokeDasharray: '5 5' }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#4F46E5"
                      strokeWidth={6}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 10, stroke: '#fff', strokeWidth: 4 }}
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState message="Hệ thống chưa ghi nhận dữ liệu doanh số thực tế trong thời gian này." />
            }
          </div>
        </motion.div>

        {/* NHÂN VIÊN XUẤT SẮC */}
        <motion.div variants={itemVariants} className="space-y-8 h-full">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-10 h-full flex flex-col relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Nhân sự xuất sắc</h2>
              <Award className="w-8 h-8 text-amber-500 fill-amber-500 animate-pulse" />
            </div>
            <div className="space-y-6 flex-1 overflow-y-auto pr-3 scrollbar-hide relative z-10">
              {isLoading ? [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />) :
                stats.teamPerformance?.length > 0 ? (
                  stats.teamPerformance.map((rep, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleWarriorClick(rep.id)}
                      className="flex items-center gap-5 bg-slate-50/50 p-5 rounded-[2rem] hover:bg-white hover:shadow-[0_15px_40px_rgba(79,70,229,0.1)] transition-all cursor-pointer border-2 border-transparent hover:border-indigo-100 group/item"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-md border border-slate-100 italic text-2xl group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                        {rep.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate uppercase mb-1">{rep.name}</p>
                        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 italic">
                          <Zap className="w-3.5 h-3.5 fill-emerald-500" /> {formatCurrency(rep.revenue)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </motion.div>
                  ))
                ) : <EmptyState message="Đội ngũ chưa có doanh số phát sinh trong chu kỳ này." />
              }
            </div>
            <button
              onClick={() => navigate('/pipeline')}
              className="mt-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl relative z-10 group"
            >
              Quản trị Thương vụ <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PHÂN BỔ GIAI ĐOẠN THƯƠNG VỤ */}
        <motion.div variants={itemVariants} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Tiến độ thương vụ</h2>
            <span className="bg-indigo-50 px-5 py-2.5 rounded-2xl text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border border-indigo-100 shadow-sm">
              Đang xử lý: {stats.completionStats?.reduce((sum, s) => sum + s.count, 0) || 0} Thương vụ
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-14">
            <div className="w-64 h-64 flex-shrink-0 relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                <span className="text-3xl font-black text-slate-900 italic">{stats.completionStats?.reduce((sum, s) => sum + s.count, 0) || 0}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hợp đồng</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                <PieChart>
                  <Pie data={mappedCompletionStats} innerRadius={85} outerRadius={115} paddingAngle={10} dataKey="count" nameKey="status" stroke="none">
                    {mappedCompletionStats.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-4">
              {mappedCompletionStats.length > 0 ? mappedCompletionStats.map((stage, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 10 }}
                  onClick={() => handleStageClick(stage.dbStatus)}
                  className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2rem] border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors italic">{stage.status}</span>
                  </div>
                  <span className="text-base font-black text-slate-900 group-hover:scale-110 transition-transform">{stage.count} cơ hội</span>
                </motion.div>
              )) : <EmptyState message="Chưa có dữ liệu giai đoạn." />}
            </div>
          </div>
        </motion.div>

        {/* NHỊP ĐẬP KHÁCH HÀNG (ACTIVITY HISTORY) */}
        <motion.div variants={itemVariants} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12 flex flex-col hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Nhịp đập khách hàng</h2>
            <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
          <div className="space-y-10 flex-1 relative">
            <div className="absolute left-6 top-2 bottom-6 w-1 bg-slate-50/50 rounded-full z-0"></div>
            {stats.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (activity.project_id) {
                      navigate(`/projects?search=${encodeURIComponent(activity.project_name)}`);
                    } else {
                      const searchTrigger = activity.deal_name !== 'Yêu cầu chung' ? activity.deal_name : '';
                      navigate(`/pipeline?search=${encodeURIComponent(searchTrigger)}`);
                    }
                  }}
                  className="flex gap-6 group relative z-50 cursor-pointer bg-white/50 p-4 rounded-3xl hover:bg-white hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-100"
                >
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6 ${activity.status === 'Done' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    {activity.status === 'Done' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-base font-black text-slate-900 truncate uppercase group-hover:text-indigo-600 transition-colors mb-2 italic tracking-tight">{activity.title}</p>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-80">
                      {activity.project_id ? <Briefcase className="w-4 h-4 text-indigo-400" /> : <UserCheck className="w-4 h-4 text-indigo-400" />}
                      {activity.project_id ? activity.project_name : activity.deal_name} &bull; {new Date(activity.updated_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              ))
            ) : <EmptyState message="Đang chờ các hoạt động tương tác mới từ đội ngũ sales." />
            }
          </div>
          <button
            onClick={() => navigate('/pipeline')}
            className="mt-12 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm group"
          >
            Nhật ký Thương vụ chi tiết <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
