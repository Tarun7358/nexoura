import { useNavigate } from "react-router";
import "../styles/ui-kit.css";

type BottomNavProps = {
  onLogout?: () => void;
};

export default function BottomNav({ onLogout }: BottomNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", path: "/app" },
    { label: "Tournaments", path: "/app/tournaments" },
    { label: "Team", path: "/app/team" },
    { label: "Leaderboard", path: "/app/leaderboard" },
    { label: "Profile", path: "/app/profile" },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "12px",
            padding: "8px",
            textAlign: "center",
            flex: 1,
          }}
          className="center"
        >
          {item.label}
        </button>
      ))}
      {onLogout ? (
        <button
          onClick={onLogout}
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "12px",
            padding: "8px",
            textAlign: "center",
            flex: 1,
          }}
          className="center"
        >
          Logout
        </button>
      ) : null}
    </div>
  );
}
