import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <header style={{ backgroundColor: '#f8f9fa', padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h1>Dashboard</h1>
        <nav>
          <Link to="/dashboard/users" style={{ marginRight: '20px' }}>Users</Link>
          <button onClick={logout} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
            Logout
          </button>
        </nav>
      </header>
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
