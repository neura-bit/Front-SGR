import React from 'react';

interface LogoProps {
    className?: string;
    height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', height = 40 }) => {
    return (
        <svg
            height={height}
            viewBox="0 0 280 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FBbf24" /> {/* Amber 400 */}
                    <stop offset="100%" stopColor="#D97706" /> {/* Amber 600 */}
                </linearGradient>
            </defs>

            {/* UBI - Black/Dark */}
            <text
                x="8"
                y="65"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="1000"
                fontStyle="italic"
                fontSize="78"
                fill="#18181b"
                letterSpacing="-3"
            >
                UBI
            </text>

            {/* KA - Gold Gradient */}
            <text
                x="133"
                y="65"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="1000"
                fontStyle="italic"
                fontSize="78"
                fill="url(#gold-gradient)"
                letterSpacing="-3"
            >
                KA
            </text>

            {/* Subtitle */}
            <text
                x="12"
                y="89"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="600"
                fontSize="14"
                fill="#4B5563"
                letterSpacing="1.5"
            >
                SISTEMA DE GESTIÓN DE RUTAS
            </text>
        </svg>
    );
};
