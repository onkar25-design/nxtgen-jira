import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import Papa from 'papaparse';
import { supabase } from '../../../supabaseClient';
import { Download } from 'lucide-react';

const Dashboard = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedMember, setSelectedMember] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && userProfile) {
          setCurrentUser({
            ...userProfile,
            fullName: `${userProfile.first_name} ${userProfile.last_name}`.trim()
          });
        }
      }
    };

    getCurrentUser();
  }, []);

  // Fetch tasks, projects, and team members
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks with project information
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(`
            *,
            projects:project_id (
              name,
              id
            )
          `);

        if (tasksError) throw tasksError;

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('is_archived', false);

        if (projectsError) throw projectsError;

        // Fetch team members (users)
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;

        // Transform the data
        const transformedTasks = tasksData.map(task => ({
          id: task.id,
          name: task.title || task.content,
          status: task.stage || 'requirement',
          dueDate: task.due_date,
          assignee: task.assigned_to || [],
          project: task.projects?.name || 'No Project',
          project_id: task.project_id
        }));

        // Set the state
        setTasks(transformedTasks);
        setProjects(projectsData);
        setTeamMembers(usersData.map(user => 
          `${user.first_name} ${user.last_name}`.trim()
        ));
        setIsLoading(false);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tasks based on selection
  const filteredTasks = tasks.filter(task => 
    (selectedProject === "All" || task.project === selectedProject) &&
    (selectedMember === "All" || (Array.isArray(task.assignee) && task.assignee.includes(selectedMember)))
  );

  // Calculate metrics
  const completedTasks = filteredTasks.filter(task => task.status === "completed").length;
  const totalTasks = filteredTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const taskStatusData = [
    { name: "Completed", value: completedTasks },
    { 
      name: "In Progress", 
      value: filteredTasks.filter(task => 
        ['design', 'coding', 'review', 'testing', 'documentation'].includes(task.status)
      ).length 
    },
    { 
      name: "To Do", 
      value: filteredTasks.filter(task => task.status === "requirement").length 
    },
  ];

  const COLORS = ["#22C55E", "#F59E0B", "#3B82F6"]; // Green, Orange, Blue for Completed, In Progress, To Do

  // 2. Simple Deadline Tracking
  const today = new Date();
  const upcomingTasks = filteredTasks.filter(task => new Date(task.dueDate) > today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Update the workload calculation
  const calculateMemberWorkload = (member) => {
    const memberTasks = filteredTasks.filter(task => 
      Array.isArray(task.assignee) && task.assignee.includes(member)
    );
    
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'completed').length
    };
  };

  // Calculate workload for display
  const memberWorkload = teamMembers
    .filter(member => selectedMember === "All" || member === selectedMember)
    .map(member => ({
      name: member,
      ...calculateMemberWorkload(member)
    }));

  // 4. Export to CSV
  const exportToCSV = () => {
    const csv = Papa.unparse(filteredTasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'tasks.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper function to get simplified status
  const getSimplifiedStatus = (status) => {
    if (status === 'completed') return 'Completed';
    if (status === 'requirement') return 'To Do';
    return 'In Progress'; // for design, coding, review, testing, documentation
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    const simplifiedStatus = getSimplifiedStatus(status);
    switch (simplifiedStatus) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'To Do':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading dashboard: {error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8 mt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your project progress</p>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full md:w-auto p-2 border border-gray-200 rounded-lg bg-white text-gray-900 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        >
          <option value="All">All Projects</option>
          {projects.map(project => (
            <option key={project.id} value={project.name}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Task Completion</h2>
            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
              {completionPercentage}%
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-3">{completedTasks} / {totalTasks}</div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines - Hidden in mobile view */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-8 hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            <p className="text-gray-500 text-sm mt-1">Tasks due in the next 7 days</p>
          </div>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Task</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">{task.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                      {getSimplifiedStatus(task.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[100px] truncate">{task.project}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Member Workload */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Team Member Workload</h2>
            <p className="text-gray-500 text-sm mt-1">Task distribution across team members</p>
          </div>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="mt-4 md:mt-0 w-full md:w-auto p-2 border border-gray-200 rounded-lg bg-white text-gray-900 shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <option value="All">All Members</option>
            {teamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {memberWorkload.map(member => (
            <div key={member.name} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-500">
                  {Math.round(member.total > 0 ? (member.completed / member.total) * 100 : 0)}%
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-3">
                {member.completed} / {member.total}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${member.total > 0 ? (member.completed / member.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Task</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks
                .filter(task => 
                  selectedMember === "All" || 
                  (Array.isArray(task.assignee) && task.assignee.includes(selectedMember))
                )
                .map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{task.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                        {getSimplifiedStatus(task.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{task.project}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section - Updated with icon button */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <p className="text-gray-500 text-sm mt-1">Download task data as CSV</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center gap-2"
            title="Export to CSV"
          >
            <Download className="h-5 w-5" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

