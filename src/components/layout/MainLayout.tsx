"use client"

import React from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import "./MainLayout.css"

export const MainLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <div className="main-layout">
            <Header onMenuClick={toggleMobileMenu} />
            <div className={`layout-body ${isMobileMenuOpen ? "mobile-open" : ""}`}>
                <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <main className="main-content">
                    <Outlet />
                </main>
                {/* Overlay for mobile */}
                {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
            </div>
        </div>
    )
}
