
import React, { useState } from 'react';

export default function BusinessProfileForm() {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    name: '', uei: '', cage_code: '', naics: '', psc: '', keywords: '',
    sam_api_key: '', fedconnect_user: '', gsabuy_email: '',
    itar: false, cleared: false, vehicles: '', certifications: '',
    teaming: false, partners: '', region: 'us-east-1'
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/tenant/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Business Profile Setup</h2>
      <input name="name" placeholder="Organization Name" onChange={handleChange} />
      <input name="uei" placeholder="UEI" onChange={handleChange} />
      <input name="cage_code" placeholder="CAGE Code" onChange={handleChange} />
      <input name="naics" placeholder="NAICS (comma-separated)" onChange={handleChange} />
      <input name="psc" placeholder="PSC Codes" onChange={handleChange} />
      <textarea name="keywords" placeholder="Keywords / Capabilities" onChange={handleChange}></textarea>
      <input name="sam_api_key" placeholder="SAM.gov API Key" onChange={handleChange} />
      <input name="fedconnect_user" placeholder="FedConnect Login" onChange={handleChange} />
      <input name="gsabuy_email" placeholder="GSA eBuy Email" onChange={handleChange} />
      <label><input type="checkbox" name="itar" onChange={handleChange} /> ITAR?</label>
      <label><input type="checkbox" name="cleared" onChange={handleChange} /> Cleared Staff?</label>
      <input name="vehicles" placeholder="Contract Vehicles (comma-separated)" onChange={handleChange} />
      <input name="certifications" placeholder="Certifications (comma-separated)" onChange={handleChange} />
      <label><input type="checkbox" name="teaming" onChange={handleChange} /> Open to Teaming?</label>
      <textarea name="partners" placeholder="Known Partners" onChange={handleChange}></textarea>
      <select name="region" onChange={handleChange}>
        <option value="us-east-1">us-east-1</option>
        <option value="us-west-2">us-west-2</option>
      </select>
      <button type="submit">Save Profile</button>
    </form>
  );
}
