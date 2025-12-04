import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
    User,
    Client,
    Task,
    Category,
    TaskType,
    CourierLocation,
    PerformanceMetrics,
    DashboardStats,
    Branch,
    Role,
    TaskStatusEntity,
} from '../types/index';
import {
    mockTasks,
    mockTaskTypes,
    mockCourierLocations,
    mockPerformanceMetrics,
} from '../utils/mockData';

interface DataContextType {
    // Users
    users: User[];
    addUser: (user: Omit<User, 'id'>) => Promise<boolean>;
    updateUser: (id: string, user: Partial<User>) => Promise<boolean>;
    deleteUser: (id: string) => Promise<boolean>;
    refreshUsers: () => Promise<void>;

    // Clients
    clients: Client[];
    addClient: (client: Client) => Promise<boolean>;
    updateClient: (id: string, client: Partial<Client>) => Promise<boolean>;
    deleteClient: (id: string) => Promise<boolean>;
    refreshClients: () => Promise<void>;

    // Tasks
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => Promise<boolean>;
    updateTask: (id: string, task: Partial<Task>) => Promise<boolean>;
    deleteTask: (id: string) => Promise<boolean>;
    refreshTasks: () => Promise<void>;

    // Categories
    categories: Category[];
    addCategory: (category: Category) => Promise<boolean>;
    updateCategory: (id: string, category: Partial<Category>) => Promise<boolean>;
    deleteCategory: (id: string) => Promise<boolean>;
    refreshCategories: () => Promise<void>;

    // Task Types
    taskTypes: TaskType[];
    addTaskType: (taskType: Omit<TaskType, 'id'>) => Promise<boolean>;
    updateTaskType: (id: string, taskType: Partial<TaskType>) => Promise<boolean>;
    deleteTaskType: (id: string) => Promise<boolean>;
    refreshTaskTypes: () => Promise<void>;

    // Courier Locations
    courierLocations: CourierLocation[];

    // Branches
    branches: Branch[];
    addBranch: (branch: Branch) => Promise<boolean>;
    updateBranch: (id: string, branch: Partial<Branch>) => Promise<boolean>;
    deleteBranch: (id: string) => Promise<boolean>;
    refreshBranches: () => Promise<void>;

    // Roles
    roles: Role[];
    addRole: (role: Role) => Promise<boolean>;
    updateRole: (id: string, role: Partial<Role>) => Promise<boolean>;
    deleteRole: (id: string) => Promise<boolean>;
    refreshRoles: () => Promise<void>;

    // Task Statuses
    taskStatuses: TaskStatusEntity[];
    addTaskStatus: (taskStatus: TaskStatusEntity) => Promise<boolean>;
    updateTaskStatus: (id: string, taskStatus: Partial<TaskStatusEntity>) => Promise<boolean>;
    deleteTaskStatus: (id: string) => Promise<boolean>;
    refreshTaskStatuses: () => Promise<void>;

    // Performance Metrics
    performanceMetrics: PerformanceMetrics[];

    // Dashboard Stats
    getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [taskTypes, setTaskTypes] = useState<TaskType[]>(mockTaskTypes);
    const [courierLocations, setCourierLocations] = useState<CourierLocation[]>(mockCourierLocations);
    const [performanceMetrics] = useState<PerformanceMetrics[]>(mockPerformanceMetrics);

    // Simulate real-time location updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCourierLocations((prev) =>
                prev.map((loc) => ({
                    ...loc,
                    location: {
                        lat: loc.location.lat + (Math.random() - 0.5) * 0.002,
                        lng: loc.location.lng + (Math.random() - 0.5) * 0.002,
                    },
                    timestamp: new Date(),
                }))
            );
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // User CRUD
    const [users, setUsers] = useState<User[]>([]);

    const refreshUsers = async () => {
        try {
            const { userService } = await import('../services/userService');
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const addUser = async (user: Omit<User, 'id'>): Promise<boolean> => {
        try {
            const { userService } = await import('../services/userService');
            const newUser = await userService.create(user);
            setUsers((prev) => [...prev, newUser]);
            return true;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    };

    const updateUser = async (id: string, updated: Partial<User>): Promise<boolean> => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));

        try {
            const { userService } = await import('../services/userService');
            const updatedUser = await userService.update(id, updated);
            setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
            return true;
        } catch (error) {
            console.error('Failed to update user:', error);
            const { userService } = await import('../services/userService');
            const data = await userService.getAll();
            setUsers(data);
            throw error;
        }
    };

    const deleteUser = async (id: string): Promise<boolean> => {
        setUsers((prev) => prev.filter((u) => u.id !== id));

        try {
            const { userService } = await import('../services/userService');
            await userService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete user:', error);
            const { userService } = await import('../services/userService');
            const data = await userService.getAll();
            setUsers(data);
            throw error;
        }
    };

    // Client CRUD
    const [clients, setClients] = useState<Client[]>([]);

    const refreshClients = async () => {
        try {
            const { clientService } = await import('../services/clientService');
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const addClient = async (client: Client): Promise<boolean> => {
        try {
            const { clientService } = await import('../services/clientService');
            const newClient = await clientService.create(client);
            setClients((prev) => [...prev, newClient]);
            return true;
        } catch (error) {
            console.error('Failed to create client:', error);
            throw error;
        }
    };

    const updateClient = async (id: string, updated: Partial<Client>): Promise<boolean> => {
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));

        try {
            const { clientService } = await import('../services/clientService');
            const updatedClient = await clientService.update(id, updated);
            setClients((prev) => prev.map((c) => (c.id === id ? updatedClient : c)));
            return true;
        } catch (error) {
            console.error('Failed to update client:', error);
            const { clientService } = await import('../services/clientService');
            const data = await clientService.getAll();
            setClients(data);
            throw error;
        }
    };

    const deleteClient = async (id: string): Promise<boolean> => {
        setClients((prev) => prev.filter((c) => c.id !== id));

        try {
            const { clientService } = await import('../services/clientService');
            await clientService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete client:', error);
            const { clientService } = await import('../services/clientService');
            const data = await clientService.getAll();
            setClients(data);
            throw error;
        }
    };

    // Task CRUD
    const refreshTasks = async () => {
        try {
            const { taskService } = await import('../services/taskService');
            const data = await taskService.getAll();
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    const addTask = async (task: Omit<Task, 'id'>): Promise<boolean> => {
        try {
            const { taskService } = await import('../services/taskService');
            const newTask = await taskService.create(task);
            setTasks((prev) => [...prev, newTask]);
            return true;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    };

    const updateTask = async (id: string, updated: Partial<Task>): Promise<boolean> => {
        // Optimistic update
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));

        try {
            const { taskService } = await import('../services/taskService');
            const updatedTask = await taskService.update(id, updated);
            // Update with actual server response
            setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
            return true;
        } catch (error) {
            console.error('Failed to update task:', error);
            // Revert by re-fetching
            const { taskService } = await import('../services/taskService');
            const data = await taskService.getAll();
            setTasks(data);
            throw error;
        }
    };

    const deleteTask = async (id: string): Promise<boolean> => {
        // Optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== id));

        try {
            const { taskService } = await import('../services/taskService');
            await taskService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete task:', error);
            // Revert by re-fetching
            const { taskService } = await import('../services/taskService');
            const data = await taskService.getAll();
            setTasks(data);
            throw error;
        }
    };

    // Category CRUD
    const [categories, setCategories] = useState<Category[]>([]);

    const refreshCategories = async () => {
        try {
            const { categoryService } = await import('../services/categoryService');
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const addCategory = async (category: Category): Promise<boolean> => {
        try {
            const { categoryService } = await import('../services/categoryService');
            const newCategory = await categoryService.create(category);
            setCategories((prev) => [...prev, newCategory]);
            return true;
        } catch (error) {
            console.error('Failed to create category:', error);
            throw error;
        }
    };

    const updateCategory = async (id: string, updated: Partial<Category>): Promise<boolean> => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));

        try {
            const { categoryService } = await import('../services/categoryService');
            const updatedCategory = await categoryService.update(id, updated);
            setCategories((prev) => prev.map((c) => (c.id === id ? updatedCategory : c)));
            return true;
        } catch (error) {
            console.error('Failed to update category:', error);
            const { categoryService } = await import('../services/categoryService');
            const data = await categoryService.getAll();
            setCategories(data);
            throw error;
        }
    };

    const deleteCategory = async (id: string): Promise<boolean> => {
        setCategories((prev) => prev.filter((c) => c.id !== id));

        try {
            const { categoryService } = await import('../services/categoryService');
            await categoryService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete category:', error);
            const { categoryService } = await import('../services/categoryService');
            const data = await categoryService.getAll();
            setCategories(data);
            throw error;
        }
    };

    // TaskType CRUD
    const refreshTaskTypes = async () => {
        try {
            const { taskTypeService } = await import('../services/taskTypeService');
            const data = await taskTypeService.getAll();
            setTaskTypes(data);
        } catch (error) {
            console.error('Failed to fetch task types:', error);
        }
    };

    const addTaskType = async (taskType: Omit<TaskType, 'id'>): Promise<boolean> => {
        try {
            const { taskTypeService } = await import('../services/taskTypeService');
            const newTaskType = await taskTypeService.create(taskType);
            setTaskTypes((prev) => [...prev, newTaskType]);
            return true;
        } catch (error) {
            console.error('Failed to create task type:', error);
            throw error;
        }
    };

    const updateTaskType = async (id: string, updated: Partial<TaskType>): Promise<boolean> => {
        setTaskTypes((prev) => prev.map((tt) => (tt.id === id ? { ...tt, ...updated } : tt)));

        try {
            const { taskTypeService } = await import('../services/taskTypeService');
            const updatedTaskType = await taskTypeService.update(id, updated);
            setTaskTypes((prev) => prev.map((tt) => (tt.id === id ? updatedTaskType : tt)));
            return true;
        } catch (error) {
            console.error('Failed to update task type:', error);
            const { taskTypeService } = await import('../services/taskTypeService');
            const data = await taskTypeService.getAll();
            setTaskTypes(data);
            throw error;
        }
    };

    const deleteTaskType = async (id: string): Promise<boolean> => {
        setTaskTypes((prev) => prev.filter((tt) => tt.id !== id));

        try {
            const { taskTypeService } = await import('../services/taskTypeService');
            await taskTypeService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete task type:', error);
            const { taskTypeService } = await import('../services/taskTypeService');
            const data = await taskTypeService.getAll();
            setTaskTypes(data);
            throw error;
        }
    };

    // Branch CRUD
    const [branches, setBranches] = useState<Branch[]>([]);

    const refreshBranches = async () => {
        try {
            const { branchService } = await import('../services/branchService');
            const data = await branchService.getAll();
            setBranches(data);
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        }
    };

    const addBranch = async (branch: Branch): Promise<boolean> => {
        try {
            const { branchService } = await import('../services/branchService');
            // We pass the branch data without ID as the backend generates it
            const newBranch = await branchService.create(branch);
            setBranches((prev) => [...prev, newBranch]);
            return true;
        } catch (error) {
            console.error('Failed to create branch:', error);
            throw error;
        }
    };

    const updateBranch = async (id: string, updated: Partial<Branch>): Promise<boolean> => {
        // Optimistic update
        setBranches((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));

        try {
            const { branchService } = await import('../services/branchService');
            const updatedBranch = await branchService.update(id, updated);
            // Update with actual server response
            setBranches((prev) => prev.map((b) => (b.id === id ? updatedBranch : b)));
            return true;
        } catch (error) {
            console.error('Failed to update branch:', error);
            // Revert by re-fetching
            const { branchService } = await import('../services/branchService');
            const data = await branchService.getAll();
            setBranches(data);
            throw error;
        }
    };

    const deleteBranch = async (id: string): Promise<boolean> => {
        // Optimistic update
        setBranches((prev) => prev.filter((b) => b.id !== id));

        try {
            const { branchService } = await import('../services/branchService');
            await branchService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete branch:', error);
            // Revert by re-fetching
            const { branchService } = await import('../services/branchService');
            const data = await branchService.getAll();
            setBranches(data);
            throw error;
        }
    };

    // Role CRUD
    const [roles, setRoles] = useState<Role[]>([]);

    const refreshRoles = async () => {
        try {
            const { roleService } = await import('../services/roleService');
            const data = await roleService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const addRole = async (role: Role): Promise<boolean> => {
        try {
            const { roleService } = await import('../services/roleService');
            const newRole = await roleService.create(role);
            setRoles((prev) => [...prev, newRole]);
            return true;
        } catch (error) {
            console.error('Failed to create role:', error);
            throw error;
        }
    };

    const updateRole = async (id: string, updated: Partial<Role>): Promise<boolean> => {
        // Optimistic update
        setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));

        try {
            const { roleService } = await import('../services/roleService');
            const updatedRole = await roleService.update(id, updated);
            // Update with actual server response
            setRoles((prev) => prev.map((r) => (r.id === id ? updatedRole : r)));
            return true;
        } catch (error) {
            console.error('Failed to update role:', error);
            // Revert by re-fetching
            const { roleService } = await import('../services/roleService');
            const data = await roleService.getAll();
            setRoles(data);
            throw error;
        }
    };

    const deleteRole = async (id: string): Promise<boolean> => {
        // Optimistic update
        setRoles((prev) => prev.filter((r) => r.id !== id));

        try {
            const { roleService } = await import('../services/roleService');
            await roleService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete role:', error);
            // Revert by re-fetching
            const { roleService } = await import('../services/roleService');
            const data = await roleService.getAll();
            setRoles(data);
            throw error;
        }
    };

    // Task Status CRUD
    const [taskStatuses, setTaskStatuses] = useState<TaskStatusEntity[]>([]);

    const refreshTaskStatuses = async () => {
        try {
            const { taskStatusService } = await import('../services/taskStatusService');
            const data = await taskStatusService.getAll();
            setTaskStatuses(data);
        } catch (error) {
            console.error('Failed to fetch task statuses:', error);
        }
    };

    const addTaskStatus = async (taskStatus: TaskStatusEntity): Promise<boolean> => {
        try {
            const { taskStatusService } = await import('../services/taskStatusService');
            const newTaskStatus = await taskStatusService.create(taskStatus);
            setTaskStatuses((prev) => [...prev, newTaskStatus]);
            return true;
        } catch (error) {
            console.error('Failed to create task status:', error);
            throw error;
        }
    };

    const updateTaskStatus = async (id: string, updated: Partial<TaskStatusEntity>): Promise<boolean> => {
        // Optimistic update
        setTaskStatuses((prev) => prev.map((ts) => (ts.id === id ? { ...ts, ...updated } : ts)));

        try {
            const { taskStatusService } = await import('../services/taskStatusService');
            const updatedTaskStatus = await taskStatusService.update(id, updated);
            // Update with actual server response
            setTaskStatuses((prev) => prev.map((ts) => (ts.id === id ? updatedTaskStatus : ts)));
            return true;
        } catch (error) {
            console.error('Failed to update task status:', error);
            // Revert by re-fetching
            const { taskStatusService } = await import('../services/taskStatusService');
            const data = await taskStatusService.getAll();
            setTaskStatuses(data);
            throw error;
        }
    };

    const deleteTaskStatus = async (id: string): Promise<boolean> => {
        // Optimistic update
        setTaskStatuses((prev) => prev.filter((ts) => ts.id !== id));

        try {
            const { taskStatusService } = await import('../services/taskStatusService');
            await taskStatusService.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete task status:', error);
            // Revert by re-fetching
            const { taskStatusService } = await import('../services/taskStatusService');
            const data = await taskStatusService.getAll();
            setTaskStatuses(data);
            throw error;
        }
    };

    // Dashboard Stats
    const getDashboardStats = (): DashboardStats => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const completedToday = tasks.filter((t) => {
            if (!t.fechaFin) return false;
            const completedDate = new Date(t.fechaFin);
            completedDate.setHours(0, 0, 0, 0);
            return completedDate.getTime() === today.getTime();
        }).length;

        const activeCouriers = courierLocations.length;
        // For now, we'll consider tasks with proceso=true as active
        const activeTasks = tasks.filter((t) => t.proceso).length;
        // Tasks without fechaFin and proceso=true could be considered pending
        const pendingTasks = tasks.filter((t) => !t.fechaFin && t.proceso).length;

        return {
            totalTasks: tasks.length,
            activeTasks,
            completedToday,
            activeCouriers,
            pendingTasks,
        };
    };

    return (
        <DataContext.Provider
            value={{
                users,
                addUser,
                updateUser,
                deleteUser,
                refreshUsers,
                clients,
                addClient,
                updateClient,
                deleteClient,
                refreshClients,
                tasks,
                addTask,
                updateTask,
                deleteTask,
                refreshTasks,
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                refreshCategories,
                taskTypes,
                addTaskType,
                updateTaskType,
                deleteTaskType,
                refreshTaskTypes,
                branches,
                addBranch,
                updateBranch,
                deleteBranch,
                refreshBranches,
                roles,
                addRole,
                updateRole,
                deleteRole,
                refreshRoles,
                taskStatuses,
                addTaskStatus,
                updateTaskStatus,
                deleteTaskStatus,
                refreshTaskStatuses,
                courierLocations,
                performanceMetrics,
                getDashboardStats,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
