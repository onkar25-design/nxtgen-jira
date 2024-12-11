import React, { useState, useEffect } from 'react';
import './CreateNewTaskForm.css';
import { supabase } from '../../../supabaseClient';
import { ClipboardEdit } from 'lucide-react';

const EditTaskForm = ({ task, onClose }) => {
  const [title, setTitle] = useState(task.content);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || []);
  const [fileLinks, setFileLinks] = useState(task.fileLinks || []);
  const [currentLink, setCurrentLink] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);

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

  const handleAddUser = () => {
    if (selectedUser && !assignedTo.includes(selectedUser)) {
      setAssignedTo([...assignedTo, selectedUser]);
      setSelectedUser('');
    }
  };

  const handleRemoveUser = (userToRemove) => {
    setAssignedTo(assignedTo.filter(user => user !== userToRemove));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedTask = {
      content: title,
      description,
      priority,
      due_date: dueDate,
      assigned_to: assignedTo,
      file_links: fileLinks,
      status: 'pending',
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', task.id);

      if (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task');
      } else {
        console.log('Task updated successfully');
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update task');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <ClipboardEdit className="modal-header-icon" />
            Edit Task
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskForm;