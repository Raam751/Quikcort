import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'light' | 'dark' | 'color';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", variant = 'color' }) => {
    const colors = {
        light: {
            primary: "white",
            secondary: "rgba(255, 255, 255, 0.7)"
        },
        dark: {
            primary: "#0f172a", // neutral-900
            secondary: "#475569" // secondary-600
        },
        color: {
            primary: "#0d9488", // primary-600 (Teal)
            secondary: "#0f172a" // neutral-900
        }
    };

    const c = colors[variant];

    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Abstract Scale / Q shape */}
            <circle cx="50" cy="50" r="45" stroke={c.primary} strokeWidth="8" className="opacity-20" />

            {/* Left Plate */}
            <path
                d="M25 55 C 25 65, 40 65, 40 55"
                stroke={c.primary}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <line x1="32.5" y1="35" x2="32.5" y2="55" stroke={c.primary} strokeWidth="4" />

            {/* Right Plate */}
            <path
                d="M60 55 C 60 65, 75 65, 75 55"
                stroke={c.secondary}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <line x1="67.5" y1="35" x2="67.5" y2="55" stroke={c.secondary} strokeWidth="4" />

            {/* Balance Beam */}
            <path
                d="M25 35 L 75 35"
                stroke={c.primary}
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Center Pivot */}
            <circle cx="50" cy="35" r="4" fill={c.primary} />
        </svg>
    );
};
