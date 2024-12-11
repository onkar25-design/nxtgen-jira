import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const workflowStages = [
  'requirement',
  'design',
  'coding',
  'review',
  'testing',
  'documentation',
  'completed'
];

const AdminActionModal = ({ task, onClose }) => {
  const [rejectionComment, setRejectionComment] = useState('');
  const currentStageIndex = workflowStages.indexOf(task.stage);
  const nextStage = workflowStages[currentStageIndex + 1];
  const isLastStage = task.stage === 'documentation';
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          if (userData.role !== 'admin') {
            onClose();
            alert('Unauthorized access. This incident will be logged.');
            return;
          }
          setCurrentUser({ ...user, role: userData.role });
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        onClose();
      }
    };

    checkUserRole();
  }, [onClose]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleAction = async (action) => {
    try {
      if (action === 'approve') {
        let newStage = nextStage;
        
        const { error } = await supabase
          .from('tasks')
          .update({ 
            stage: newStage,
            status: 'approved',
            progress: newStage === 'completed' ? 'completed' : 'inProgress'
          })
          .eq('id', task.id);

        if (error) {
          throw error;
        }
      } else if (action === 'reject') {
        if (!rejectionComment.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }

        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: 'rejected',
            stage: task.stage,
            rejection_comment: rejectionComment
          })
          .eq('id', task.id);

        if (error) {
          throw error;
        }
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error processing action:', error);
      alert('Error updating task status');
    }
  };

  const handleReapply = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'pending',  // Reset status to pending
          // Stage remains the same for reapplication
        })
        .eq('id', task.id);

      if (error) {
        throw error;
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error reapplying:', error);
      alert('Error reapplying task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Modal Header */}
        <div className="bg-[#2563eb] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="text-white text-xl" />
            <h2 className="text-xl font-semibold text-white">Admin Action</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Task Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-gray-700">{task.content}</p>
              <p className="text-sm text-gray-600">{task.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Current Stage:</span> {task.stage}
                </div>
                {nextStage && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Next Stage:</span> {nextStage}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Priority:</span> {task.priority}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Due Date:</span>{' '}
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Assigned to:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                      task.assigned_to.map((user, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-700"
                        >
                          {user}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No users assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {task.file_links && task.file_links.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-sm text-gray-600">Attachments:</span>
                  <ul className="mt-2 space-y-1">
                    {task.file_links.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Please provide a reason for rejection..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {task.stage !== 'completed' && (
              <button
                onClick={() => handleAction('reject')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiXCircle className="mr-2" />
                Reject Task
              </button>
            )}
            {isLastStage ? (
              <button
                onClick={() => handleAction('approve')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiCheck className="mr-2" />
                Mark as Complete
              </button>
            ) : nextStage && (
              <button
                onClick={() => handleAction('approve')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiCheck className="mr-2" />
                Move to {nextStage}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminActionModal;