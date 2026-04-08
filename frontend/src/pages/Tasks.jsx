import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, CheckSquare, Plus, X, Edit2, Trash2, Search } from 'lucide-react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

export default function Tasks() {
  const token = useStore((state) => state.token);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ title: '', type: 'Call', dueDate: '' });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newTask) => {
      await axios.post('/api/tasks', newTask, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã thêm công việc mới vào lịch!');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedTask) => {
      const data = {
        title: updatedTask.title,
        type: updatedTask.type,
        due_date: updatedTask.dueDate || null
      };
      await axios.put(`/api/tasks/${updatedTask.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Đã cập nhật công việc thành công!');
      closeModal();
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await axios.patch(`/api/tasks/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    },
    onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['tasks']);
        toast.success(variables.status === 'Done' ? 'Khép lại công việc! Tuyệt vời.' : 'Đã mở lại công việc.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (window.confirm("Bạn có chắc muốn xoá công việc này?")) {
        await axios.delete(`/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['tasks']);
        toast.success('Đã dọn dẹp xong việc này!');
    }
  });

  const openModal = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({ 
        title: task.title, 
        type: task.type, 
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '' 
      });
    } else {
      setSelectedTask(null);
      setFormData({ title: '', type: 'Call', dueDate: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setFormData({ title: '', type: 'Call', dueDate: '' });
  };

  const filteredTasks = tasks?.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.lead_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Lịch làm việc (Tasks)</h1>
        <button 
          onClick={() => openModal()}
          className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition shadow-sm font-medium"
        >
            <Plus className="w-4 h-4 mr-2" /> Tạo Việc
        </button>
      </div>

      <div className="flex bg-white p-2 border rounded shadow-sm items-center focus-within:ring-2 ring-primary/20 transition">
        <Search className="w-5 h-5 text-gray-400 mr-2 ml-2" />
        <input 
          type="text" 
          placeholder="Tìm kiếm công việc..." 
          className="w-full text-sm outline-none bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded border bg-white shadow-sm overflow-hidden min-h-[400px]">
        <ul className="divide-y divide-gray-100">
            {isLoading ? (
                <li className="p-6 text-center text-gray-500">Đang tải danh sách công việc...</li>
            ) : filteredTasks?.map((task) => (
                <li key={task.id} className="p-4 hover:bg-gray-50 flex items-start gap-4 transition group">
                    <div className="mt-1">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" 
                            checked={task.status === 'Done'} 
                            onChange={(e) => toggleStatusMutation.mutate({ id: task.id, status: e.target.checked ? 'Done' : 'Pending' })}
                        />
                    </div>
                    <div className="flex-1">
                        <p className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500 font-medium">
                           <span className="flex items-center"><CheckSquare className="w-3.5 h-3.5 mr-1" /> Phân loại: {task.type}</span>
                           <span className="flex items-center text-red-500"><Calendar className="w-3.5 h-3.5 mr-1" /> Hạn chót: {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'Không có'}</span>
                           {task.lead_name && <span>👤 Bám sát: {task.lead_name}</span>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openModal(task)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Sửa">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(task.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Xoá">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </li>
            ))}
            {!isLoading && filteredTasks?.length === 0 && (
                <li className="p-6 text-center text-gray-500">Giỏi quá! Danh sách đã được dọn sạch hoàn toàn hoặc không có kết quả tìm kiếm.</li>
            )}
        </ul>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center animate-in fade-in p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-lg">{selectedTask ? 'Cập Nhật Công Việc' : 'Phân Việc Mới'}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"><X className="w-5 h-5"/></button>
                </div>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (selectedTask) {
                        updateMutation.mutate({ ...formData, id: selectedTask.id });
                    } else {
                        createMutation.mutate(formData); 
                    }
                  }} 
                  className="p-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diễn giải công việc *</label>
                        <input required type="text" className="w-full border rounded p-2 text-sm outline-primary" 
                               value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                               placeholder="VD: Gọi điện offer anh Hiếu" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
                            <select className="w-full border rounded p-2 text-sm outline-primary" 
                                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option>Call</option>
                                <option>Email</option>
                                <option>Meeting</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn</label>
                            <input type="date" className="w-full border rounded p-2 text-sm outline-primary" 
                                   value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-6 border-t flex justify-end gap-3 mt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition">Huỷ bỏ</button>
                        <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition shadow-sm">
                            {selectedTask ? 'Lưu Thay Đổi' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
