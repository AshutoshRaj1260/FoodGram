import React, { useState } from 'react'
import '../../styles/create-food.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CreateFood = () => {
  const [preview, setPreview] = useState(null)

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview({ url, type: file.type })
  }

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData();

    formData.append('name', e.target.name.value);  
    formData.append('description', e.target.description.value);  
    formData.append('video', e.target.video.files[0]);

    const response = await axios.post('http://localhost:3000/api/food', formData, {
      withCredentials: true,})

      navigate('/');

  }

  return (
    <div className="create-food-page">
      <div className="card">
        <h2>Create a meal</h2>

        <form className="form-grid" onSubmit={onSubmit}>
          <div className="form">
            <label className="label">Video</label>
            <label className="file-input input" htmlFor="videoInput">Choose video file</label>
            <input id="videoInput" name="video" type="file" accept="video/*" style={{ display: 'none' }} onChange={onFileChange} />

            <label className="label">Name</label>
            <input name="name" className="input" placeholder="Meal name" />

            <label className="label">Description</label>
            <textarea name="description" className="input" placeholder="Short description for the reel" />

            <div className="actions">
              <button className="btn" type="submit">Create</button>
              <button className="btn ghost" type="button">Cancel</button>
            </div>
          </div>

          <div className="preview">
            {preview ? (
              preview.type.startsWith('video') ? (
                <video src={preview.url} controls muted playsInline />
              ) : (
                <img src={preview.url} alt="preview" />
              )
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.7)', padding: 20 }}>Video preview will appear here</div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFood