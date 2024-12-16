"use client"

import { useState, useCallback, useEffect } from 'react'
import ReactFlow, { 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { FiCheckCircle, FiClock, FiList, FiPlusCircle, FiChevronDown, FiChevronUp, FiEye, FiTrash, FiSettings, FiFilter, FiSearch, FiLayers, FiCheckSquare, FiFlag } from 'react-icons/fi'
import CreateNewTaskForm from './CreateNewTaskForm';
import TaskDetailsModal from './TaskDetailsModal';
import AdminActionModal from './AdminActionModal';
import { supabase } from '../../../supabaseClient'; // Import the Supabase client

// Initial nodes for the flow chart
const initialNodes = [
  {
    id: 'requirement',
    type: 'default',
    data: { label: 'Requirement Submission' },
    position: { x: 0, y: 50 },
    style: { background: '#E3F2FD', border: '1px solid #90CAF9', width: 200 }
  },
  {
    id: 'design',
    type: 'default',
    data: { label: 'Design' },
    position: { x: 250, y: 50 },
    style: { background: '#F3E5F5', border: '1px solid #CE93D8', width: 200 }
  },
  {
    id: 'coding',
    type: 'default',
    data: { label: 'Coding' },
    position: { x: 500, y: 50 },
    style: { background: '#E8F5E9', border: '1px solid #A5D6A7', width: 200 }
  },
  {
    id: 'review',
    type: 'default',
    data: { label: 'Code Review' },
    position: { x: 750, y: 50 },
    style: { background: '#FFF3E0', border: '1px solid #FFCC80', width: 200 }
  },
  {
    id: 'testing',
    type: 'default',
    data: { label: 'Testing' },
    position: { x: 1000, y: 50 },
    style: { background: '#FFEBEE', border: '1px solid #EF9A9A', width: 200 }
  },
  {
    id: 'documentation',
    type: 'default',
    data: { label: 'Documentation' },
    position: { x: 1250, y: 50 },
    style: { background: '#FCE4EC', border: '1px solid #F48FB1', width: 200 }
  },
  {
    id: 'completed',
    type: 'default',
    data: { label: 'Completed' },
    position: { x: 1500, y: 50 },
    style: { background: '#C8E6C9', border: '1px solid #81C784', width: 200 }
  }
]

// Initial edges connecting the nodes
const initialEdges = [
  { id: 'e1-2', source: 'requirement', target: 'design', animated: true },
  { id: 'e2-3', source: 'design', target: 'coding', animated: true },
  { id: 'e3-4', source: 'coding', target: 'review', animated: true },
  { id: 'e4-5', source: 'review', target: 'testing', animated: true },
  { id: 'e5-6', source: 'testing', target: 'documentation', animated: true },
  { id: 'e6-7', source: 'documentation', target: 'completed', animated: true },
]

// Add this helper function to get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#DC2626'; // red
    case 'medium':
      return '#F59E0B'; // amber
    case 'low':
      return '#10B981'; // green
    default:
      return '#6B7280'; // gray
  }
};

// Add this stage color mapping near the top of the file with other constants
const stageColors = {
  requirement: '#E3F2FD',
  design: '#F3E5F5',
  coding: '#E8F5E9',
  review: '#FFF3E0',
  testing: '#FFEBEE',
  documentation: '#FCE4EC',
  completed: '#C8E6C9'
};

export default function WorkflowBoard({ projectId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    completed: []
  })
  const [highlightedStage, setHighlightedStage] = useState(null)
  const [showForm, setShowForm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [adminActionTask, setAdminActionTask] = useState(null);
  const [stageFilter, setStageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null);

  // Add console.log to debug
  useEffect(() => {
    console.log('Current projectId:', projectId);
  }, [projectId]);

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        console.error('No project ID provided');
        return; // Exit early if projectId is null
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId); // Use projectId directly

      if (error) {
        console.error('Error fetching tasks:', error);
      } else {
        const fetchedTasks = {
          todo: data.filter(task => task.progress === 'todo').map(task => ({
            ...task,
            dueDate: task.due_date,
            assignedTo: task.assigned_to,
            fileLinks: task.file_links || [],
            color: stageColors[task.stage] || '#E3F2FD' // Set color based on stage
          })),
          inProgress: data.filter(task => task.progress === 'inProgress').map(task => ({
            ...task,
            dueDate: task.due_date,
            assignedTo: task.assigned_to,
            fileLinks: task.file_links || [],
            color: stageColors[task.stage] || '#E3F2FD' // Set color based on stage
          })),
          completed: data.filter(task => task.progress === 'completed').map(task => ({
            ...task,
            dueDate: task.due_date,
            assignedTo: task.assigned_to,
            fileLinks: task.file_links || [],
            color: stageColors[task.stage] || '#E3F2FD' // Set color based on stage
          })),
        };
        setTasks(fetchedTasks);
      }
    };

    fetchTasks();
  }, [projectId]); // Re-fetch tasks when projectId changes

  // Add this useEffect to fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch user role from your users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          setCurrentUser({ ...user, role: userData.role });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Handle node mouse enter
  const onNodeMouseEnter = useCallback((_, node) => {
    setHighlightedStage(node.id)
  }, [])

  // Handle node mouse leave
  const onNodeMouseLeave = useCallback(() => {
    setHighlightedStage(null)
  }, [])

  // Handle drag end
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or if dropped in same spot, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const sourceColumn = tasks[source.droppableId];
    const destColumn = tasks[destination.droppableId];
    const task = sourceColumn.find(t => t.id === draggableId);

    // Handle moving within the same column
    if (destination.droppableId === source.droppableId) {
      const newTasks = Array.from(sourceColumn);
      newTasks.splice(source.index, 1); // Remove from old position
      newTasks.splice(destination.index, 0, task); // Insert at new position

      setTasks({
        ...tasks,
        [source.droppableId]: newTasks,
      });
      return; // No need to update Supabase if we're just reordering in the same column
    }

    // Handle moving to a different column
    const newSourceColumn = sourceColumn.filter(t => t.id !== draggableId);
    const newDestColumn = [...destColumn];
    newDestColumn.splice(destination.index, 0, task);

    // Update local state
    setTasks({
      ...tasks,
      [source.droppableId]: newSourceColumn,
      [destination.droppableId]: newDestColumn,
    });

    // Update progress in Supabase only when moving between columns
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ progress: destination.droppableId })
        .eq('id', draggableId);

      if (error) {
        console.error('Error updating task progress:', error);
        // Revert the state if there's an error
        setTasks({
          ...tasks,
          [source.droppableId]: sourceColumn,
          [destination.droppableId]: destColumn,
        });
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
      // Revert the state if there's an error
      setTasks({
        ...tasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    }
  };

  // Task card component update
  const TaskCard = ({ task, index }) => {
    const isExpanded = expandedTaskId === task.id;
    const priorityColor = getPriorityColor(task.priority || 'medium');

    // Add stopPropagation to prevent drag interference
    const handleCardClick = (e) => {
      e.preventDefault(); // Prevent default touch events
      e.stopPropagation(); // Stop event from bubbling up
      setExpandedTaskId(isExpanded ? null : task.id);
    };

    const handleViewDetails = (e) => {
      e.stopPropagation(); // Prevent expanding/collapsing when clicking the view button
      setSelectedTask(task);
    };

    // Updated function to handle task deletion
    const handleDeleteTask = async (e) => {
      e.stopPropagation(); // Prevent expanding/collapsing
      if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        try {
          // Delete from Supabase first
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', task.id);

          if (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
            return;
          }

          // If Supabase deletion successful, update local state
          const updatedTasks = { ...tasks };
          for (const column in updatedTasks) {
            updatedTasks[column] = updatedTasks[column].filter(t => t.id !== task.id);
          }
          setTasks(updatedTasks);
        } catch (error) {
          console.error('Error deleting task:', error);
          alert('Failed to delete task. Please try again.');
        }
      }
    };

    const handleAdminAction = (e) => {
      e.stopPropagation();
      if (currentUser?.role !== 'admin') {
        // Show professional unauthorized message
        const modal = document.createElement('div');
        modal.innerHTML = `
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
              <div class="text-red-600 mb-4">
                <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p class="text-gray-500 mb-4">You don't have permission to perform this action. Please contact your administrator for access.</p>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // Remove modal when clicking dismiss or outside
        modal.addEventListener('click', (e) => {
          if (e.target === modal || e.target.closest('button')) {
            modal.remove();
          }
        });
        return;
      }
      setAdminActionTask(task);
    };

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="task-card rounded-lg shadow-sm overflow-hidden touch-manipulation"
            style={{
              backgroundColor: task.color,
              opacity: highlightedStage && highlightedStage !== task.stage ? 0.5 : 1,
              ...provided.draggableProps.style,
            }}
          >
            {/* Task Header - Add explicit touch handling */}
            <div 
              className="p-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 flex justify-between items-center"
              onClick={handleCardClick}
              onTouchEnd={handleCardClick} // Add explicit touch handler
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColor }}
                />
                <span className="font-medium truncate">{task.content}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            {/* Expanded Content - Add touch-specific styles */}
            {isExpanded && (
              <div 
                className="px-3 pb-3 text-sm bg-white expanded-content"
                onClick={(e) => e.stopPropagation()} // Prevent collapse when interacting with content
              >
                <div className="grid gap-2 text-gray-600">
                  <div>
                    <strong>Description:</strong>
                    <p className="mt-1">{task.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong>Priority:</strong>
                      <p className="mt-1" style={{ color: priorityColor }}>
                        {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                      </p>
                    </div>
                    <div>
                      <strong>Due Date:</strong>
                      <p className="mt-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <strong>Assigned To:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                        task.assignedTo.map((user, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                          >
                            {user}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </div>
                  {task.fileLinks.length > 0 && (
                    <div>
                      <strong>File Links:</strong>
                      <ul className="mt-1">
                        {task.fileLinks.map((link, index) => (
                          <li key={index}>
                            <a 
                              href={link} 
                              className="text-blue-600 hover:underline"
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Larger touch targets */}
                <div className="flex justify-end mt-3 gap-4">
                  <button 
                    onClick={handleViewDetails}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    aria-label="View Details"
                  >
                    <FiEye className="text-xl" />
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button 
                      onClick={handleAdminAction}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                      aria-label="Admin Action"
                    >
                      <FiSettings className="text-xl" />
                    </button>
                  )}
                  <button 
                    onClick={handleDeleteTask}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    aria-label="Delete Task"
                  >
                    <FiTrash className="text-xl" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const filterTasks = (tasksObj) => {
    let filteredTasks = { ...tasksObj }
    
    // Apply filters to each column
    Object.keys(filteredTasks).forEach(column => {
      filteredTasks[column] = filteredTasks[column].filter(task => {
        const matchesStage = stageFilter === 'all' || task.stage === stageFilter
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
        const matchesSearch = task.content.toLowerCase().includes(searchQuery.toLowerCase())
        
        return matchesStage && matchesStatus && matchesPriority && matchesSearch
      })
    })
    
    return filteredTasks
  }

  // Add this function to add a new task to the state
  const addNewTask = (task) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      todo: [...prevTasks.todo, {
        ...task,
        dueDate: task.due_date,
        assignedTo: task.assigned_to,
        fileLinks: task.file_links || [],
        color: stageColors[task.stage] || '#E3F2FD'
      }]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 pt-16 bg-gray-50">
      {/* Flow Chart - Hide on mobile, show on larger screens */}
      <div className="hidden md:block h-[300px] w-full mb-4 bg-white rounded-lg shadow-sm">
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            style: {
              ...node.style,
              opacity: highlightedStage && highlightedStage !== node.id ? 0.5 : 1,
            },
          }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Enhanced Filters Section - Stack filters vertically on mobile */}
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-6">
          {/* Stage Filter */}
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiLayers className="text-indigo-500" />
              <label className="text-sm font-medium">Stage</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-8 
                           text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                           hover:border-gray-300 transition-colors"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
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
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiCheckSquare className="text-emerald-500" />
              <label className="text-sm font-medium">Status</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-8
                           text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                           hover:border-gray-300 transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiFlag className="text-amber-500" />
              <label className="text-sm font-medium">Priority</label>
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-8
                           text-gray-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                           hover:border-gray-300 transition-colors"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 min-w-0 sm:min-w-[300px]">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FiSearch className="text-blue-500" />
              <label className="text-sm font-medium">Search</label>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5
                           text-gray-700 placeholder-gray-400
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                           hover:border-gray-300 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Show the form if showForm is true */}
      {showForm && projectId && (
        <CreateNewTaskForm 
          onClose={() => setShowForm(false)} 
          projectId={projectId}
          onTaskCreated={addNewTask}
        />
      )}

      {/* Kanban Board - Stack columns vertically on mobile */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row flex-1 gap-4">
          {Object.entries(filterTasks(tasks)).map(([columnId, columnTasks]) => (
            <Droppable droppableId={columnId} key={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 bg-white p-3 sm:p-4 rounded-lg shadow-sm"
                >
                  {/* Column Header - Add sticky positioning for mobile */}
                  <div className="sticky top-0 z-10 bg-white pb-2 mb-2 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {columnId === 'todo' && <FiList className="text-blue-500 text-xl" />}
                      {columnId === 'inProgress' && <FiClock className="text-orange-500 text-xl" />}
                      {columnId === 'completed' && <FiCheckCircle className="text-green-500 text-xl" />}
                      <h2 className="font-semibold">
                        {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                        <span className="ml-2 text-sm text-gray-500">({columnTasks.length})</span>
                      </h2>
                    </div>
                    {columnId === 'todo' && projectId && (
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        onClick={() => setShowForm(true)}
                        title="Add new task"
                      >
                        <FiPlusCircle className="text-blue-500 text-xl" />
                      </button>
                    )}
                  </div>

                  {/* Task Cards - Update for better mobile display */}
                  <div className="space-y-2">
                    {columnTasks.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskDetailsModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}

      {adminActionTask && (
        <AdminActionModal
          task={adminActionTask}
          onClose={() => setAdminActionTask(null)}
          onAction={async (actionData) => {
            // Handle the admin action here
            console.log('Admin action:', actionData);
            // You can update the task status, trigger notifications, etc.
            // Example:
            // await updateTaskStatus(actionData);
            setAdminActionTask(null);
          }}
        />
      )}
    </div>
  )
}

