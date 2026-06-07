import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import BottomNavBar from "../../components/BottomNavBar";
import "../../styles/analytics-dashboard.css";

const AnalyticsDashboard=()=>{
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchAnalytics =async()=>{
            try{
                const response = await axios.get(
                    "/api/analytics/food-partner/dashboard",
                    { withCredentials: true}
                );

                setAnalytics(response.data.data);
            } catch {
                setAnalytics(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if(loading){
        return (
            <div className="analytics-page">
                <div className="analytics-header">
                    <h1>Analytics Dashboard</h1>
                    <p>Loading your food reel performance...</p>
                </div>

                <div className="analytics-grid">
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                </div>

                <div className="skeleton skeleton-chart"></div>
                <BottomNavBar userType="partner" />
            </div>
        );
    }

    const summary = analytics?.summary || {
        totalReels: 0,
        totalLikes: 0,
        totalSaves: 0,
    };

    const timeline = analytics?.timeline || [];
    const topReels = analytics?.topReels || [];
    const hasNoData = summary.totalReels === 0;

    return (
        <div className="analytics-page">
            <div className="analytics-header">
                <h1>Analytics Dashboard</h1>
                <p>Track your food reel performance and engagement</p>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <p>Total Reels</p>
                    <h2>{summary.totalReels}</h2>
                </div>

                <div className="analytics-card">
                    <p>Total Likes</p>
                    <h2>{summary.totalLikes}</h2>
                </div>

                <div className="analytics-card">
                    <p>Total Saves</p>
                    <h2>{summary.totalSaves}</h2>
                </div>

                <div className="analytics-card">
                    <p>Top Reels</p>
                    <h2>{topReels.length}</h2>
                </div>
            </div>

            {hasNoData?(
                <div className="analytics-section empty-state">
                    <h2>No analytics available yet</h2>
                    <p>Upload your first food reel to start tracking performance</p>
                </div>
            ) : (
                <>
                <div className="analytics-section">
                    <h2>Engagement Timeline</h2>
                    <div className="chart-box">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeline}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="likes" strokeWidth={2}/>
                                <Line type="monotone" dataKey="saves" strokeWidth={2}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-section">
                    <h2>Top Performing Reels</h2>
                    { topReels.map((reel)=>(
                        <div className="top-reel" key={reel._id}>
                            <div>
                                <h3>{reel.name}</h3>
                                <p>{reel.likeCount} likes • {reel.saveCount} saves</p>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}
        <BottomNavBar userType="partner" />
        </div>
    );
};

export default AnalyticsDashboard;