import React, { useCallback, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserRegister from "../pages/UserRegister.jsx";
import UserLogin from "../pages/UserLogin.jsx";
import PartnerRegister from "../pages/PartnerRegister.jsx";
import PartnerLogin from "../pages/PartnerLogin.jsx";
import Home from "../pages/general/Home.jsx";
import CreateFood from "../pages/food-partner/CreateFood.jsx";
import Profile from "../pages/food-partner/Profile.jsx";
import Saved from "../pages/general/Saved.jsx";
import { FlashContainer } from "../components/FlashMessage.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

let flashId = 0;
const AppRoutes = () => {
    const [flashes, setFlashes] = useState([]);

  const addFlash = useCallback((message, type = "success") => {
    const id = ++flashId;
    setFlashes((f) => [...f, { id, message, type }]);
    setTimeout(() => setFlashes((f) => f.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeFlash = useCallback((id) => {
    setFlashes((f) => f.filter((x) => x.id !== id));
  }, []);

    return (
        <>
        <FlashContainer flashes={flashes} onDismiss={removeFlash} />
        <ThemeToggle />
        <Router>
            <Routes>
                <Route path="/user/register" element={<UserRegister onFlash={addFlash}/>} />
                <Route path="/" element={<UserLogin />} />
                <Route path="/foodpartner/register" element={<PartnerRegister onFlash={addFlash}/>} />
                <Route path="/foodpartner/login" element={<PartnerLogin />} />
                <Route path="/home" element={<Home />} />
                <Route path="/reels/:id" element={<Home />} />
                <Route path="/create-food" element={<CreateFood onFlash={addFlash} />} />
                <Route path="/food-partner/:id" element={<Profile />} />
                <Route path="/saved" element={<Saved />} />
            </Routes>
        </Router>
        </>
    )
}

export default AppRoutes;