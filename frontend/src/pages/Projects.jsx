import React from 'react';
import { useEffect, useState, useMemo } from 'react';
import {
  Folder,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Save,
  X,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  MoreVertical,
  Briefcase,
  AlertCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { motion } from 'framer-motion';

const PRIORITY_COLORS = {
  high: 'bg-rose-100 text-rose-700 border-rose-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-slate-100 text-slate-700'
};

const HEALTH_COLORS = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  off_track: 'bg-rose-500'
};

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
    </div>
    <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
    <div className="h-4 w-5/6 bg-gray-100 rounded mb-6"></div>
    <div className="flex justify-between items-center">
      <div className="h-4 w-24 bg-gray-100 rounded"></div>
      <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const Projects = () => {
  const token = useStore((state) => state.token);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    category: 'Thông thường',
    health_status: 'on_track',
    budget: 0,
    start_date: '',
    end_date: '',
    owner_id: ''
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskProject, setTaskProject] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', status: 'Pending', priority: 'Medium', due_date: '' });
  const [users, setUsers] = useState([]);

  const [priorityFilter, setPriorityFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Stats calculation
  const stats = useMemo(() => {
    const total = projects.length;
    const budget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
    const progressSum = projects.reduce((sum, p) => {
      const count = Number(p.task_count) || 0;
      const completed = Number(p.completed_tasks) || 0;
      return sum + (count > 0 ? (completed / count) * 100 : 0);
    }, 0);

    return {
      total,
      budget,
      avgProgress: total > 0 ? Math.round(progressSum / total) : 0,
      risks: projects.filter(p => p.health_status === 'off_track').length
    };
  }, [projects]);

  useEffect(() => {
    if (!token) return;
    fetchUsers();
    const delayDebounceFn = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [token, search, statusFilter, priorityFilter, healthFilter, ownerFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data.users || []);
    } catch (err) {
      console.error('Lấy danh sách nhân sự thất bại');
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects?search=${search}&status=${statusFilter}&owner_id=${ownerFilter}`);
      let fetchedProjects = response.data.data.projects || [];

      if (priorityFilter !== 'all') fetchedProjects = fetchedProjects.filter(p => p.priority === priorityFilter);
      if (healthFilter !== 'all') fetchedProjects = fetchedProjects.filter(p => p.health_status === healthFilter);

      setProjects(fetchedProjects);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi nạp dữ liệu dự án');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setProjectForm({
      name: '',
      description: '',
      status: 'active',
      priority: 'medium',
      category: 'Thông thường',
      health_status: 'on_track',
      budget: 0,
      start_date: '',
      end_date: '',
      owner_id: ''
    });
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return toast.error('Vui lòng nhập tên dự án');

    if (projectForm.budget < 0) return toast.error('Ngân sách không được để giá trị âm');
    if (projectForm.start_date && projectForm.end_date) {
      if (new Date(projectForm.end_date) < new Date(projectForm.start_date)) {
        return toast.error('Ngày hoàn thành không thể trước ngày bắt đầu');
      }
    }

    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject.id}`, projectForm);
        toast.success('Đã cập nhật dự án');
      } else {
        await api.post('/projects', projectForm);
        toast.success('Đã khởi tạo dự án mới');
      }
      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...taskForm,
        project_id: taskProject.id,
        assigned_user_id: taskProject.owner_id
      });
      toast.success('Đã thêm nhiệm vụ nhanh cho dự án!');
      setShowTaskModal(false);
      setTaskForm({ title: '', status: 'Pending', priority: 'Medium', due_date: '' });
      fetchProjects();
    } catch (err) {
      toast.error('Tạo nhiệm vụ thất bại');
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      status: project.status || 'active',
      priority: project.priority || 'medium',
      category: project.category || 'Thông thường',
      health_status: project.health_status || 'on_track',
      budget: project.budget || 0,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      owner_id: project.owner_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này? Tất cả nhiệm vụ liên quan sẽ bị xóa.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Đã xóa dự án thành công');
    } catch (err) {
      toast.error('Xóa dự án thất bại');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Modal Dự án */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl transform transition-all overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic leading-none">{selectedProject ? 'Cập nhật Dự án' : 'Khởi tạo Dự án mới'}</h2>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">Cấu hình các mục tiêu và kế hoạch triển khai</p>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-3 hover:bg-white rounded-2xl transition-transform hover:rotate-90 text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Định danh Dự án</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên dự án (Ví dụ: Sự kiện Khai trương 2026)"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Độ ưu tiên</label>
                  <select
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 cursor-pointer"
                    value={projectForm.priority}
                    onChange={e => setProjectForm({ ...projectForm, priority: e.target.value })}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phân loại</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Vận hành, Marketing..."
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    value={projectForm.category}
                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 cursor-pointer"
                    value={projectForm.start_date}
                    onChange={e => setProjectForm({ ...projectForm, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 cursor-pointer"
                    value={projectForm.end_date}
                    onChange={e => setProjectForm({ ...projectForm, end_date: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mô tả chi tiết</label>
                  <textarea
                    rows="3"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900 resize-none"
                    placeholder="Mục tiêu và kế hoạch cụ thể của dự án này là gì?"
                    value={projectForm.description}
                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Người phụ trách</label>
                  <select
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 cursor-pointer"
                    value={projectForm.owner_id}
                    onChange={e => setProjectForm({ ...projectForm, owner_id: e.target.value })}
                  >
                    <option value="">Chọn nhân sự phụ trách...</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Trạng thái vận hành</label>
                  <select
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 cursor-pointer"
                    value={projectForm.status}
                    onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                  >
                    <option value="active">Đang triển khai</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-indigo-600 text-white rounded-[1.25rem] shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 transition-all"
                >
                  {selectedProject ? 'Lưu thay đổi' : 'Kích hoạt Dự án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nhiệm vụ Nhanh */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase italic underline decoration-indigo-200 decoration-4">Nhiệm vụ nhanh</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Dự án: {taskProject?.name}</p>
              </div>
              <button onClick={() => setShowTaskModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-8 space-y-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tên công việc</label>
                <input required type="text" className="p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-indigo-100 transition-all"
                  placeholder="Ví dụ: Thiết kế file 3D..."
                  value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Độ ưu tiên</label>
                  <select className="p-3 bg-slate-50 rounded-xl font-bold border-none outline-none text-[10px] uppercase"
                    value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="Low">Thấp</option>
                    <option value="Medium">Trung bình</option>
                    <option value="High">Cao</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạn chót</label>
                  <input type="date" className="p-3 bg-slate-50 rounded-xl font-bold border-none outline-none text-[10px]"
                    value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all">
                Tạo nhiệm vụ ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Thống kê KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform"><Briefcase className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Dự án hiện hữu</span>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{stats.total}</div>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Hệ thống SmartCRM</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform"><Folder className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ngân sách tổng</span>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-emerald-600 tracking-tighter truncate">{formatCurrency(stats.budget)}</div>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Nguồn lực đầu tư</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Clock className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tiến độ TB</span>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-900 tracking-tighter italic">{stats.avgProgress}%</div>
            <div className="w-full h-2 bg-slate-50 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${stats.avgProgress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-rose-50 bg-rose-50/5 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all group overflow-hidden relative">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform"><AlertCircle className="w-6 h-6" /></div>
            <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Rủi ro cần xử lý</span>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-rose-600 tracking-tighter italic">{stats.risks} Gói</div>
            <p className="text-[10px] font-black text-rose-400 mt-2 uppercase tracking-widest italic underline decoration-rose-200">Cần can thiệp ngay</p>
          </div>
        </div>
      </div>

      {/* Header Trang */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between py-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 italic">
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic underline decoration-indigo-200 decoration-8">Quản trị Dự án</h1>
          </div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest ml-1">Điều phối và giám sát lộ trình triển khai</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[1.25rem] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <Plus className="w-5 h-5" /> Khởi tạo Dự án
        </button>
      </div>

      {/* Thanh Công cụ Bộ lọc */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
          {['all', 'active', 'completed', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 ${statusFilter === status ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {status === 'all' ? 'Tất cả' : status === 'active' ? 'Đang chạy' : status === 'completed' ? 'Đã xong' : 'Lưu trữ'}
            </button>
          ))}

          <div className="w-px h-6 bg-slate-100 mx-2 hidden lg:block"></div>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-[9px] font-black uppercase text-slate-500 outline-none cursor-pointer">
            <option value="all">Mọi độ ưu tiên</option>
            <option value="high">Cao nhất</option>
            <option value="medium">Bình thường</option>
            <option value="low">Thấp</option>
          </select>

          <select value={healthFilter} onChange={e => setHealthFilter(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-[9px] font-black uppercase text-slate-500 outline-none cursor-pointer">
            <option value="all">Mọi trạng thái</option>
            <option value="on_track">🟢 Đang tốt</option>
            <option value="at_risk">🟡 Rủi ro</option>
            <option value="off_track">🔴 Nguy cấp</option>
          </select>

          <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-[9px] font-black uppercase text-slate-500 outline-none cursor-pointer">
            <option value="all">Mọi nhân sự</option>
            {users.map(u => <option key={u.id} value={u.id}>💼 {u.name}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-80 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition" />
          <input
            type="text"
            placeholder="Tìm tên dự án..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border-2 border-transparent rounded-2xl focus:border-indigo-100 focus:bg-white transition text-[10px] font-black uppercase placeholder:text-slate-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Dự án */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-50">
          <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 text-indigo-200 animate-pulse">
            <Folder className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Chưa tìm thấy dự án nào</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-8 font-bold uppercase text-[10px] tracking-widest leading-relaxed">Hãy khởi tạo dự án đầu tiên của bạn để bắt đầu theo dõi tiến độ và công việc ngay hôm nay.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const completedRatio = project.task_count ? Math.round((project.completed_tasks * 100) / project.task_count) : 0;
            return (
              <div key={project.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition truncate uppercase italic">{project.name}</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{project.category || 'General'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 text-sm font-bold mb-8 line-clamp-2 min-h-[40px] italic leading-relaxed">
                  {project.description || 'Tiếp tục triển khai và theo dõi các cột mốc dự án quan trọng để đảm bảo tiến độ.'}
                </p>

                {project.deal_title && (
                  <div className="mb-6 flex items-center gap-3 px-4 py-2.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><Filter className="w-3.5 h-3.5 text-indigo-600" /></div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate italic">Thương vụ: {project.deal_title}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    {project.start_date ? new Date(project.start_date).toLocaleDateString('vi-VN') : '---'}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-200" />
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <Clock className="w-4 h-4 text-slate-300" />
                    {project.end_date ? new Date(project.end_date).toLocaleDateString('vi-VN') : '---'}
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 italic">
                    <span>{project.completed_tasks} / {project.task_count} Hoàn thành</span>
                    <span className="text-indigo-600 underline decoration-indigo-200 decoration-4">{completedRatio}%</span>
                  </div>
                  <div className="h-3 bg-slate-50 rounded-full overflow-hidden relative shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ${project.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${completedRatio}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{formatCurrency(project.budget || 0)}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${HEALTH_COLORS[project.health_status] || HEALTH_COLORS.on_track} shadow-sm animate-pulse`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${project.health_status === 'off_track' ? 'text-rose-500' : project.health_status === 'at_risk' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {project.health_status === 'on_track' ? 'Đang tốt' : project.health_status === 'at_risk' ? 'Rủi ro' : 'Nguy cấp'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {[1, 2].map(i => (
                      <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center text-[11px] font-black text-indigo-600 shadow-sm italic transition-transform group-hover:scale-110">
                        {(project.owner_name || 'U')[0]}
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-sm hover:bg-indigo-600 transition-colors cursor-pointer">
                      +
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setTaskProject(project); setShowTaskModal(true); }}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn"
                    >
                      <Zap className="w-4 h-4 fill-transparent group-hover/btn:fill-white transition-all" /> Công việc
                    </button>
                    <button
                      onClick={() => window.location.href = `/tasks?project=${project.id}`}
                      className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                    >
                      Thông tin <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
