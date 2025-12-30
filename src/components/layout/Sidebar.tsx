"use client"

import type React from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
    LayoutDashboard,
    MapPin,
    TrendingUp,
    Users,
    FileText,
    Tag,
    ClipboardList,
    UserCheck,
    Truck,
    Package,
    Shield,
} from "lucide-react"
import "./Sidebar.css"

interface MenuItem {
    label: string
    path: string
    icon: React.ReactNode
    roles: string[]
}

const menuItems: MenuItem[] = [
    // Admin
    { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={24} />, roles: ["ADMIN"] },
    { label: "Seguimiento en Vivo", path: "/admin/tracking", icon: <MapPin size={24} />, roles: ["ADMIN"] },
    { label: "Rendimiento", path: "/admin/performance", icon: <TrendingUp size={24} />, roles: ["ADMIN"] },
    { label: "Usuarios", path: "/admin/users", icon: <Users size={24} />, roles: ["ADMIN"] },
    { label: "Sucursales", path: "/admin/branches", icon: <MapPin size={24} />, roles: ["ADMIN"] },
    { label: "Roles", path: "/admin/roles", icon: <Shield size={24} />, roles: ["ADMIN"] },
    { label: "Estados de Tarea", path: "/admin/task-statuses", icon: <ClipboardList size={24} />, roles: ["ADMIN"] },
    { label: "Categorías", path: "/admin/categories", icon: <Tag size={24} />, roles: ["ADMIN"] },
    { label: "Tipos de Operación", path: "/admin/task-types", icon: <FileText size={24} />, roles: ["ADMIN"] },
    { label: "Tareas", path: "/admin/tasks", icon: <ClipboardList size={24} />, roles: ["ADMIN"] },
    { label: "Clientes", path: "/admin/clients", icon: <UserCheck size={24} />, roles: ["ADMIN"] },

    // Asesor
    { label: "Dashboard", path: "/asesor/dashboard", icon: <LayoutDashboard size={24} />, roles: ["ASESOR"] },
    { label: "Tareas", path: "/asesor/tasks", icon: <ClipboardList size={24} />, roles: ["ASESOR"] },
    { label: "Clientes", path: "/asesor/clients", icon: <UserCheck size={24} />, roles: ["ASESOR"] },

    // Supervisor
    { label: "Dashboard", path: "/supervisor/dashboard", icon: <LayoutDashboard size={24} />, roles: ["SUPERVISOR"] },
    { label: "Asignación de Tareas", path: "/supervisor/assignment", icon: <Truck size={24} />, roles: ["SUPERVISOR"] },

    // Mensajero
    { label: "Dashboard", path: "/mensajero/dashboard", icon: <LayoutDashboard size={24} />, roles: ["MENSAJERO"] },
    { label: "Mis Tareas", path: "/mensajero/tasks", icon: <Package size={24} />, roles: ["MENSAJERO"] },
]

interface SidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const { user } = useAuth()

    const userMenuItems = menuItems.filter((item) => (user?.role ? item.roles.includes(user.role) : false))

    return (
        <aside className={`sidebar ${isOpen ? "sidebar-mobile-open" : ""}`}>
            <nav className="sidebar-nav">
                {userMenuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        data-tooltip={item.label}
                        className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span className="sidebar-link-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}
