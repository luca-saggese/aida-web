import { Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import './SettingsPage.css';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="settings-title">
          <Settings size={22} strokeWidth={1.7} />
          <span>Settings</span>
        </div>
      </div>

      <section className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-row">
          <span className="settings-label">Name</span>
          <span className="settings-value">{user?.name ?? '—'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Email</span>
          <span className="settings-value">{user?.email ?? '—'}</span>
        </div>
        <div className="settings-row">
          <span className="settings-label">Organization</span>
          <span className="settings-value">{organization?.name ?? '—'}</span>
        </div>
      </section>
    </div>
  );
}