import { Outlet } from "react-router";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
