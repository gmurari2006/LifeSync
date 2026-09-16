import React from 'react';
import { HospitalProvider } from '@/context/HospitalContext';
import { HospitalShell } from '@/components/hospital/HospitalShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeSync ED Operations | Hospital Emergency Readiness Portal',
  description: 'Pre-arrival hospital coordination, bay staging, and operational readiness dashboard.',
};

export default function HospitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HospitalProvider>
      <HospitalShell>
        {children}
      </HospitalShell>
    </HospitalProvider>
  );
}
