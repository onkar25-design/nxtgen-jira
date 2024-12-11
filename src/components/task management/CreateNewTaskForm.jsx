import React, { useState, useEffect } from 'react';
import './CreateNewTaskForm.css';
import { supabase } from '../../../supabaseClient'; // Import the Supabase client
import { PlusCircle } from 'lucide-react';

const CreateNewTaskForm = ({ onClose, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [fileLinks, setFileLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .order('name');
      
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddLink = () => {
    if (currentLink.trim()) {
      setFileLinks([...fileLinks, currentLink.trim()]);
      setCurrentLink('');
    }
  };

  const handleRemoveLink = (index) => {
    setFileLinks(fileLinks.filter((_, i) => i !== index));
  };

  const handleAddUser = () => {
    if (selectedUser && !assignedTo.includes(selectedUser)) {
      setAssignedTo([...assignedTo, selectedUser]);
      setSelectedUser('');
    }
  };

  const handleRemoveUser = (userToRemove) => {
    setAssignedTo(assignedTo.filter(user => user !== userToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectId) {
      console.error('No project ID provided');
      return;
    }

    const newTask = {
      content: title,
      description,
      priority,
      due_date: dueDate,
      created_at: new Date().toISOString(),
      assigned_to: assignedTo,
      stage: 'requirement',
      color: '#E3F2FD',
      file_links: fileLinks,
      project_id: projectId,
      progress: 'todo',
      status: 'pending'
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select();

      if (error) {
        console.error('Error inserting task:', error);
        alert('Failed to create task. Please try again.');
      } else {
        console.log('Task inserted:', data);
        onTaskCreated(data[0]);
        onClose(); // Close the modal after successful insertion
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <PlusCircle className="modal-header-icon" />
            Create New Task
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Assigned To</label>
            <div className="link-input-container">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="user-select"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.name} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={handleAddUser}
                className="add-link-btn"
              >
                Add User
              </button>
            </div>
            <div className="links-list">
              {assignedTo.map((user, index) => (
                <div key={index} className="link-item">
                  <span className="link-text">{user}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveUser(user)}
                    className="remove-link-btn"
                    aria-label="Remove user"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group file-links-section">
            <label>File Attachment Links</label>
            <div className="link-input-container">
              <input
                type="text"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                placeholder="Enter a file link"
              />
              <button 
                type="button" 
                onClick={handleAddLink}
                className="add-link-btn"
              >
                Add Link
              </button>
            </div>
            <div className="links-list">
              {fileLinks.map((link, index) => (
                <div key={index} className="link-item">
                  <span className="link-text">{link}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLink(index)}
                    className="remove-link-btn"
                    aria-label="Remove link"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewTaskForm;