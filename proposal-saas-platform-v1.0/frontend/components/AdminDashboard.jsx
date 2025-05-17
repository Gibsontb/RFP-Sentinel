
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [license, setLicense] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data.users));

    fetch('http://localhost:8000/tenant/license', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLicense(data));
  }, []);

  const toggleUser = async (id) => {
    const res = await fetch(`http://localhost:8000/user/${id}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    alert("User status updated");
    window.location.reload();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>License: {license.active_users} of {license.max_users} users used</p>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "Active" : "Disabled"}</td>
              <td><button onClick={() => toggleUser(u.id)}>Toggle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
