'use client';

import React from 'react';
import CoatOfArms from './CoatOfArms';

interface CroatianCoatOfArmsProps {
    scale?: number;
    isHovering?: boolean;
    tilt?: { rotateX: number; rotateY: number };
}

export default function CroatianCoatOfArms({ scale = 1, isHovering = false, tilt }: CroatianCoatOfArmsProps) {
    return (
        <CoatOfArms
        src="/coa/cro.svg"
        alt="Croatian coat of arms"
        scale={scale}
        size={50}
        isHovering={isHovering}
        tilt={tilt}
        useNextImage={false}
        />
    );
}