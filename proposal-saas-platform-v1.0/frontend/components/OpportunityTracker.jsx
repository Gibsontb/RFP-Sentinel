
import React, { useEffect, useState } from 'react';

export default function OpportunityTracker() {
  const [rfps, setRfps] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/rfps', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setRfps(data.rfps));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:8000/rfp/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    alert("Status updated");
    window.location.reload();
  };

  return (
    <div>
      <h2>Opportunity Tracker</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Agency</th>
            <th>Due Date</th>
            <th>Type</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rfps.map(rfp => (
            <tr key={rfp.id}>
              <td>{rfp.title}</td>
              <td>{rfp.agency}</td>
              <td>{rfp.due_date}</td>
              <td>{rfp.contract_type}</td>
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
