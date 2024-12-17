// TasksPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, PlusCircle, Clock, CheckCircle, ListTodo, AlertCircle, Edit2, Trash2, Eye } from 'lucide-react';
import './tasks_page_styles.css';
import { supabase } from '../../../supabaseClient';
import EditTaskForm from '../task management/EditTaskForm';
import TaskDetailsModal from '../task management/TaskDetailsModal';
import NewTaskForm from './NewTaskForm';

const getStatusDisplay = (status) => {
  const statusMap = {
    'requirement': 'To Do',
    'design': 'In Progress',
    'coding': 'In Progress',
    'review': 'In Progress',
    'testing': 'In Progress',
    'documentation': 'In Progress',
    'completed': 'Completed'
  };

  const statusColors = {
    'requirement': 'bg-[#4285F4] text-white',      // Blue for To Do
    'design': 'bg-[#FF9800] text-white',          // Orange for In Progress
    'coding': 'bg-[#FF9800] text-white',
    'review': 'bg-[#FF9800] text-white',
    'testing': 'bg-[#FF9800] text-white',
    'documentation': 'bg-[#FF9800] text-white',
    'completed': 'bg-[#34A853] text-white'
  };

  return {
    display: statusMap[status] || status,
    color: statusColors[status] || 'bg-gray-500 text-white'
  };
};

const MobileTaskCard = ({ task, onViewDetails, onEditTask, onDeleteTask }) => {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <p className="task-card-project">{task.project}</p>
      </div>
      
      <div className="task-card-content">
        <div className="task-card-row">
          <span className="task-card-label">Status</span>
          <span className={`status-badge ${getStatusDisplay(task.status).color}`}>
            {task.status === 'requirement' && <Clock className="h-3 w-3 mr-1" />}
            {['design', 'coding', 'review', 'testing'].includes(task.status) && 
              <AlertCircle className="h-3 w-3 mr-1" />}
            {['documentation', 'completed'].includes(task.status) && 
              <CheckCircle className="h-3 w-3 mr-1" />}
            {getStatusDisplay(task.status).display}
          </span>
        </div>

        <div className="task-card-row">
          <span className="task-card-label">Priority</span>
          <span className={`priority-badge ${task.priority}`}>
            {task.priority}
          </span>
        </div>

        <div className="task-card-row">
          <span className="task-card-label">Deadline</span>
          <span className="text-gray-600">{task.deadline}</span>
        </div>
      </div>

      <div className="mobile-actions">
        <button 
          className="mobile-action-button"
          onClick={() => onViewDetails(task)}
        >
          <Eye className="h-5 w-5" />
        </button>
        <button 
          className="mobile-action-button"
          onClick={() => onEditTask(task)}
        >
          <Edit2 className="h-5 w-5 text-green-600" />
        </button>
        <button 
          className="mobile-action-button"
          onClick={() => onDeleteTask(task)}
        >
          <Trash2 className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </div>
  );
};

const TasksPage = () => {
  // Group all useState hooks together at the top
  const [tasks, setTasks] = useState([]);
  const [openActionId, setOpenActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectId] = useState('default-project-id'); // Move this up with other state declarations
  const [viewingTask, setViewingTask] = useState(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // useEffect hook after all useState hooks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            projects:project_id (
              name
            )
          `);

        if (error) {
          throw error;
        }

        const transformedTasks = data.map(task => ({
          id: task.id,
          title: task.title || task.content,
          project: task.projects?.name || 'No Project', // Get project name from joined data
          deadline: task.due_date,
          status: task.stage || 'requirement',
          priority: task.priority || 'medium',
          assignee: task.assigned_to
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Add filter function
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Search query - add null checks and handle undefined values
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          (task.title?.toLowerCase() || '').includes(searchLower) ||
          (task.project?.toLowerCase() || '').includes(searchLower) ||
          (task.status?.toLowerCase() || '').includes(searchLower)
        );
      }

      return true;
    });
  };

  // Add handleViewDetails function if not already defined
  const handleViewDetails = async (task) => {
    try {
      // Fetch complete task details from supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task.id)
        .single();

      if (error) throw error;

      const formattedTask = {
        id: data.id,
        content: data.title || data.content,
        description: data.description || '',
        priority: data.priority,
        dueDate: data.due_date,
        assigned_to: data.assigned_to || [],
        file_links: data.file_links || [],
        stage: data.stage || 'requirement',
        status: data.status,
        rejection_comment: data.rejection_comment,
        completed_at: data.completed_at,
        approved_by: data.approved_by,
        stage_approvals: data.stage_approvals
      };
      
      setViewingTask(formattedTask);
      setOpenActionId(null);
    } catch (error) {
      console.error('Error fetching task details:', error);
      alert('Error fetching task details');
    }
  };

  // Update handleEditTask
  const handleEditTask = async (task) => {
    try {
      // Fetch complete task details from supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task.id)
        .single();

      if (error) throw error;

      const formattedTask = {
        id: data.id,
        content: data.title || data.content,
        description: data.description || '',
        priority: data.priority,
        dueDate: data.due_date,
        assigned_to: data.assigned_to || [],
        fileLinks: data.file_links || [],
        stage: data.stage || 'requirement'
      };
      setEditingTask(formattedTask);
      setOpenActionId(null);
    } catch (error) {
      console.error('Error fetching task details:', error);
      alert('Error fetching task details');
    }
  };

  // Update handleDeleteTask
  const handleDeleteTask = async (task) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', task.id);

        if (error) throw error;

        // Update local state after successful deletion
        setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
      }
    }
  };

  // Add handler for task creation
  const handleTaskCreated = (newTask) => {
    const transformedTask = {
      id: newTask.id,
      title: newTask.title,
      project: newTask.project_name,
      deadline: newTask.due_date,
      status: newTask.stage || 'requirement',
      priority: newTask.priority,
      assignee: newTask.assigned_to
    };
    setTasks(prevTasks => [...prevTasks, transformedTask]);
  };

  // Add loading state
  if (isLoading) {
    return (
      <div className="tasks-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  // Add error state
  if (error) {
    return (
      <div className="tasks-container">
        <div className="text-center text-red-600">
          <p>Error loading tasks: {error}</p>
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

  // Update the statistics calculations to use filtered tasks
  const filteredTasks = getFilteredTasks();
  const totalTasks = filteredTasks.length;
  const dueSoonTasks = filteredTasks.filter(task => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  // Update status counts based on stages
  const todoTasks = filteredTasks.filter(task => task.status === 'requirement').length;
  const inProgressTasks = filteredTasks.filter(task => 
    ['design', 'coding', 'review', 'testing', 'documentation'].includes(task.status)
  ).length;
  const completedTasks = filteredTasks.filter(task => 
    task.status === 'completed'
  ).length;

  // Update the status display in the table
  const getStatusDisplay = (status) => {
    const statusMap = {
      'requirement': 'To Do',
      'design': 'In Progress',
      'coding': 'In Progress',
      'review': 'In Progress',
      'testing': 'In Progress',
      'documentation': 'In Progress',
      'completed': 'Completed'
    };

    const statusColors = {
      'requirement': 'bg-[#4285F4] text-white',      // Blue for To Do
      'design': 'bg-[#FF9800] text-white',          // Orange for In Progress
      'coding': 'bg-[#FF9800] text-white',
      'review': 'bg-[#FF9800] text-white',
      'testing': 'bg-[#FF9800] text-white',
      'documentation': 'bg-[#FF9800] text-white',
      'completed': 'bg-[#34A853] text-white'
    };

    return {
      display: statusMap[status] || status,
      color: statusColors[status] || 'bg-gray-500 text-white'
    };
  };

  // Update the status colors in your component
  const statusBadgeColors = {
    'requirement': 'bg-blue-100 text-blue-800',  // To Do
    'design': 'bg-yellow-100 text-yellow-800',   // In Progress
    'coding': 'bg-yellow-100 text-yellow-800',   // In Progress
    'review': 'bg-yellow-100 text-yellow-800',   // In Progress
    'testing': 'bg-yellow-100 text-yellow-800',  // In Progress
    'documentation': 'bg-green-100 text-green-800', // Completed
    'completed': 'bg-green-100 text-green-800'      // Completed
  };

  return (
    <div className="tasks-container">
      {/* Header Section */}
      <div className="tasks-header">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-blue-700">Tasks</h1>
          <p className="text-gray-500">Manage and track your project tasks</p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="icon-button"
          title="Create New Task"
        >
          <PlusCircle className="h-6 w-6 text-blue-600 hover:text-blue-700" />
        </button>
      </div>

      {/* Content Area with Margin to Prevent Overlap */}
      <div className="content-area mt-6">
        {/* Stats and Statistics Section */}
        <div className="stats-section">
          <div className="stats-cards-column">
            <div className="stat-card">
              <div className="stat-header">
                <h3 className="text-lg font-medium text-gray-600">Total Tasks</h3>
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold mt-2 text-gray-900">{totalTasks}</p>
              <p className="text-sm text-gray-500 mt-1">Overall tasks</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3 className="text-lg font-medium text-gray-600">Due Soon</h3>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold mt-2 text-gray-900">{dueSoonTasks}</p>
              <p className="text-sm text-gray-500 mt-1">Due within 7 days</p>
            </div>
          </div>

          <div className="statistics-graph">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="progress-stats">
              <div className="stat-row">
                <div className="stat-label">To Do</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill todo" 
                    style={{width: `${(todoTasks / totalTasks) * 100}%`}}
                  ></div>
                  <span className="progress-text">{todoTasks} tasks</span>
                </div>
              </div>
              
              <div className="stat-row">
                <div className="stat-label">In Progress</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill in-progress" 
                    style={{width: `${(inProgressTasks / totalTasks) * 100}%`}}
                  ></div>
                  <span className="progress-text">{inProgressTasks} tasks</span>
                </div>
              </div>
              
              <div className="stat-row">
                <div className="stat-label">Completed</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill completed" 
                    style={{width: `${(completedTasks / totalTasks) * 100}%`}}
                  ></div>
                  <span className="progress-text">{completedTasks} tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Overview Section */}
        <div className="task-overview">
          <div className="overview-header">
            <div>
              <h2 className="text-xl font-bold mb-1 text-blue-700">Task Overview</h2>
              <p className="text-gray-500 text-sm">A list of all tasks and their current status</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="search-filter">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <Filter className="h-4 w-4" />
              <select 
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="requirement">Requirement</option>
                <option value="design">Design</option>
                <option value="coding">Coding</option>
                <option value="review">Review</option>
                <option value="testing">Testing</option>
                <option value="documentation">Documentation</option>
                <option value="completed">Completed</option>
              </select>
            </button>
            <button className="filter-btn">
              <select 
                className="bg-transparent border-none outline-none"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </button>
          </div>

          {/* Responsive table/cards container */}
          <div className="table-container">
            {/* Desktop table view */}
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-info">
                        <p className="task-title">{task.title}</p>
                        <p className="task-project">{task.project}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusDisplay(task.status).color}`}>
                        {task.status === 'requirement' && <Clock className="h-4 w-4 mr-2" />}
                        {['design', 'coding', 'review', 'testing'].includes(task.status) && 
                          <AlertCircle className="h-4 w-4 mr-2" />}
                        {['documentation', 'completed'].includes(task.status) && 
                          <CheckCircle className="h-4 w-4 mr-2" />}
                        {getStatusDisplay(task.status).display}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.deadline}</td>
                    <td className="relative">
                      <button 
                        className="icon-button"
                        onClick={() => setOpenActionId(openActionId === task.id ? null : task.id)}
                        title="Actions"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {openActionId === task.id && (
                        <>
                          <div 
                            className="fixed inset-0" 
                            onClick={() => setOpenActionId(null)}
                          ></div>
                          <div className="actions-dropdown">
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                handleViewDetails(task);
                                setOpenActionId(null);
                              }}
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                              <span>View Details</span>
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                handleEditTask(task);
                                setOpenActionId(null);
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-green-500" />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => {
                                handleDeleteTask(task);
                                setOpenActionId(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards view */}
            <div className="mobile-task-cards hidden md:hidden">
              {getFilteredTasks().map(task => (
                <MobileTaskCard
                  key={task.id}
                  task={task}
                  onViewDetails={handleViewDetails}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add these modal components before the closing div */}
      {editingTask && (
        <EditTaskForm 
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
      {viewingTask && (
        <TaskDetailsModal 
          task={viewingTask}
          onClose={() => setViewingTask(null)}
        />
      )}

      {/* Add NewTaskForm modal */}
      {showNewTaskForm && (
        <NewTaskForm
          onClose={() => setShowNewTaskForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default TasksPage;