
import React, { useState } from 'react';

export default function RFPIntakeForm() {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    title: '', solicitation_number: '', agency: '', due_date: '',
    naics: '', psc: '', contract_type: '', submission_method: '',
    notes: '', go_no_go: 'go'
  });
  const [files, setFiles] = useState([]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = e => {
    setFiles(e.target.files);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    for (const key in form) data.append(key, form[key]);
    for (const file of files) data.append('files', file);

    const res = await fetch('http://localhost:8000/rfp/intake', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: data
    });
    const result = await res.json();
    alert(result.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>RFP Intake Portal</h2>
      <input name="title" placeholder="Opportunity Title" onChange={handleChange} required />
      <input name="solicitation_number" placeholder="Solicitation #" onChange={handleChange} />
      <input name="agency" placeholder="Agency Name" onChange={handleChange} required />
      <input name="due_date" type="date" onChange={handleChange} required />
      <input name="naics" placeholder="NAICS Code" onChange={handleChange} />
      <input name="psc" placeholder="PSC Code" onChange={handleChange} />
      <select name="contract_type" onChange={handleChange}>
        <option value="">Select Contract Type</option>
        <option value="FFP">Firm Fixed Price</option>
        <option value="IDIQ">IDIQ</option>
        <option value="BPA">BPA</option>
      </select>
      <select name="submission_method" onChange={handleChange}>
        <option value="">Select Submission Method</option>
        <option value="email">Email</option>
        <option value="portal">Portal</option>
        <option value="fedconnect">FedConnect</option>
      </select>
      <textarea name="notes" placeholder="Notes / Customer Hot Buttons" onChange={handleChange}></textarea>
      <label><input type="radio" name="go_no_go" value="go" checked={form.go_no_go === 'go'} onChange={handleChange} /> Go</label>
      <label><input type="radio" name="go_no_go" value="no-go" checked={form.go_no_go === 'no-go'} onChange={handleChange} /> No-Go</label>
      <input type="file" multiple onChange={handleFileChange} />
      <button type="submit">Submit RFP</button>
    </form>
  );
}
