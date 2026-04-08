import { Link } from 'react-router-dom';
import { CheckCircle, Settings, Users, Briefcase, BarChart3, Zap } from 'lucide-react';

const apps = [
  { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-12 h-12" />, color: 'bg-blue-600', path: '/dashboard', description: 'Overview & analytics' },
  { id: 'projects', name: 'Projects', icon: <Briefcase className="w-12 h-12" />, color: 'bg-purple-600', path: '/projects', description: 'Manage projects' },
  { id: 'tasks', name: 'Tasks', icon: <CheckCircle className="w-12 h-12" />, color: 'bg-green-600', path: '/tasks', description: 'Track tasks' },
  { id: 'team', name: 'Team', icon: <Users className="w-12 h-12" />, color: 'bg-orange-600', path: '/settings', description: 'Team members' },
  { id: 'settings', name: 'Settings', icon: <Settings className="w-12 h-12" />, color: 'bg-gray-600', path: '/settings', description: 'Preferences' },
];

const features = [
  { title: 'Project Management', description: 'Organize and track your projects easily' },
  { title: 'Task Tracking', description: 'Assign and monitor tasks in real-time' },
  { title: 'Team Collaboration', description: 'Work together with your team seamlessly' },
  { title: 'Real-time Updates', description: 'Stay synchronized with live notifications' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8" />
            <h1 className="text-5xl font-bold">Welcome to ProjectFlow</h1>
          </div>
          <p className="text-xl opacity-90 mb-2">Modern project management for collaborative teams</p>
          <p className="text-lg opacity-80">Get started by selecting an option below</p>
        </div>
      </div>

      {/* Main Apps */}
      <div className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {apps.map((app) => (
            <Link key={app.id} to={app.path} className="group">
              <div className={`${app.color} text-white rounded-xl p-6 flex flex-col items-center text-center h-full transform transition hover:scale-105 hover:shadow-lg active:scale-95`}>
                <div className="mb-3 opacity-90 group-hover:opacity-100 transition">
                  {app.icon}
                </div>
                <h3 className="font-semibold text-lg">{app.name}</h3>
                <p className="text-sm opacity-80 mt-1">{app.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg mb-2 text-blue-600">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-400 text-center py-8 mt-20">
        <p>ProjectFlow v1.0 • Built with React, Node.js & PostgreSQL</p>
        <p className="text-sm mt-2">Perfect for fullstack engineer portfolios</p>
      </div>
    </div>
  );
}
