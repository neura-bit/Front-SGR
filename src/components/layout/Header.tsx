"use client"

import type React from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import { LogOut, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Logo } from "../ui/Logo"
import "./Header.css"

interface HeaderProps {
    onMenuClick: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="flex items-center gap-4">
                    <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Menu">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div className="header-logo">
                        <Logo height={56} />
                    </div>
                </div>

                <div className="header-actions">
                    <div className="user-info">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-role-badge">{user?.role}</div>
                        </div>
                    </div>

                    <Button variant="ghost" onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                    </Button>
                </div>
            </div>
        </header>
    )
}
