import React, { useMemo, useState } from 'react'
import '../../styles/create-food.css'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { hasErrors, validateRequired } from '../../utils/validation'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const CreateFood = ({ onFlash }) => {
  const [preview, setPreview] = useState(null)
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    video: null,
  })
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  const errors = useMemo(
    () => ({
      video: formValues.video
        ? formValues.video.type.startsWith('video/')
          ? ''
          : 'Choose a valid video file.'
        : 'Video is required.',
      name: validateRequired(formValues.name, 'Meal name'),
      description: validateRequired(formValues.description.replace(/<[^>]*>?/gm, '').trim(), 'Description'),
    }),
    [formValues],
  )

  const isFormInvalid = hasErrors(errors)

  const shouldShowError = (field) => Boolean((touched[field] || submitAttempted) && errors[field])

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    setFormMessage('')
    setTouched((current) => ({
      ...current,
      video: true,
    }))

    if (!file) {
      setFormValues((current) => ({
        ...current,
        video: null,
      }))
      setPreview(null)
      return
    }

    setFormValues((current) => ({
      ...current,
      video: file,
    }))

    const url = URL.createObjectURL(file)
    setPreview({ url, type: file.type })
  }

  const onDescriptionChange = (content) => {
    setFormMessage('')
    setFormValues((current) => ({
      ...current,
      description: content,
    }))
    setTouched((current) => ({
      ...current,
      description: true,
    }))
  }

  const onInputChange = (e) => {
    const { name, value } = e.target
    setFormMessage('')
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const onInputBlur = (e) => {
    setTouched((current) => ({
      ...current,
      [e.target.name]: true,
    }))
  }

  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setFormMessage('')

    if (isFormInvalid) {
      return
    }

    const formData = new FormData()

    formData.append('name', formValues.name.trim())
    formData.append('description', formValues.description.trim())
    formData.append('video', formValues.video)

    setIsSubmitting(true)

    try {
      const response = await axios.post(`/api/food`, formData, {
        withCredentials: true,
      })

      if (onFlash) {
        onFlash('Meal created successfully!', 'success')
      }
      setTimeout(() => {
        navigate(`/food-partner/${response.data.foodItem.foodPartner}`);
      }, 1500);
    } catch (err) {
      setFormMessage(err.response?.data?.message || 'Unable to create this meal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-food-page">
      <div className="card">
        <h2>Create a meal</h2>

        <form className="form-grid" onSubmit={onSubmit} noValidate>
          <div className="form">
            <label className="label">Video</label>
            <label
              className={`file-input input ${!formValues.video ? 'is-placeholder' : ''} ${shouldShowError('video') ? 'invalid' : ''}`}
              htmlFor="videoInput"
            >
              {formValues.video ? formValues.video.name : 'Choose video file'}
            </label>
            <input
              id="videoInput"
              name="video"
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={onFileChange}
              aria-invalid={shouldShowError('video')}
              aria-describedby="video-error"
            />
            {shouldShowError('video') && (
              <p className="field-error" id="video-error">{errors.video}</p>
            )}

            <label className="label">Name</label>
            <input
              name="name"
              className={`input ${shouldShowError('name') ? 'invalid' : ''}`}
              value={formValues.name}
              onChange={onInputChange}
              onBlur={onInputBlur}
              placeholder="Meal name"
              aria-invalid={shouldShowError('name')}
              aria-describedby="name-error"
            />
            {shouldShowError('name') && (
              <p className="field-error" id="name-error">{errors.name}</p>
            )}

            <label className="label">Description</label>
            <div className={`quill-container ${shouldShowError('description') ? 'invalid' : ''}`}>
              <ReactQuill
                theme="snow"
                value={formValues.description}
                onChange={onDescriptionChange}
                onBlur={() => setTouched((current) => ({ ...current, description: true }))}
                placeholder="Short description for the reel"
              />
            </div>
            {shouldShowError('description') && (
              <p className="field-error" id="description-error">{errors.description}</p>
            )}

            {formMessage && <p className="form-error">{formMessage}</p>}

            <div className="actions">
              <button className="btn" type="submit" disabled={isFormInvalid || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </button>
              <Link
                to="/"
                className="btn ghost"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Cancel
              </Link>
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
              <>
                <span className="preview-placeholder-icon">🎬</span>
                <p className="preview-placeholder-text">Video preview will appear here</p>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateFood
