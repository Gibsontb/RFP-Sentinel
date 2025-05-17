
import React, { useEffect, useState } from 'react';

export default function ReviewTracker({ rfpId }) {
  const [sections, setSections] = useState({});
  const [section, setSection] = useState('');
  const [note, setNote] = useState('');
  const [reviewer, setReviewer] = useState('Red Team');
  const [status, setStatus] = useState('Draft');

  useEffect(() => {
    fetch(`http://localhost:8000/reviews/${rfpId}`)
      .then(res => res.json())
      .then(data => setSections(data.sections));
  }, [rfpId]);

  const handleSubmit = async () => {
    await fetch(`http://localhost:8000/reviews/${rfpId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, reviewer, note, status })
    });
    window.location.reload();
  };

  return (
    <div>
      <h2>📋 Review Workflow Tracker</h2>
      <div>
        <h3>Add Review Comment</h3>
        <input placeholder="Section" value={section} onChange={e => setSection(e.target.value)} />
        <select value={reviewer} onChange={e => setReviewer(e.target.value)}>
          <option>Red Team</option>
          <option>Pink Team</option>
          <option>Gold Team</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option>Draft</option>
          <option>Reviewed</option>
          <option>Approved</option>
        </select>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Comment" />
        <button onClick={handleSubmit}>Add Comment</button>
      </div>
      <hr />
      {Object.entries(sections).map(([sec, data]) => (
        <div key={sec} style={{ marginBottom: '1rem' }}>
          <h4>{sec} — <em>{data.status}</em></h4>
          <ul>
            {data.comments.map((c, i) => (
              <li key={i}><strong>{c.reviewer}:</strong> {c.note}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
