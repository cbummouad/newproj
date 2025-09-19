@@ .. @@
 import React from 'react';
 import { Link, Outlet } from 'react-router-dom';
 import { useAuth } from '../contexts/AuthContext';
+import './Dashboard.css';

 const Dashboard: React.FC = () => {
 }
@@ .. @@

   return (
   )
-    <div>
-      <header style={{ backgroundColor: '#f8f9fa', padding: '10px', borderBottom: '1px solid #ccc' }}>
-        <h1>Dashboard</h1>
-        <nav>
-          <Link to="/dashboard/users" style={{ marginRight: '20px' }}>Users</Link>
-          <button onClick={logout} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
-            Logout
-          </button>
-        </nav>
-      </header>
-      <main style={{ padding: '20px' }}>
-        <Outlet />
-      </main>
+    <div className="dashboard-container">
+      <header className="dashboard-header">
+        <div className="header-content">
+          <div className="header-left">
+            <h1 className="dashboard-title">Dashboard</h1>
+            <nav className="dashboard-nav">
+              <Link to="/dashboard/users" className="nav-link">
+                <span className="nav-icon">👥</span>
+                Users
+              </Link>
+            </nav>
+          </div>
+          <button onClick={logout} className="logout-button">
+            <span className="logout-icon">🚪</span>
+            Logout
+          </button>
+        </div>
+      </header>
+      <main className="dashboard-main">
+        <div className="main-content">
+          <Outlet />
+        </div>
+      </main>
     </div>
   );
 };