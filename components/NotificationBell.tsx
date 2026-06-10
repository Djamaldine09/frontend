'use client';

import { Bell } from 'lucide-react';

export default function NotificationBell() {
  return (
    <button className="btn-ghost" style={{ position: 'relative', padding: 8 }}>
      <Bell size={20} />
      <span style={{
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        background: 'var(--tile-rose)',
        borderRadius: '50%',
        border: '2px solid var(--bg-primary)'
      }} />
    </button>
  );
}
