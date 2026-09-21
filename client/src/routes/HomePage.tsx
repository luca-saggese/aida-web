import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import './HomePage.css';

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="home-page">
      <h1>Welcome, {user?.name ?? 'there'}</h1>
      <p>This is the GoTraxx AI / Aida console clone.</p>
      <Link to="/playground" className="home-cta">
        <FlaskConical size={18} strokeWidth={1.8} />
        Open Playground
      </Link>
    </div>
  );
}