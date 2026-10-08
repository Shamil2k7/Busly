'use client';

import React from 'react';
import LiveRouteTimeline from './LiveRouteTimeline';

/**
 * Live Transit Corridor & Stops Timeline
 * Dedicated high-performance vertical transit timeline for real-time school bus telemetry and stop navigation.
 */
export default function LiveBusMap({
  bus,
  route,
  stops = [],
  activeTrip = null,
  showControls = true,
  className = '',
  height = 'max-h-[560px]',
  onSelectStop = null,
  onAddStopAtLocation = null,
  ...restProps
}) {
  return (
    <LiveRouteTimeline
      bus={bus}
      route={route}
      stops={stops}
      activeTrip={activeTrip}
      className={className}
      height={height}
      onSelectStop={onSelectStop}
      onAddStopAtLocation={onAddStopAtLocation}
      {...restProps}
    />
  );
}
