
import React from 'react';

export default function ArchiveRFPButton({ rfpId }) {
  const token = localStorage.getItem('token');

  const handleArchive = async () => {
    const res = await fetch(`http://localhost:8000/rfp/${rfpId}/archive`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <button onClick={handleArchive}>Archive RFP</button>
  );
}
