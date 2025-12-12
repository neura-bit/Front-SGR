import React, { useState, useMemo } from 'react';
import type { Task } from '../../../types/index';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import './AsesorTasks.css';

interface TaskCalendarProps {
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    getTaskStatusName: (id: string) => string;
}

interface DayPopupData {
    dateStr: string;
    dayNumber: number;
    tasks: Task[];
}

export const TaskCalendar: React.FC<TaskCalendarProps> = ({
    tasks,
    onTaskClick,
    getTaskStatusName,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dayPopup, setDayPopup] = useState<DayPopupData | null>(null);

    // Get first day of month and number of days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const grouped: Record<string, Task[]> = {};
        tasks.forEach(task => {
            if (task.fechaInicio) {
                const dateKey = task.fechaInicio.split('T')[0]; // YYYY-MM-DD
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(task);
            }
        });
        return grouped;
    }, [tasks]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleShowMoreClick = (dateStr: string, dayNumber: number, dayTasks: Task[]) => {
        setDayPopup({
            dateStr,
            dayNumber,
            tasks: dayTasks,
        });
    };

    const closeDayPopup = () => {
        setDayPopup(null);
    };

    const handleTaskClickInPopup = (task: Task) => {
        closeDayPopup();
        onTaskClick(task);
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''} ${dayTasks.length > 0 ? 'has-tasks' : ''}`}
                >
                    <span className="calendar-day-number">{day}</span>
                    <div className="calendar-day-tasks">
                        {dayTasks.slice(0, 3).map(task => (
                            <div
                                key={task.id}
                                className={`calendar-task ${task.proceso ? 'active' : 'completed'}`}
                                onClick={() => onTaskClick(task)}
                                title={task.nombre}
                            >
                                <span className="calendar-task-name">{task.nombre}</span>
                            </div>
                        ))}
                        {dayTasks.length > 3 && (
                            <div
                                className="calendar-more-tasks"
                                onClick={() => handleShowMoreClick(dateStr, day, dayTasks)}
                            >
                                +{dayTasks.length - 3} más
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    // Count tasks for current month
    const currentMonthTasks = useMemo(() => {
        return tasks.filter(task => {
            if (!task.fechaInicio) return false;
            const taskDate = new Date(task.fechaInicio);
            return taskDate.getMonth() === month && taskDate.getFullYear() === year;
        }).length;
    }, [tasks, month, year]);

    return (
        <div className="task-calendar">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button onClick={() => navigateMonth('prev')} className="calendar-nav-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="calendar-title">
                        {monthNames[month]} {year}
                    </h2>
                    <button onClick={() => navigateMonth('next')} className="calendar-nav-btn">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="calendar-actions">
                    <span className="calendar-task-count">
                        <Clock size={16} />
                        {currentMonthTasks} tareas este mes
                    </span>
                    <button onClick={goToToday} className="calendar-today-btn">
                        Hoy
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {/* Day headers */}
                {dayNames.map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {renderCalendarDays()}
            </div>

            {/* Day Tasks Popup */}
            {dayPopup && (
                <div className="day-popup-overlay" onClick={closeDayPopup}>
                    <div className="day-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="day-popup-header">
                            <h3>
                                {dayPopup.dayNumber} de {monthNames[month]}
                            </h3>
                            <span className="day-popup-count">
                                {dayPopup.tasks.length} tareas
                            </span>
                            <button onClick={closeDayPopup} className="day-popup-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="day-popup-tasks">
                            {dayPopup.tasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`day-popup-task ${task.proceso ? 'active' : 'completed'}`}
                                    onClick={() => handleTaskClickInPopup(task)}
                                >
                                    <span className="day-popup-task-name">{task.nombre}</span>
                                    <span className={`day-popup-task-status ${task.proceso ? 'active' : 'completed'}`}>
                                        {getTaskStatusName(task.taskStatusId)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
