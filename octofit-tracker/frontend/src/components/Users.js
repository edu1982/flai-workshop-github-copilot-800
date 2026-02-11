import React, { useState, useEffect } from 'react';

function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    team_id: ''
  });
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getApiUrl = (endpoint) => {
    const codespace = process.env.REACT_APP_CODESPACE_NAME;
    return codespace 
      ? `https://${codespace}-8000.app.github.dev/api/${endpoint}/`
      : `http://localhost:8000/api/${endpoint}/`;
  };

  const fetchUsers = async () => {
    try {
      const apiUrl = getApiUrl('users');
      console.log('Fetching users from:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users data received:', data);
      
      const usersData = data.results || data;
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const apiUrl = getApiUrl('teams');
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const teamsData = data.results || data;
      setTeams(teamsData);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      team_id: user.team_id
    });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', team_id: '' });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const apiUrl = getApiUrl(`users/${editingUser.id}`);
      console.log('Updating user at:', apiUrl, formData);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const updatedUser = await response.json();
      console.log('User updated:', updatedUser);

      // Refresh the users list
      await fetchUsers();
      
      setSaveSuccess(true);
      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (err) {
      console.error('Error updating user:', err);
      setSaveError(err.message);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : teamId;
  };

  if (loading) return <div className="container mt-4">Loading users...</div>;
  if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h2>👤 Users</h2>
      </div>
      
      <div className="row g-4">
        {users.map((user, index) => (
          <div className="col-md-6 col-lg-4" key={user.id || index}>
            <div className="card h-100 user-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{user.name}</h5>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(user)}
                    data-bs-toggle="modal" 
                    data-bs-target="#editUserModal"
                    title="Edit user"
                  >
                    ✏️
                  </button>
                </div>
                <p className="card-text">
                  <strong>📧 Email:</strong><br/>
                  <span className="text-muted">{user.email}</span>
                </p>
                <p className="card-text">
                  <strong>👥 Team:</strong><br/>
                  <span className="badge bg-primary mt-1">{getTeamName(user.team_id)}</span>
                </p>
                <p className="card-text">
                  <strong>📅 Joined:</strong><br/>
                  <span className="text-muted">{new Date(user.created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info mt-4" role="alert">
        <strong>👥 Total users:</strong> {users.length}
      </div>

      {/* Edit User Modal */}
      <div className="modal fade" id="editUserModal" tabIndex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editUserModalLabel">✏️ Edit User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleCancel}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {saveSuccess && (
                  <div className="alert alert-success" role="alert">
                    ✅ User updated successfully!
                  </div>
                )}
                {saveError && (
                  <div className="alert alert-danger" role="alert">
                    ❌ Error: {saveError}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="team_id" className="form-label">Team</label>
                  <select
                    className="form-select"
                    id="team_id"
                    name="team_id"
                    value={formData.team_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
