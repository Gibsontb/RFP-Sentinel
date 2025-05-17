
import React, { useState } from 'react';

export default function OnboardingForm() {
  const [form, setForm] = useState({
    name: '', email: '', uei: '', cage_code: '', naics: '', psc: '', keywords: '',
    sam_api_key: '', fedconnect_user: '', gsabuy_email: '',
    itar: false, cleared: false, vehicles: '', certifications: '', teaming: false, partners: '',
    plan: '1-user', max_users: 1, region: 'us-east-1'
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    alert('Onboarded: ' + data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Tenant Onboarding</h2>
      <input name="name" placeholder="Org Name" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />
      <input name="uei" placeholder="UEI" onChange={handleChange} required />
      <input name="cage_code" placeholder="CAGE Code" onChange={handleChange} required />
      <input name="naics" placeholder="NAICS (comma-separated)" onChange={handleChange} />
      <input name="psc" placeholder="PSC Codes" onChange={handleChange} />
      <textarea name="keywords" placeholder="Keywords" onChange={handleChange}></textarea>
      <input name="sam_api_key" placeholder="SAM.gov API Key" onChange={handleChange} />
      <input name="fedconnect_user" placeholder="FedConnect Login" onChange={handleChange} />
      <input name="gsabuy_email" placeholder="GSA eBuy Email" onChange={handleChange} />
      <label><input type="checkbox" name="itar" onChange={handleChange} /> ITAR?</label>
      <label><input type="checkbox" name="cleared" onChange={handleChange} /> Cleared Personnel?</label>
      <input name="vehicles" placeholder="Contract Vehicles" onChange={handleChange} />
      <input name="certifications" placeholder="Certifications" onChange={handleChange} />
      <label><input type="checkbox" name="teaming" onChange={handleChange} /> Open to Teaming?</label>
      <textarea name="partners" placeholder="Known Partners" onChange={handleChange}></textarea>
      <select name="plan" onChange={handleChange}>
        <option value="1-user">1-user</option>
        <option value="5-user">5-user</option>
        <option value="10-user">10-user</option>
      </select>
      <input type="number" name="max_users" placeholder="Max Users" onChange={handleChange} />
      <select name="region" onChange={handleChange}>
        <option value="us-east-1">us-east-1</option>
        <option value="us-west-2">us-west-2</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
