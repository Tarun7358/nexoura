import { createBrowserRouter, Navigate } from "react-router";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import TournamentsScreen from "./screens/TournamentsScreen";
import ScrimsLobbyScreen from "./screens/ScrimsLobbyScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import TeamScreen from "./screens/TeamScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import MainLayout from "./components/MainLayout";

function ProtectedLayout() {
  const token = localStorage.getItem("nexouraToken");

  if (!token) {
    return <Navigate to="/login" replace />;
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
      { path: "tournaments", Component: TournamentsScreen },
      { path: "scrims/:id", Component: ScrimsLobbyScreen },
      { path: "leaderboard", Component: LeaderboardScreen },
      { path: "team", Component: TeamScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "admin", Component: AdminRoute },
    ],
  },
]);
