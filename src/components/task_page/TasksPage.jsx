// TasksPage.jsx
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, PlusCircle, Clock, CheckCircle, ListTodo, AlertCircle, Edit2, Trash2, Eye } from 'lucide-react';
import './tasks_page_styles.css';

const TasksPage = () => {
  const tasks = [
    { 
      id: 1, 
      title: 'Design System Implementation', 
      project: 'NxtGen CRM',
      deadline: '2024-12-20', 
      status: 'in-progress',
      priority: 'high',
      assignee: 'AT'
    },
    { 
      id: 2, 
      title: 'User Authentication Flow', 
      project: 'NxtGen CRM',
      deadline: '2024-11-15', 
      status: 'todo',
      priority: 'medium',
      assignee: 'JS'
    },
    { 
      id: 3, 
      title: 'API Integration', 
      project: 'NxtGen CRM',
      deadline: '2024-11-30', 
      status: 'completed',
      priority: 'high',
      assignee: 'MK'
    },
    { 
      id: 4, 
      title: 'UI Testing', 
      project: 'NxtGen CRM',
      deadline: '2024-12-05', 
      status: 'in-progress',
      priority: 'low',
      assignee: 'AT'
    },
    { 
      id: 5, 
      title: 'Deployment Preparation', 
      project: 'NxtGen CRM',
      deadline: '2024-12-10', 
      status: 'todo',
      priority: 'high',
      assignee: 'JS'
    },
  ];

  const [openActionId, setOpenActionId] = useState(null);

  const handleEditTask = (task) => {
    // Implement edit functionality
    console.log('Edit task:', task);
  };

  const handleDeleteTask = (task) => {
    // Implement delete functionality
    console.log('Delete task:', task);
  };

  const handleViewDetails = (task) => {
    // Implement view details functionality
    console.log('View details:', task);
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
          className="icon-button"
          onClick={() => setShowForm(true)}
          title="Add New Task"
        >
          <PlusCircle className="h-6 w-6 add-task-icon" />
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
              <p className="text-3xl font-bold mt-2 text-gray-900">5</p>
              <p className="text-sm text-gray-500 mt-1">Overall tasks</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3 className="text-lg font-medium text-gray-600">Due Soon</h3>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold mt-2 text-gray-900">3</p>
              <p className="text-sm text-gray-500 mt-1">Due within 7 days</p>
            </div>
          </div>

          <div className="statistics-graph">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="progress-stats">
              <div className="stat-row">
                <div className="stat-label">To Do</div>
                <div className="progress-bar">
                  <div className="progress-fill todo" style={{width: '40%'}}></div>
                  <span className="progress-text">2 tasks</span>
                </div>
              </div>
              
              <div className="stat-row">
                <div className="stat-label">In Progress</div>
                <div className="progress-bar">
                  <div className="progress-fill in-progress" style={{width: '20%'}}></div>
                  <span className="progress-text">1 task</span>
                </div>
              </div>
              
              <div className="stat-row">
                <div className="stat-label">Completed</div>
                <div className="progress-bar">
                  <div className="progress-fill completed" style={{width: '40%'}}></div>
                  <span className="progress-text">2 tasks</span>
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
              />
            </div>
            <button className="filter-btn">
              <Filter className="h-4 w-4" />
              <select className="bg-transparent border-none outline-none">
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </button>
            <button className="filter-btn">
              <select className="bg-transparent border-none outline-none">
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </button>
          </div>

          {/* Tasks Table */}
          <div className="table-container">
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
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-info">
                        <p className="task-title">{task.title}</p>
                        <p className="task-project">{task.project}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${task.status}`}>
                        {task.status === 'todo' && <Clock className="h-4 w-4" />}
                        {task.status === 'in-progress' && <AlertCircle className="h-4 w-4" />}
                        {task.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                        {task.status === 'todo' && 'To Do'}
                        {task.status === 'in-progress' && 'In Progress'}
                        {task.status === 'completed' && 'Completed'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;