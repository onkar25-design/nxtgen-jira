import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import './NewTaskForm.css'; // Reusing the same CSS

const NewTaskForm = ({ onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  const [fileLinks, setFileLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [content, setContent] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .order('name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            content,
            description,
            priority,
            due_date: dueDate,
            assigned_to: assignedTo,
            file_links: fileLinks,
            project_id: selectedProject,
            stage: 'requirement' // default stage
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      if (onTaskCreated) onTaskCreated(data);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
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
            <label htmlFor="project">Project *</label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Title *</label>
            <input
              id="content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                min={today}
                onChange={(e) => setDueDate(e.target.value)}
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
                <option value="">Select user</option>
                {users.map((user, index) => (
                  <option key={index} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleAddUser} className="add-link-btn">
                Add
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
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>File Links</label>
            <div className="link-input-container">
              <input
                type="text"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                placeholder="Enter file link"
              />
              <button type="button" onClick={handleAddLink} className="add-link-btn">
                Add
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

export default NewTaskForm;