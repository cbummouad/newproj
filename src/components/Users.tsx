@@ .. @@
 import React, { useState } from 'react';
 import type { User } from '../types/User';
+import './Users.css';

 const Users: React.FC = () => {
@@ .. @@

   return (
-    <div>
-      <h2>Users Management</h2>
-      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
-        <thead>
-          <tr style={{ backgroundColor: '#f8f9fa' }}>
-            <th style={{ border: '1px solid #ccc', padding: '8px' }}>ID</th>
-            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
-            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
-            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
-          </tr>
-        </thead>
-        <tbody>
-          {users.map(user => (
-            <tr key={user.id}>
-              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.id}</td>
-              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.name}</td>
-              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{user.email}</td>
-              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
-                <button onClick={() => handleEdit(user)} style={{ marginRight: '5px', padding: '5px 10px' }}>Edit</button>
-                <button onClick={() => handleDelete(user.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>Delete</button>
-              </td>
-            </tr>
-          ))}
-        </tbody>
-      </table>
-      <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
-      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
-        <div style={{ marginBottom: '10px' }}>
-          <label>Name:</label>
-          <input
-            type="text"
-            value={name}
-            onChange={(e) => setName(e.target.value)}
-            required
-            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
-          />
-        </div>
-        <div style={{ marginBottom: '10px' }}>
-          <label>Email:</label>
-          <input
-            type="email"
-            value={email}
-            onChange={(e) => setEmail(e.target.value)}
-            required
-            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
-          />
-        </div>
-        <button type="submit" style={{ padding: '10px 20px', marginRight: '10px' }}>
-          {editingUser ? 'Update' : 'Add'}
-        </button>
-        {editingUser && (
-          <button type="button" onClick={handleCancel} style={{ padding: '10px 20px' }}>
-            Cancel
-          </button>
-        )}
-      </form>
+    <div className="users-container">
+      <div className="users-header">
+        <h2>Users Management</h2>
+        <p>Manage your application users</p>
+      </div>
+      
+      <div className="users-table-container">
+        <table className="users-table">
+          <thead>
+            <tr>
+              <th>ID</th>
+              <th>Name</th>
+              <th>Email</th>
+              <th>Actions</th>
+            </tr>
+          </thead>
+          <tbody>
+            {users.map(user => (
+              <tr key={user.id}>
+                <td>{user.id}</td>
+                <td>{user.name}</td>
+                <td>{user.email}</td>
+                <td>
+                  <div className="action-buttons">
+                    <button onClick={() => handleEdit(user)} className="edit-button">
+                      ✏️ Edit
+                    </button>
+                    <button onClick={() => handleDelete(user.id)} className="delete-button">
+                      🗑️ Delete
+                    </button>
+                  </div>
+                </td>
+              </tr>
+            ))}
+          </tbody>
+        </table>
+      </div>
+      
+      <div className="user-form-container">
+        <h3>{editingUser ? '✏️ Edit User' : '➕ Add New User'}</h3>
+        <form onSubmit={handleSubmit} className="user-form">
+          <div className="form-row">
+            <div className="form-group">
+              <label htmlFor="name">Name</label>
+              <input
+                id="name"
+                type="text"
+                value={name}
+                onChange={(e) => setName(e.target.value)}
+                required
+                placeholder="Enter user name"
+              />
+            </div>
+            <div className="form-group">
+              <label htmlFor="email">Email</label>
+              <input
+                id="email"
+                type="email"
+                value={email}
+                onChange={(e) => setEmail(e.target.value)}
+                required
+                placeholder="Enter user email"
+              />
+            </div>
+          </div>
+          <div className="form-actions">
+            <button type="submit" className="submit-button">
+              {editingUser ? '💾 Update User' : '➕ Add User'}
+            </button>
+            {editingUser && (
+              <button type="button" onClick={handleCancel} className="cancel-button">
+                ❌ Cancel
+              </button>
+            )}
+          </div>
+        </form>
+      </div>
     </div>
   );
 };