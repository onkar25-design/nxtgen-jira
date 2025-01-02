import React, { useState } from 'react';
import { FiX, FiCheck, FiClock, FiXCircle, FiRefreshCw, FiPlusCircle, FiEdit } from 'react-icons/fi';
import CreateNewTaskForm from './CreateNewTaskForm';
import EditTaskForm from './EditTaskForm';

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return '#DC2626';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const workflowStages = [
  { 
    id: 'requirement', 
    label: 'Requirement Submission',
    color: '#E3F2FD',
    borderColor: '#90CAF9'
  },
  { 
    id: 'design', 
    label: 'Design',
    color: '#F3E5F5',
    borderColor: '#CE93D8'
  },
  { 
    id: 'coding', 
    label: 'Coding',
    color: '#E8F5E9',
    borderColor: '#A5D6A7'
  },
  { 
    id: 'review', 
    label: 'Code Review',
    color: '#FFF3E0',
    borderColor: '#FFCC80'
  },
  { 
    id: 'testing', 
    label: 'Testing',
    color: '#E1F5FE',
    borderColor: '#81D4FA'
  },
  { 
    id: 'documentation', 
    label: 'Documentation',
    color: '#FCE4EC',
    borderColor: '#F48FB1'
  },
  { 
    id: 'completed', 
    label: 'Completed',
    color: '#C8E6C9',
    borderColor: '#81C784'
  }
];

const TaskDetailsModal = ({ task, onClose }) => {
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showEditTaskForm, setShowEditTaskForm] = useState(false);

  const currentStageIndex = workflowStages.findIndex(stage => stage.id === task.stage);
  const isRejected = task.status === 'rejected';

  const handleReapply = () => {
    setShowEditTaskForm(true);
  };

  const handleCreateNew = () => {
    setShowCreateTaskForm(true);
  };

  const handleCloseCreateTask = () => {
    setShowCreateTaskForm(false);
  };

  const handleCloseEditTask = () => {
    setShowEditTaskForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {showCreateTaskForm ? (
        <CreateNewTaskForm onClose={handleCloseCreateTask} />
      ) : showEditTaskForm ? (
        <EditTaskForm task={task} onClose={() => {
          handleCloseEditTask();
          onClose();
        }} />
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="bg-[#2563eb] px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">{task.content}</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(80vh-4rem)] overflow-hidden">
            {/* Left Side - Task Details */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-b md:border-r md:border-b-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{task.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Priority</h3>
                  <div 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: `${getPriorityColor(task.priority)}20`,
                      color: getPriorityColor(task.priority)
                    }}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Due Date</h3>
                  <p className="text-gray-600">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Assigned To</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                      task.assigned_to.map((user, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                        >
                          {user}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No users assigned</span>
                    )}
                  </div>
                </div>

                {task.file_links && task.file_links.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">File Links</h3>
                    <ul className="space-y-2">
                      {task.file_links.map((link, index) => (
                        <li key={index}>
                          <a 
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowEditTaskForm(true)}
                    className="text-green-600 hover:text-green-700"
                    aria-label="Edit Task"
                  >
                    <FiEdit className="text-xl" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Workflow Progress */}
            <div className="w-full md:w-1/2 p-6 bg-gray-50 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-6">Workflow Progress</h3>
              <div className="space-y-4">
                {workflowStages.map((stage, index) => {
                  const isCompleted = index < currentStageIndex;
                  const isCurrent = index === currentStageIndex;
                  const isPending = index > currentStageIndex;
                  const isCompletedStage = stage.id === 'completed' && task.stage === 'completed';

                  if (isRejected && isCurrent) {
                    return (
                      <div key={stage.id} className="flex items-center p-4 rounded-lg border bg-red-50">
                        <div className="mr-4">
                          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                            <FiXCircle className="text-xl" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{stage.label} - Rejected</h4>
                          {task.rejection_comment && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-red-200">
                              <p className="text-sm font-medium text-gray-700 mb-1">Rejection Reason:</p>
                              <p className="text-sm text-red-600">{task.rejection_comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={stage.id}
                      className={`
                        flex items-center p-4 rounded-lg border
                        ${isCurrent || isCompletedStage ? `bg-${stage.color} border-${stage.borderColor}` : 'bg-white'}
                      `}
                    >
                      <div className="mr-4">
                        {(isCompleted || isCompletedStage) && (
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <FiCheck className="text-xl" />
                          </div>
                        )}
                        {isCurrent && !isRejected && !isCompletedStage && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <FiClock className="text-xl" />
                          </div>
                        )}
                        {isPending && !isCompletedStage && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                            <FiClock className="text-xl" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{stage.label}</h4>
                        <p className="text-sm text-gray-500">
                          {(isCompleted || isCompletedStage) && 'Completed'}
                          {isCurrent && !isRejected && !isCompletedStage && 'In Progress'}
                          {isPending && !isCompletedStage && 'Pending'}
                        </p>
                        {isCompletedStage && task.completed_at && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-500">
                              Completed on: {new Date(task.completed_at).toLocaleDateString()}
                            </p>
                            {task.approved_by && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Approved by:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {task.approved_by}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Show approver for completed intermediate stages */}
                        {isCompleted && task.stage_approvals && task.stage_approvals[stage.id] && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">Approved by:</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {task.stage_approvals[stage.id].approved_by}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(task.stage_approvals[stage.id].approved_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons for Rejected Tasks */}
              {isRejected && (
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-red-600">Task Rejected</h4>
                  <div className="flex gap-4">
                    <button
                      onClick={handleReapply}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiRefreshCw /> Reapply for Approval
                    </button>
                    <button
                      onClick={handleCreateNew}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiPlusCircle /> Create New Task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailsModal;