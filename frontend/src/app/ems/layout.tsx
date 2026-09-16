import React, { ReactNode } from 'react';
import { EMSProvider } from '@/context/EMSContext';
import { EMSShell } from '@/components/ems/EMSShell';

export const metadata = {
  title: 'LifeSync | EMS & Paramedic Field Operations',
  description: 'AI-assisted pre-hospital paramedic telemetry and emergency handoff portal',
};

export default function EMSLayout({ children }: { children: ReactNode }) {
  return (
    <EMSProvider>
      <EMSShell>{children}</EMSShell>
    </EMSProvider>
  );
}
