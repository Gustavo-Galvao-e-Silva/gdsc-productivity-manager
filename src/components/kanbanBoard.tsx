"use client"

import React, { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import DroppableColumn from '@/components/taskColumn';
import TaskComponent from '@/components/task';

// Types
interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    assignees: Array<{
        id: string;
        name: string;
        avatar?: string;
        email?: string;
    }>;
    priority?: 'low' | 'medium' | 'high';
}

interface KanbanBoardProps {
    initialTasks?: Task[];
    onTaskUpdate?: (taskId: string, newStatus: Task['status']) => void;
    onTaskClick?: (taskId: string) => void;
}

// Sample data
const defaultTasks: Task[] = [
    {
        id: "1",
        title: "Design user interface mockups",
        description: "Create wireframes and high-fidelity designs for the new dashboard",
        dueDate: new Date('2024-06-15'),
        status: "todo",
        assignees: [
            { id: "1", name: "Alice Johnson" },
            { id: "2", name: "Bob Smith" }
        ],
        priority: "high"
    },
    {
        id: "2",
        title: "Implement API endpoints",
        description: "Build REST API for user management and task operations",
        dueDate: new Date('2024-06-10'),
        status: "in-progress",
        assignees: [
            { id: "3", name: "Charlie Brown" }
        ],
        priority: "medium"
    },
    {
        id: "3",
        title: "Write unit tests",
        description: "Comprehensive testing for all components and API endpoints",
        dueDate: new Date('2024-06-20'),
        status: "review",
        assignees: [
            { id: "1", name: "Alice Johnson" },
            { id: "4", name: "Diana Prince" },
            { id: "5", name: "Eve Wilson" },
            { id: "6", name: "Frank Miller" }
        ],
        priority: "low"
    },
    {
        id: "4",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
        dueDate: new Date('2024-06-05'),
        status: "done",
        assignees: [
            { id: "2", name: "Bob Smith" }
        ],
        priority: "high"
    },
    {
        id: "5",
        title: "Database optimization",
        description: "Improve query performance and add proper indexing",
        dueDate: new Date('2024-06-25'),
        status: "todo",
        assignees: [
            { id: "3", name: "Charlie Brown" },
            { id: "5", name: "Eve Wilson" }
        ],
        priority: "medium"
    }
];

const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
                                                     initialTasks = defaultTasks,
                                                     onTaskUpdate,
                                                     onTaskClick
                                                 }) => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Configure sensors for better touch/mouse support
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        const taskId = active.id as string;
        const overId = over.id as string;

        // Find the task being dragged
        const draggedTask = tasks.find(task => task.id === taskId);
        if (!draggedTask) {
            setActiveTask(null);
            return;
        }

        // Determine the new status
        let newStatus: Task['status'];

        // Check if dropped on a column directly
        if (['todo', 'in-progress', 'review', 'done'].includes(overId)) {
            newStatus = overId as Task['status'];
        } else {
            // If dropped on a task, get the status of that task's column
            const targetTask = tasks.find(task => task.id === overId);
            if (targetTask) {
                newStatus = targetTask.status;
            } else {
                setActiveTask(null);
                return;
            }
        }

        // Update the task status if it changed
        if (draggedTask.status !== newStatus) {
            const updatedTasks = tasks.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus }
                    : task
            );

            setTasks(updatedTasks);

            // Call the callback if provided
            if (onTaskUpdate) {
                onTaskUpdate(taskId, newStatus);
            }

            console.log(`Task "${draggedTask.title}" moved to ${newStatus}`);
        }

        setActiveTask(null);
    };

    const getTasksByStatus = (status: Task['status']) => {
        return tasks.filter(task => task.status === status);
    };

    const handleTaskClick = (taskId: string) => {
        console.log(`Clicked task: ${taskId}`);
        if (onTaskClick) {
            onTaskClick(taskId);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
                <p className="text-gray-600 mt-2">
                    Drag and drop tasks between columns to update their status
                </p>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-6">
                    {columns.map((column) => (
                        <DroppableColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            tasks={getTasksByStatus(column.id as Task['status'])}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeTask ? (
                        <TaskComponent
                            {...activeTask}
                            isDragOverlay={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;