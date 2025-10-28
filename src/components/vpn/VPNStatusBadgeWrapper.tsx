import React from 'react';
import { VPNStatusBadge } from './VPNStatusBadge';
import { useVPNSession } from '@/hooks/useVPNSession';

export const VPNStatusBadgeWrapper: React.FC = () => {
  const { session } = useVPNSession();

  // Show badge if there's any VPN session (guest or authenticated)
  if (!session) {
    return null;
  }

  return <VPNStatusBadge />;
};
