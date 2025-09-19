import React, { useState } from 'react';
import type { User } from '../types/User';
import './Users.css';

const Users: React.FC = () => {

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Users Management</h2>
        <p>Manage your application users</p>
      </div>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(user)} className="edit-button">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="delete-button">
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="user-form-container">
        <h3>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h3>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter user name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter user email"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button">
              {editingUser ? '💾 Update User' : '➕ Add User'}
            </button>
            {editingUser && (
              <button type="button" onClick={handleCancel} className="cancel-button">
                ❌ Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Users;