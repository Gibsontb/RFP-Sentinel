
import React, { useEffect, useState } from 'react';

export default function LessonsLearned() {
  const [lessons, setLessons] = useState([]);
  const [rfpId, setRfpId] = useState('');
  const [team, setTeam] = useState('');
  const [lesson, setLesson] = useState('');
  const [tags, setTags] = useState('');

  const loadLessons = async () => {
    const res = await fetch("http://localhost:8000/lessons");
    const data = await res.json();
    setLessons(data);
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const addLesson = async () => {
    await fetch("http://localhost:8000/lessons/add", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rfp_id: rfpId,
        date: new Date().toISOString().split("T")[0],
        team,
        lesson,
        tags: tags.split(",").map(t => t.trim())
      })
    });
    loadLessons();
    setRfpId('');
    setTeam('');
    setLesson('');
    setTags('');
  };

  return (
    <div>
      <h2>📘 Lessons Learned</h2>
      <div>
        <input value={rfpId} onChange={e => setRfpId(e.target.value)} placeholder="RFP ID" />
        <input value={team} onChange={e => setTeam(e.target.value)} placeholder="Team or Role" />
        <textarea value={lesson} onChange={e => setLesson(e.target.value)} placeholder="Lesson" />
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)" />
        <button onClick={addLesson}>Add Lesson</button>
      </div>
      <hr />
      {lessons.map((l, i) => (
        <div key={i}>
          <strong>{l.rfp_id}</strong> ({l.date}) – {l.team}
          <p>{l.lesson}</p>
          <em>Tags: {l.tags.join(", ")}</em>
          <hr />
        </div>
      ))}
    </div>
  );
}
