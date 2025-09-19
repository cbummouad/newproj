@@ .. @@
 import React, { useState } from 'react';
 import { useAuth } from '../contexts/AuthContext';
 import { useNavigate } from 'react-router-dom';
+import './Login.css';

 const Login: React.FC = () => {
@@ .. @@
   };

   return (
-    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
-      <h2>Login</h2>
-      <form onSubmit={handleSubmit}>
-        <div style={{ marginBottom: '10px' }}>
-          <label>Username:</label>
-          <input
-            type="text"
-            value={username}
-            onChange={(e) => setUsername(e.target.value)}
-            required
-            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
-          />
-        </div>
-        <div style={{ marginBottom: '10px' }}>
-          <label>Password:</label>
-          <input
-            type="password"
-            value={password}
-            onChange={(e) => setPassword(e.target.value)}
-            required
-            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
-          />
-        </div>
-        {error && <p style={{ color: 'red' }}>{error}</p>}
-        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
-          Login
-        </button>
-      </form>
+    <div className="login-container">
+      <div className="login-card">
+        <div className="login-header">
+          <h2>Welcome Back</h2>
+          <p>Please sign in to your account</p>
+        </div>
+        <form onSubmit={handleSubmit} className="login-form">
+          <div className="form-group">
+            <label htmlFor="username">Username</label>
+            <input
+              id="username"
+              type="text"
+              value={username}
+              onChange={(e) => setUsername(e.target.value)}
+              required
+              placeholder="Enter your username"
+            />
+          </div>
+          <div className="form-group">
+            <label htmlFor="password">Password</label>
+            <input
+              id="password"
+              type="password"
+              value={password}
+              onChange={(e) => setPassword(e.target.value)}
+              required
+              placeholder="Enter your password"
+            />
+          </div>
+          {error && <div className="error-message">{error}</div>}
+          <button type="submit" className="login-button">
+            Sign In
+          </button>
+        </form>
+      </div>
     </div>
   );
 };