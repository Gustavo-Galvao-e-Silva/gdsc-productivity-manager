"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

// Types
interface SidebarButton {
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    badge?: string | number;
    onClick?: () => void;
}

interface LayoutProps {
    children: React.ReactNode;
    logoSrc?: string;
    logoText?: string;
    activeButton?: string;
    onButtonClick?: (buttonId: string) => void;
    customButtons?: SidebarButton[];
}

// Default navigation buttons
const defaultButtons: SidebarButton[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: '/dashboard'
    },
    {
        id: 'tasks',
        label: 'Tasks',
        icon: <CheckSquare className="h-5 w-5" />,
        href: '/tasks',
        badge: 12
    },
    {
        id: 'team',
        label: 'Team',
        icon: <Users className="h-5 w-5" />,
        href: '/team',
        badge: 'New'
    }
];

const Sidebar: React.FC<LayoutProps> = ({
                                                  children,
                                                  logoSrc,
                                                  logoText = "TaskFlow",
                                                  activeButton = 'dashboard',
                                                  onButtonClick,
                                                  customButtons = defaultButtons
                                              }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    const handleButtonClick = (button: SidebarButton) => {
        if (button.onClick) {
            button.onClick();
        } else if (onButtonClick) {
            onButtonClick(button.id);
        }

        // Close mobile sidebar after click
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }

        console.log(`Clicked: ${button.label}`);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            {logoSrc ? (
                                <img
                                    src={logoSrc}
                                    alt={logoText}
                                    className="h-8 w-8 rounded-lg shadow-sm"
                                />
                            ) : (
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {logoText.charAt(0)}
                  </span>
                                </div>
                            )}
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                {logoText}
              </span>
                        </div>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <nav className="flex-1 p-4 space-y-2">
                        {customButtons.map((button) => (
                            <button
                                key={button.id}
                                onClick={() => handleButtonClick(button)}
                                onMouseEnter={() => setHoveredButton(button.id)}
                                onMouseLeave={() => setHoveredButton(null)}
                                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg
                  transition-all duration-200 group text-left
                  ${activeButton === button.id
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                }
                  ${hoveredButton === button.id ? 'transform translate-x-1' : ''}
                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`
                    transition-colors duration-200
                    ${activeButton === button.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                  `}>
                                        {button.icon}
                                    </div>
                                    <span className="font-medium">
                    {button.label}
                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {button.badge && (
                                        <Badge
                                            variant={activeButton === button.id ? "default" : "secondary"}
                                            className={`
                        text-xs px-2 py-1
                        ${activeButton === button.id
                                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-600'
                                            }
                      `}
                                        >
                                            {button.badge}
                                        </Badge>
                                    )}

                                    {hoveredButton === button.id && (
                                        <ChevronRight className="h-4 w-4 text-gray-400 transition-opacity duration-200" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Footer/User Section */}
                    <div className="p-4 border-t border-gray-200">
                        <Card className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold">JD</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        John Doe
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        john@example.com
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Menu className="h-6 w-6 text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-900">{logoText}</span>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Sidebar;