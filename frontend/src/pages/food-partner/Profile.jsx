import React from 'react'
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useState ,useEffect } from 'react';

const sampleReels = [
  { id: 1, thumb: 'hhttps://www.pexels.com/download/video/4686883/' },
  { id: 2, thumb: 'https://ik.imagekit.io/6j5alarrgo/d0d8cce6-47f6-4b52-9271-19273de99a98_mOeZATf8D' },
  { id: 3, thumb: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 4, thumb: 'https://ik.imagekit.io/6j5alarrgo/5e97740f-0711-4618-981a-01ed872a7d38_de2Bk3cFY' },
]

const Profile = () => {

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);

    const { id } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:3000/api/food-partner/${id}`, { withCredentials: true })   
            .then(response => {
                setProfile(response.data.foodPartner);
                setVideos(response.data.foodPartner.foodItems);
            })
          }, [id]);


  const business = {
    name: 'Tasty Bites',
    address: '123 Food Lane, Flavor Town, FT 45678',
    meals: 1240,
    customers: 9870,
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="header-row">
          <div className="avatar" aria-hidden>TB</div>
          <div className="details">
            <h2 className="business-name">{profile?.businessName}</h2>
            <div className="business-address">{profile?.address}</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat">
            <div>
              <div className="label">Total meals</div>
              <div className="value">{business.meals}</div>
            </div>
            <div className="muted">🍽️</div>
          </div>

          <div className="stat">
            <div>
              <div className="label">Customers served</div>
              <div className="value">{business.customers}</div>
            </div>
            <div className="muted">👥</div>
          </div>
        </div>

        <h3 className="section-title">Reels</h3>
        <div className="reels-grid">
          {videos.map(r => (
            <div key={r._id} className="reel-thumb">
              <video src={r.video} muted></video>

              <div className="overlay">
                <span className="mini-btn">Visit</span>
                <span className="mini-btn">❤ 1.2k</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile