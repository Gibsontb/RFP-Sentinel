
import React, { useState } from 'react';

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: '', position: '', phone: '', extension: '', email: '', password: '', tenant_id: '', role: 'writer'
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register User</h2>
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="position" placeholder="Position/Title" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="extension" placeholder="Ext" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <input name="tenant_id" placeholder="Tenant ID" onChange={handleChange} />
      <select name="role" onChange={handleChange}>
        <option value="writer">writer</option>
        <option value="reviewer">reviewer</option>
        <option value="admin">admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}
