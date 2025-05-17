
import React, { useEffect, useState } from 'react';

export default function OpportunityDashboard() {
  const [rfps, setRfps] = useState([]);
  const [filter, setFilter] = useState('All');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/rfps', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRfps(data.rfps));
  }, []);

  const filteredRfps = filter === 'All' ? rfps : rfps.filter(r => r.status === filter);

  const statusCounts = rfps.reduce((acc, rfp) => {
    acc[rfp.status] = (acc[rfp.status] || 0) + 1;
    return acc;
  }, {});

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:8000/rfp/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    alert("Status updated");
    window.location.reload();
  };

  const statusColor = (status) => {
    return {
      'In Review': '#ffcc00',
      'Planning': '#00bcd4',
      'Submitted': '#4caf50',
      'Archived': '#9e9e9e'
    }[status] || '#ddd';
  };

  return (
    <div>
      <h2>📊 Opportunity Status Dashboard</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Status Summary:</strong> {' '}
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} style={{ marginRight: '10px' }}>
            {status}: {count}
          </span>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by Status: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="In Review">In Review</option>
          <option value="Planning">Planning</option>
          <option value="Submitted">Submitted</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Agency</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Change Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredRfps.map(rfp => (
            <tr key={rfp.id}>
              <td>{rfp.title}</td>
              <td>{rfp.agency}</td>
              <td>{rfp.due_date}</td>
              <td style={{ backgroundColor: statusColor(rfp.status) }}>{rfp.status}</td>
              <td>
                <select value={rfp.status} onChange={e => updateStatus(rfp.id, e.target.value)}>
                  <option value="In Review">In Review</option>
                  <option value="Planning">Planning</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Archived">Archived</option>
                </select>
              </td>
              <td>{rfp.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
