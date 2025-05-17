
import React, { useEffect, useState } from 'react';

export default function TemplateAdminPanel() {
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [file, setFile] = useState(null);
  const [catFiles, setCatFiles] = useState([]);

  const loadCategories = async () => {
    const res = await fetch('http://localhost:8000/templates/categories');
    const data = await res.json();
    setCategories(data.categories);
  };

  const loadCategoryFiles = async (cat) => {
    const res = await fetch(`http://localhost:8000/templates/${cat}`);
    const data = await res.json();
    setCatFiles(data.files);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async () => {
    await fetch('http://localhost:8000/templates/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat })
    });
    setNewCat('');
    loadCategories();
  };

  const deleteCategory = async (cat) => {
    await fetch('http://localhost:8000/templates/category', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cat })
    });
    setSelectedCat('');
    loadCategories();
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('category', selectedCat);
    formData.append('file', file);

    await fetch('http://localhost:8000/templates/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    loadCategoryFiles(selectedCat);
  };

  const deleteFile = async (filename) => {
    await fetch(`http://localhost:8000/templates/${selectedCat}/${filename}`, {
      method: 'DELETE'
    });
    loadCategoryFiles(selectedCat);
  };

  return (
    <div>
      <h2>📁 Template Library Admin Panel</h2>
      <input value={newCat} placeholder="New Category" onChange={e => setNewCat(e.target.value)} />
      <button onClick={createCategory}>Add Category</button>

      <ul>
        {categories.map(cat => (
          <li key={cat}>
            {cat} <button onClick={() => { setSelectedCat(cat); loadCategoryFiles(cat); }}>Manage</button>
            <button onClick={() => deleteCategory(cat)}>Delete</button>
          </li>
        ))}
      </ul>

      {selectedCat && (
        <div>
          <h3>Managing: {selectedCat}</h3>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button onClick={uploadFile}>Upload to {selectedCat}</button>
          <ul>
            {catFiles.map(file => (
              <li key={file}>{file} <button onClick={() => deleteFile(file)}>Delete</button></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
