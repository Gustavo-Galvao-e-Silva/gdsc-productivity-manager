import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskComponent from './task';

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

interface ColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onTaskClick?: (taskId: string) => void;
}

const statusColors = {
    'todo': 'bg-slate-100 border-slate-200',
    'in-progress': 'bg-blue-50 border-blue-200',
    'review': 'bg-yellow-50 border-yellow-200',
    'done': 'bg-green-50 border-green-200'
};

const DroppableColumn: React.FC<ColumnProps> = ({
                                                    id,
                                                    title,
                                                    tasks,
                                                    onTaskClick
                                                }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'column',
            status: id
        }
    });

    return (
        <div className="flex-shrink-0 w-80">
            <div className={`
        rounded-lg p-4 h-full min-h-[600px] transition-all duration-200
        ${statusColors[id as keyof typeof statusColors] || 'bg-gray-100 border-gray-200'}
        ${isOver ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-lg' : ''}
        border-2 border-dashed
      `}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-gray-800">{title}</h2>
                    <div className="bg-white px-2 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-600">
              {tasks.length}
            </span>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    ref={setNodeRef}
                    className={`
            space-y-3 min-h-[500px] p-2 rounded-lg transition-all duration-200
            ${isOver ? 'bg-blue-100/50' : 'bg-transparent'}
          `}
                >
                    {tasks.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            {isOver ? 'Drop task here' : 'No tasks'}
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskComponent
                                key={task.id}
                                {...task}
                                onClick={onTaskClick}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DroppableColumn;