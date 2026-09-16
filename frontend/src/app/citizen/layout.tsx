import React from 'react';
import { CitizenProvider } from '@/context/CitizenContext';
import { CitizenShell } from '@/components/citizen/CitizenShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LifeSync Citizen Emergency Assistance',
  description: 'Fast bystander emergency reporting to synchronize critical information before hospital arrival.',
};

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CitizenProvider>
      <CitizenShell>
        {children}
      </CitizenShell>
    </CitizenProvider>
  );
}
