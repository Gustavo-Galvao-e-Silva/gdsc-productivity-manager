import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, User } from 'lucide-react';

// Types
interface Assignee {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
}

interface TaskProps {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    assignees: Assignee[];
    priority?: 'low' | 'medium' | 'high';
    onClick?: (taskId: string) => void;
    isDragOverlay?: boolean;
}

// Status color mapping
const statusColors = {
    'todo': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    'in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'review': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'done': 'bg-green-100 text-green-800 hover:bg-green-200'
};

// Priority color mapping
const priorityColors = {
    'low': 'border-l-green-400',
    'medium': 'border-l-yellow-400',
    'high': 'border-l-red-400'
};

// Helper function to format date
const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
};

// Helper function to check if date is overdue
const isOverdue = (date: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
};

// Helper function to get initials
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
};

const TaskComponent: React.FC<TaskProps> = ({
                                                id,
                                                title,
                                                description,
                                                dueDate,
                                                status,
                                                assignees,
                                                priority = 'medium',
                                                onClick,
                                                isDragOverlay = false
                                            }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: id,
        data: {
            type: 'task',
            task: { id, title, description, dueDate, status, assignees, priority }
        }
    });

    const handleClick = (e: React.MouseEvent) => {
        // Prevent click when dragging
        if (isDragging) return;

        if (onClick) {
            onClick(id);
        }
    };

    const isTaskOverdue = dueDate ? isOverdue(dueDate) : false;

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
        cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md
        border-l-4 ${priorityColors[priority]}
        ${isDragging ? 'opacity-50 rotate-5 shadow-2xl' : 'hover:-translate-y-1'}
        ${isDragOverlay ? 'shadow-2xl rotate-5' : ''}
        ${onClick && !isDragging ? 'hover:bg-gray-50' : ''}
        touch-none select-none
      `}
            onClick={handleClick}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1 mr-2">
                        {title}
                    </h3>

                    <Badge
                        variant="secondary"
                        className={`text-xs font-medium ${statusColors[status]} shrink-0`}
                    >
                        {status.replace('-', ' ')}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Due Date */}
                {dueDate && (
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span
                            className={`text-sm font-medium ${
                                isTaskOverdue
                                    ? 'text-red-600'
                                    : status === 'done'
                                        ? 'text-gray-500'
                                        : 'text-gray-700'
                            }`}
                        >
              {formatDate(dueDate)}
            </span>
                        {isTaskOverdue && status !== 'done' && (
                            <Badge variant="destructive" className="text-xs px-2 py-0">
                                Overdue
                            </Badge>
                        )}
                    </div>
                )}

                {/* Assignees */}
                {assignees.length > 0 && (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex items-center -space-x-2">
                            {assignees.slice(0, 3).map((assignee, index) => (
                                <Avatar
                                    key={assignee.id}
                                    className="h-6 w-6 border-2 border-white shadow-sm"
                                    style={{ zIndex: assignees.length - index }}
                                >
                                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                        {getInitials(assignee.name)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {assignees.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{assignees.length - 3}
                  </span>
                                </div>
                            )}
                        </div>
                        {assignees.length === 1 && (
                            <span className="text-xs text-gray-500 ml-1 truncate max-w-[100px]">
                {assignees[0].name}
              </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TaskComponent;