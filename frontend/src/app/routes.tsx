import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ProfileSetupScreen from "./screens/ProfileSetupScreen";
import HomeScreen from "./screens/HomeScreen";
import TournamentsScreen from "./screens/TournamentsScreen";
import ScrimsLobbyScreen from "./screens/ScrimsLobbyScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import TeamScreen from "./screens/TeamScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import Wallet from "./screens/Wallet";
import MainLayout from "./components/MainLayout";
import { authAPI } from "./api/apiclient";

function ProtectedLayout() {
  const location = useLocation();
  const token = localStorage.getItem("nexouraToken");
  const userId = localStorage.getItem("nexouraUserId");
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(true);

  useEffect(() => {
    let active = true;

    const checkProfile = async () => {
      const localFlag = localStorage.getItem("nexouraProfileCompleted");
      if (localFlag === "true") {
        if (active) {
          setProfileCompleted(true);
          setLoading(false);
        }
        return;
      }

      if (!userId) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await authAPI.getProfile(userId);
        const completed = res?.data?.profileCompleted ?? true;
        localStorage.setItem("nexouraProfileCompleted", String(completed));
        if (active) setProfileCompleted(Boolean(completed));
      } catch {
        if (active) setProfileCompleted(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    checkProfile();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!profileCompleted && location.pathname !== "/app/onboarding") {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (profileCompleted && location.pathname === "/app/onboarding") {
    return <Navigate to="/app" replace />;
  }

  return <MainLayout />;
}

function AdminRoute() {
  const token = localStorage.getItem("nexouraToken");
  const role = localStorage.getItem("nexouraRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/app" replace />;
  }

  return <AdminScreen />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/signup",
    Component: SignupScreen,
  },
  {
    path: "/app",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: HomeScreen },
      { path: "onboarding", Component: ProfileSetupScreen },
      { path: "tournaments", Component: TournamentsScreen },
      { path: "scrims/:id", Component: ScrimsLobbyScreen },
      { path: "leaderboard", Component: LeaderboardScreen },
      { path: "team", Component: TeamScreen },
      { path: "wallet", Component: Wallet },
      { path: "profile", Component: ProfileScreen },
      { path: "admin", Component: AdminRoute },
    ],
  },
]);
