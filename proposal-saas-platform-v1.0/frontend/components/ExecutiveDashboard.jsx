
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState({
    proposals: { draft: 4, submitted: 3, won: 2 },
    past_perf: 8,
    lessons: 5,
    open_matches: 3
  });

  const proposalData = [
    { name: 'Draft', value: metrics.proposals.draft },
    { name: 'Submitted', value: metrics.proposals.submitted },
    { name: 'Won', value: metrics.proposals.won }
  ];

  const COLORS = ['#ffc107', '#03a9f4', '#4caf50'];

  return (
    <div>
      <h2>📊 Executive Dashboard</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h4>Proposal Status</h4>
          <PieChart width={300} height={250}>
            <Pie data={proposalData} cx="50%" cy="50%" outerRadius={80} label>
              {proposalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div>
          <h4>System Stats</h4>
          <ul>
            <li>Past Performance Entries: <strong>{metrics.past_perf}</strong></li>
            <li>Lessons Learned: <strong>{metrics.lessons}</strong></li>
            <li>Open Matched Contracts: <strong>{metrics.open_matches}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
