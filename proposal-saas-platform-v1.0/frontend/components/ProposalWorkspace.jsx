
import React, { useEffect, useState } from 'react';

export default function ProposalWorkspace({ rfpId }) {
  const [sections, setSections] = useState([
    "Executive Summary",
    "Technical Approach",
    "Management Plan",
    "Past Performance",
    "Pricing Narrative"
  ]);
  const [pastPerf, setPastPerf] = useState([]);
  const [responses, setResponses] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/pastperformance')
      .then(res => res.json())
      .then(data => setPastPerf(data.contracts));
  }, []);

  const generateResponse = (section) => {
    let ppText = pastPerf.map(p => `• ${p.summary}`).join("\n");
    let baseText = `Section: ${section}\n\nBased on our capabilities and past performance:\n${ppText}\n\nOur ${section.toLowerCase()} is built on proven delivery to DoD agencies...`;

    setResponses(prev => ({ ...prev, [section]: baseText }));
  };

  return (
    <div>
      <h2>📑 Proposal Workspace for RFP #{rfpId}</h2>
      {sections.map(section => (
        <div key={section} style={{ marginBottom: '1.5rem' }}>
          <h3>{section}</h3>
          <button onClick={() => generateResponse(section)}>🧠 Generate Draft</button>
          <textarea rows="6" cols="100"
            value={responses[section] || ''}
            onChange={e => setResponses({ ...responses, [section]: e.target.value })}
            placeholder={`Start writing your ${section}...`}
          />
        </div>
      ))}
    </div>
  );
}
