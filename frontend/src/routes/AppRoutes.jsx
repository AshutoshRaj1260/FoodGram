import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserRegister from "../pages/UserRegister.jsx";
import UserLogin from "../pages/UserLogin.jsx";
import PartnerRegister from "../pages/PartnerRegister.jsx";
import PartnerLogin from "../pages/PartnerLogin.jsx";
import Home from "../pages/general/Home.jsx";
import CreateFood from "../pages/food-partner/CreateFood.jsx";
import Profile from "../pages/food-partner/Profile.jsx";
import Saved from "../pages/general/Saved.jsx";
const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/user/register" element={<UserRegister />} />
                <Route path="/" element={<UserLogin />} />
                <Route path="/foodpartner/register" element={<PartnerRegister />} />
                <Route path="/foodpartner/login" element={<PartnerLogin />} />
                <Route path="/home" element={<Home />} />
                <Route path="/reels/:id" element={<Home />} />
                <Route path="/create-food" element={<CreateFood />} />
                <Route path="/food-partner/:id" element={<Profile />} />
                <Route path="/saved" element={<Saved />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes;