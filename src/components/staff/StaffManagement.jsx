import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FiEye, FiEdit, FiSearch, FiUsers, FiCheck, FiX } from 'react-icons/fi'; // Import React Icons
import './StaffManagement.css';
import { supabase } from '../../../supabaseClient';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const StaffManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for add modal visibility
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal visibility
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State for view modal visibility
  const [newStaffInfo, setNewStaffInfo] = useState({ // State for new staff information
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
  });
  const [editStaffInfo, setEditStaffInfo] = useState({ // State for editing staff information
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
    status: 'Active', // Default status for editing
  });
  const [viewStaffInfo, setViewStaffInfo] = useState({ // State for viewing staff information
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
    },
    role: '',
    designation: '',
  });

  const [sortOption, setSortOption] = useState(''); // State for sorting option
  const [staffData, setStaffData] = useState([]); // Initialize staffData as an empty array
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedStaff, setSelectedStaff] = useState([]); // State for selected staff in multi-select
  const [userRole, setUserRole] = useState(''); // State for user role

  // Fetch staff data from Supabase
  const fetchStaffData = async () => {
    try {
        // Get the logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            throw new Error(`Error fetching user: ${userError.message}`);
        }

        if (!user) {
            console.error("User is not logged in");
            return; // Exit if no user is found
        }

        // Fetch the role of the logged-in user
        const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id) // Fetch the role of the logged-in user
            .single();

        if (roleError) {
            throw new Error(`Error fetching user role: ${roleError.message}`);
        }

        console.log("User Role:", userData.role); // Log the user role
        setUserRole(userData.role); // Set the user role

        // Fetch all user data
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('*'); // Fetch all user data

        if (fetchError) {
            throw new Error(`Error fetching staff data: ${fetchError.message}`);
        }

        console.log("Fetched Data:", data); // Log the fetched data

        // Set staff data based on user role
        if (userData.role === 'admin') {
            setStaffData(data); // Admin can see all users (both admins and staff)
        } else {
            setStaffData(data.filter(staff => staff.id === user.id)); // Staff can see only their own data
        }
    } catch (error) {
        console.error(error.message);
    }
  };

  useEffect(() => {
    fetchStaffData(); // Call the fetch function
  }, []); // Empty dependency array to run only on mount

  const handleAddStaff = () => {
    if (userRole !== 'admin') {
      alert('You are not authorized to add staff members.');
      return;
    }
    setNewStaffInfo({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
      },
      role: '',
      designation: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditStaff = async (staff) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
    }

    if (!user) {
        console.error("User is not logged in");
        return;
    }

    if (userRole === 'admin' || staff.id === user.id) {
        setEditStaffInfo(staff);
        setIsEditModalOpen(true);
    } else {
        alert('You are not authorized to edit this staff member.');
    }
  };

  const handleViewStaff = (staff) => { // Function to open the view staff modal
    setViewStaffInfo(staff); // Set the staff data to be viewed
    setIsViewModalOpen(true);
  };

  const handleSubmitNewStaff = async (e) => {
    e.preventDefault();
    if (userRole !== 'admin') return;

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          first_name: newStaffInfo.first_name,
          last_name: newStaffInfo.last_name,
          email: newStaffInfo.email,
          phone: newStaffInfo.phone,
          role: newStaffInfo.role,
          designation: newStaffInfo.designation,
          status: 'Active',
          address: newStaffInfo.address,
        },
      ])
      .select();

    if (error) {
      console.error('Error adding staff:', error);
    } else {
      console.log('Staff added:', data);
      setStaffData([...staffData, ...data]);
    }

    setIsAddModalOpen(false);
  };

  const handleSubmitEditStaff = async (e) => {
    e.preventDefault();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error("Error fetching user:", userError.message);
        return;
    }

    if (!user) {
        console.error("User is not logged in");
        return;
    }

    if (userRole !== 'admin' && editStaffInfo.id !== user.id) {
        alert('You do not have permission to update this data.');
        return;
    }

    const updateData = {
        first_name: editStaffInfo.first_name,
        last_name: editStaffInfo.last_name,
        email: editStaffInfo.email,
        phone: editStaffInfo.phone,
        designation: editStaffInfo.designation,
        address: editStaffInfo.address,
        ...(userRole === 'admin' && { status: editStaffInfo.status }),
    };

    if (userRole === 'admin') {
        updateData.role = editStaffInfo.role;
    }

    const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', editStaffInfo.id);

    if (error) {
        console.error('Error updating staff:', error);
        alert('There was an error updating the staff member.');
    } else {
        console.log('Staff updated:', data);
        const updatedStaffData = staffData.map(staff => 
            staff.id === editStaffInfo.id ? { ...staff, ...editStaffInfo } : staff
        );
        setStaffData(updatedStaffData);
        alert('Staff member details have been updated successfully.');
    }

    setIsEditModalOpen(false);
  };

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption.value);
  };

  const sortedStaffData = [...staffData].sort((a, b) => {
    // Sort by status
    if (sortOption === 'Active') {
      return a.status === 'Active' ? -1 : b.status === 'Active' ? 1 : 0; // Active first
    } else if (sortOption === 'Inactive') {
      return a.status === 'Inactive' ? -1 : b.status === 'Inactive' ? 1 : 0; // Inactive first
    } else if (sortOption === 'Admin') {
      return a.role === 'Admin' ? -1 : b.role === 'Admin' ? 1 : 0; // Admin first
    } else if (sortOption === 'Staff') {
      return a.role === 'Staff' ? -1 : b.role === 'Staff' ? 1 : 0; // Staff first
    } else {
      // Default sort by name
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase(); // Combine first and last name
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase(); // Combine first and last name
      return nameA.localeCompare(nameB); // Sort alphabetically
    }
  });

  const handleApproveStaff = async (staffId) => {
    if (confirm('Are you sure you want to approve this staff member?')) {
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: 'active' })
                .eq('id', staffId);

            if (error) {
                throw error;
            }

            alert('Staff member approved successfully.');
            setStaffData(staffData.map(staff => 
                staff.id === staffId ? { ...staff, status: 'active' } : staff
            ));
        } catch (error) {
            console.error('Error approving staff:', error);
            alert('Error approving staff member.');
        }
    }
};

const handleRejectStaff = async (staffId) => {
    if (confirm('Are you sure you want to reject this staff member?')) {
        try {
            const { error } = await supabase
                .from('users')
                .update({ status: 'inactive' })
                .eq('id', staffId);

            if (error) {
                throw error;
            }

            alert('Staff member rejected successfully.');
            setStaffData(staffData.map(staff => 
                staff.id === staffId ? { ...staff, status: 'inactive' } : staff
            ));
        } catch (error) {
            console.error('Error rejecting staff:', error);
            alert('Error rejecting staff member.');
        }
    }
};

  const handleDeleteStaff = async (staffId) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', staffId);

      if (error) {
        console.error('Error deleting staff:', error);
        alert('Error deleting staff member.');
      } else {
        setStaffData(staffData.filter(staff => staff.id !== staffId));
        alert('Staff member deleted successfully.');
      }
    }
  };

  // Filter staff data based on selected staff names
  const filteredStaffData = sortedStaffData.filter(staff => {
    const firstNameMatch = staff.first_name.toLowerCase().includes(searchQuery.toLowerCase()); // Check first name
    return firstNameMatch; // Filter based on first name only
  });

  return (
    <div className="manageStaff-management">
      <div className="manageStaff-header">
        <h1>
          <FiUsers className="h-6 w-6 mr-2" />
          Manage Staff
        </h1>
        <div className="manageStaff-header-actions">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search staff by First Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>Edit Staff</h3>
            <form onSubmit={handleSubmitEditStaff}>
              <div className="form-row">
                <div className="form-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editStaffInfo.first_name}
                    onChange={(e) => setEditStaffInfo({ ...editStaffInfo, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editStaffInfo.last_name}
                    onChange={(e) => setEditStaffInfo({ ...editStaffInfo, last_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Designation</label>
                  <input
                    type="text"
                    value={editStaffInfo.designation}
                    onChange={(e) => setEditStaffInfo({ ...editStaffInfo, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editStaffInfo.email}
                  onChange={(e) => setEditStaffInfo({ ...editStaffInfo, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editStaffInfo.phone}
                    onChange={(e) => setEditStaffInfo({ ...editStaffInfo, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Street</label>
                  <input
                    type="text"
                    value={editStaffInfo.address.street}
                    onChange={(e) => setEditStaffInfo({ 
                      ...editStaffInfo, 
                      address: { ...editStaffInfo.address, street: e.target.value } 
                    })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>City</label>
                  <input
                    type="text"
                    value={editStaffInfo.address.city}
                    onChange={(e) => setEditStaffInfo({ 
                      ...editStaffInfo, 
                      address: { ...editStaffInfo.address, city: e.target.value } 
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>State</label>
                  <input
                    type="text"
                    value={editStaffInfo.address.state}
                    onChange={(e) => setEditStaffInfo({ 
                      ...editStaffInfo, 
                      address: { ...editStaffInfo.address, state: e.target.value } 
                    })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Country</label>
                  <input
                    type="text"
                    value={editStaffInfo.address.country}
                    onChange={(e) => setEditStaffInfo({ 
                      ...editStaffInfo, 
                      address: { ...editStaffInfo.address, country: e.target.value } 
                    })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={editStaffInfo.address.zipcode}
                    onChange={(e) => setEditStaffInfo({ 
                      ...editStaffInfo, 
                      address: { ...editStaffInfo.address, zipcode: e.target.value } 
                    })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Role</label>
                  <Select
                    options={roleOptions}
                    value={roleOptions.find(option => option.value === editStaffInfo.role)}
                    onChange={(selectedOption) => setEditStaffInfo({ ...editStaffInfo, role: selectedOption.value })}
                    isDisabled={userRole === 'staff'}
                  />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === editStaffInfo.status)}
                    onChange={(selectedOption) => setEditStaffInfo({ ...editStaffInfo, status: selectedOption.value })}
                  />
                </div>
              </div>

              <div className="manageStaff-modal-buttons">
                <button type="submit" className="update-button">Update Staff</button>
                <button type="button" className="cancel-button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Staff Modal */}
      {isViewModalOpen && (
        <div className="manageStaff-modal-overlay">
          <div className="manageStaff-modal-content">
            <h3>View Staff Details</h3>
            <p><strong>First Name:</strong> {viewStaffInfo.first_name}</p>
            <p><strong>Last Name:</strong> {viewStaffInfo.last_name}</p>
            <p><strong>Email:</strong> {viewStaffInfo.email}</p>
            <p><strong>Phone:</strong> {viewStaffInfo.phone}</p>
            <p><strong>Role:</strong> {viewStaffInfo.role}</p>
            <p><strong>Designation:</strong> {viewStaffInfo.designation}</p>
            <p><strong>Status:</strong> {viewStaffInfo.status}</p>
            <p><strong>Address:</strong> {viewStaffInfo.address.street}, {viewStaffInfo.address.city}, {viewStaffInfo.address.state}, {viewStaffInfo.address.country}, {viewStaffInfo.address.zipcode}</p>
            <div className="manageStaff-modal-buttons">
              <button type="button" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Table Wrapper for Horizontal Scrolling */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaffData.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.first_name}</td>
                <td>{staff.last_name}</td>
                <td>{staff.email}</td>
                <td>
                  <span className={`badge badge-${staff.role ? staff.role.toLowerCase() : 'unknown'}`}>{staff.role || 'Unknown'}</span>
                </td>
                <td>
                  <span className={`badge badge-${staff.status ? staff.status.toLowerCase() : 'unknown'}`}>{staff.status || 'Unknown'}</span>
                </td>
                <td>
                  <button 
                    className="manageStaff-action-button manageStaff-view-button" 
                    onClick={() => handleViewStaff(staff)}
                  >
                    <FiEye className="h-5 w-5" />
                  </button>
                  <button 
                    className="manageStaff-action-button manageStaff-edit-button" 
                    onClick={() => handleEditStaff(staff)}
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  {userRole === 'admin' && staff.status === 'Pending' && (
                    <>
                      <button 
                        className="manageStaff-action-button" 
                        onClick={() => handleApproveStaff(staff.id)}
                      >
                        <FiCheck className="h-5 w-5 text-green-500" />
                      </button>
                      <button 
                        className="manageStaff-action-button" 
                        onClick={() => handleRejectStaff(staff.id)}
                      >
                        <FiX className="h-5 w-5 text-red-500" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
