import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Calendar, CheckSquare, Plus, X, Edit2, Trash2, Search, MessageSquare, Clock, Tag } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const STATUS_MAP = {
  'Pending': 'Chờ xử lý',
  'In Progress': 'Đang thực hiện',
  'Done': 'Hoàn thành'
};

const TYPE_MAP = {
  'Task': 'Nhiệm vụ',
  'Call': 'Gọi điện',
  'Email': 'Gửi Email',
  'Meeting': 'Họp mặt',
  'Development': 'Phát triển',
  'Design': 'Thiết kế',
  'Documentation': 'Tư liệu',
  'Planning': 'Lập kế hoạch'
};

const PRIORITY_MAP = {
  'High': 'Cao',
  'Medium': 'Trung bình',
  'Low': 'Thấp'
};

export default function Tasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter] = useState(searchParams.get('status') || 'All');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [noteTask, setNoteTask] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Task',
    priority: 'Medium',
    due_date: '',
    project_id: '',
    assigned_user_id: ''
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
      return res.data.data;
    },
    enabled: !!token
  });

  const { data: projectData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data.projects;
    },
    enabled: !!token
  });

  const { data: userData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data.users;
    },
    enabled: !!token
  });

  const {
    data: notes = [],
    isLoading: notesLoading
  } = useQuery({
    queryKey: ['notes', noteTask?.id],
    queryFn: async () => {
      const res = await api.get(`/notes/task/${noteTask.id}`);
      return res.data.data;
    },
    enabled: !!noteTask
  });

  const createMutation = useMutation({
    mutationFn: async (newTask) => {
      await api.post('/tasks', newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã khởi tạo công việc mới!');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedTask) => {
      await api.put(`/tasks/${updatedTask.id}`, updatedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã cập nhật công việc!');
      closeModal();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/tasks/${id}/status`, { status });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tasks']);
      toast.success(`Đã chuyển sang: ${STATUS_MAP[variables.status] || variables.status}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã xóa công việc thành công!');
    },
    onError: (err) => {
      toast.error('Xóa công việc thất bại: ' + (err.response?.data?.message || 'Lỗi hệ thống'));
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      await api.post('/notes', { content, taskId: noteTask.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', noteTask?.id]);
      setNoteText('');
      toast.success('Đã thêm ghi chú mới!');
    }
  });

  const openModal = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        type: task.type,
        priority: task.priority || 'Medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        project_id: task.project_id || '',
        assigned_user_id: task.assigned_user_id || ''
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        type: 'Task',
        priority: 'Medium',
        due_date: '',
        project_id: '',
        assigned_user_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openModal();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const filteredTasks = tasks?.filter((task) => {
    const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project_name?.toLowerCase().includes(searchTerm.toLowerCase());

    let statusMatch = statusFilter === 'All' || task.status === statusFilter;
    if (statusFilter === 'overdue') {
      const isOverdue = task.status !== 'Done' && task.due_date && new Date(task.due_date) < new Date();
      statusMatch = isOverdue;
    }

    const priorityMatch = priorityFilter === 'All' || task.priority === priorityFilter;
    const projectMatch = !projectFilter || String(task.project_id) === projectFilter;

    return searchMatch && statusMatch && projectMatch && priorityMatch;
  });

  const columns = ['Pending', 'In Progress', 'Done'];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Call': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Email': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Meeting': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Development': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Design': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Documentation': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Planning': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      case 'Low': return 'bg-slate-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      {/* Modal Công việc */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase italic">{selectedTask ? 'Sửa công việc' : 'Nhiệm vụ mới'}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cấu trình quy trình thực thi dự án</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-full transition-transform hover:rotate-90"><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedTask) updateMutation.mutate({ id: selectedTask.id, ...formData });
              else createMutation.mutate(formData);
            }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tiêu đề công việc <span className="text-rose-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all" placeholder="Ví dụ: Gửi hợp đồng cho khách hàng A" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Loại hình</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all cursor-pointer">
                    {Object.keys(TYPE_MAP).map(t => <option key={t} value={t}>{TYPE_MAP[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ưu tiên</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all cursor-pointer">
                    {Object.keys(PRIORITY_MAP).map(p => <option key={p} value={p}>{PRIORITY_MAP[p]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ngày hết hạn</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dự án</label>
                  <select value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all cursor-pointer">
                    <option value="">Không thuộc dự án</option>
                    {projectData?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Người phụ trách</label>
                <select value={formData.assigned_user_id} onChange={e => setFormData({ ...formData, assigned_user_id: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-2xl p-4 focus:bg-white outline-none font-bold text-slate-900 transition-all cursor-pointer">
                  <option value="">Chưa phân bổ</option>
                  {userData?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-slate-900 transition-all">
                  {selectedTask ? 'Lưu thay đổi' : 'Tạo nhiệm vụ ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header trang */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Quản lý nhiệm vụ</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theo dõi tiến độ và hiệu suất thực thi của đội ngũ</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-slate-900 transition shadow-xl shadow-indigo-100 font-black text-xs uppercase tracking-widest"
        >
          <Plus className="w-5 h-5 mr-3" /> Nhiệm vụ mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-2 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm focus-within:border-indigo-100 transition-all">
          <Search className="w-5 h-5 text-slate-300 ml-2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, dự án, người làm..."
            className="w-full text-xs font-bold uppercase outline-none bg-transparent placeholder:text-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <select
            className="w-full bg-transparent p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Tất cả dự án</option>
            {projectData?.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <select
            className="w-full bg-transparent p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">Độ ưu tiên</option>
            {Object.keys(PRIORITY_MAP).map(p => <option key={p} value={p}>{PRIORITY_MAP[p]}</option>)}
          </select>
        </div>
      </div>

      {tasksLoading ? (
        <div className="p-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] animate-pulse">Đang nạp bảng công việc...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-8">
            {columns.map(status => (
              <div key={status} className="flex flex-col bg-slate-50/50 border-2 border-slate-100/50 rounded-[2.5rem] min-h-[600px] shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${status === 'Done' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                    {STATUS_MAP[status]}
                  </h3>
                  <span className="bg-white text-slate-400 text-[10px] px-4 py-1.5 rounded-full font-black border border-slate-100 shadow-sm">
                    {filteredTasks?.filter(t => t.status === status).length || 0}
                  </span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-5 space-y-5 transition-all duration-300 ${snapshot.isDraggingOver ? 'bg-indigo-50/30' : ''}`}
                    >
                      {filteredTasks?.filter(t => t.status === status).map((task, index) => {
                        const isOverdue = task.status !== 'Done' && task.due_date && new Date(task.due_date) < new Date();

                        return (
                          <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-6 rounded-[2rem] border-2 shadow-sm group transition-all duration-200 ${snapshot.isDragging ? 'ring-8 ring-indigo-100 shadow-2xl rotate-2 z-50 animate-pulse' : isOverdue ? 'border-rose-100 hover:border-rose-300' : 'border-transparent hover:border-indigo-100 hover:shadow-xl'} relative cursor-grab active:cursor-grabbing hover:scale-[1.02]`}
                              >
                                <div className={`absolute top-0 right-0 w-3 h-3 rounded-bl-2xl rounded-tr-[1.8rem] ${getPriorityBadge(task.priority)}`}></div>

                                {isOverdue && (
                                  <div className="mb-4 flex items-center gap-2 py-1.5 px-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-wider w-fit">
                                    <Clock className="w-3.5 h-3.5" /> Quá hạn
                                  </div>
                                )}

                                <p className={`font-black text-[15px] leading-tight mb-5 uppercase tracking-tight ${status === 'Done' ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{task.title}</p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                  <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${getTypeColor(task.type)}`}>
                                    <Tag className="w-3 h-3" /> {TYPE_MAP[task.type] || task.type}
                                  </span>
                                  {task.due_date && (
                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black transition-colors ${isOverdue ? 'text-rose-600 bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                      <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                  <div className="flex items-center gap-3 overflow-hidden pr-2">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-black text-indigo-600 shrink-0 italic">
                                      {(task.assigned_user_name || 'Q')[0]}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase truncate tracking-widest" title={task.assigned_user_name || 'Chưa phân bổ'}>
                                      {task.assigned_user_name?.split(' ')[0] || 'Admin'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-y-0">
                                    <button onClick={() => openModal(task)} className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110" title="Sửa">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => {
                                      if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
                                        deleteMutation.mutate(task.id);
                                      }
                                    }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110" title="Xóa">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setNoteTask(task)} className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-all hover:scale-110" title="Ghi chú">
                                      <MessageSquare className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {filteredTasks?.filter(t => t.status === status).length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-300 space-y-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                          <Plus className="w-8 h-8 opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sẵn sàng nhận việc</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Side Panel Ghi chú */}
      {noteTask && (
        <div className="fixed right-0 top-0 bottom-0 w-[24rem] bg-white border-l border-slate-100 shadow-2xl z-40 flex flex-col transform transition-all duration-500 ease-out animate-in slide-in-from-right">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase">Nhật ký nhiệm vụ</h2>
              <p className="text-[10px] text-indigo-600 font-black truncate max-w-[200px] mt-1 uppercase tracking-widest">{noteTask.title}</p>
            </div>
            <button onClick={() => setNoteTask(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-300 transition-transform hover:rotate-90"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 scrollbar-hide">
            {notesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Đang nạp bình luận...</p>
              </div>
            ) : notes?.length ? (
              notes.map((note) => (
                <div key={note.id} className="bg-white border border-slate-100 rounded-[1.5rem] p-5 shadow-sm hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-slate-700 leading-relaxed font-bold">{note.content}</p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-100 flex items-center justify-center text-[10px] font-black text-white italic">{(note.author_name || 'Q')[0]}</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-900">
                        {note.author_name || 'Admin'}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(note.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-30">
                <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                  <MessageSquare className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Chưa có bình luận</p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Hãy là người đầu tiên để lại ý kiến.</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-8 border-t border-slate-50 bg-white shadow-inner">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!noteText.trim()) return;
              addNoteMutation.mutate(noteText);
            }}>
              <textarea
                className="w-full border-2 border-slate-50 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:border-indigo-100 bg-slate-50 focus:bg-white transition-all mb-6 resize-none h-32"
                placeholder="Nhập nội dung phản hồi hoặc ghi chú mới..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" disabled={addNoteMutation.isPending} className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-slate-900 transition shadow-2xl shadow-indigo-100 disabled:opacity-50">
                {addNoteMutation.isPending ? 'Đang gửi...' : 'Gửi ghi chú ngay'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
