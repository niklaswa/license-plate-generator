'use client';

import React from 'react';
import CoatOfArms from './CoatOfArms';

interface LiechtensteinCoatOfArmsProps {
  scale?: number;
  isHovering?: boolean;
  tilt?: { rotateX: number; rotateY: number };
}

export default function LiechtensteinCoatOfArms({ scale = 1, isHovering = false, tilt }: LiechtensteinCoatOfArmsProps) {
  return (
    <CoatOfArms
      src="/coa/fl.svg"
      alt="Liechtenstein coat of arms"
      scale={scale}
      size={50}
      isHovering={isHovering}
      tilt={tilt}
      useNextImage={false}
    />
  );
}
