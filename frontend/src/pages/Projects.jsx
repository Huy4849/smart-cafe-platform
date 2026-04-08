import { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });

    useEffect(() => {
        // Fetch projects from API
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const data = await response.json();
            setProjects(data.projects || []);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            const data = await response.json();
            setProjects([...projects, data.project]);
            setNewProject({ name: '', description: '' });
            setShowCreateForm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteProject = async (id) => {
        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading projects...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold flex items-center gap-2">
                    <Folder className="w-8 h-8" />
                    Projects
                </h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
                    <input
                        type="text"
                        placeholder="Project name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    <textarea
                        placeholder="Description (optional)"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                        rows="3"
                    ></textarea>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateProject}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">No projects yet. Create your first project!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                            <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                            <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                <Clock className="w-4 h-4" />
                                {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-200 flex items-center justify-center gap-1">
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200 flex items-center justify-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

Projects.propTypes = {};

export default Projects;
