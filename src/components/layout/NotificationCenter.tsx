"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react'; // X for close, Trash2 for Clear All
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

// Basic Notification type (can be expanded later)
export interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp: string; // Using string for simplicity, can be Date
  read?: boolean;
}

interface NotificationCenterProps {
  isOpen?: boolean; // Visibility primarily handled by parent's conditional rendering
  onClose: () => void;
  // notifications prop will be removed, context will be used instead
  // onClearAll prop will be removed, context will be used instead
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  // notifications, // Removed from props
  // onClearAll, // Removed from props
}) => {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();
  // The component is expected to be conditionally rendered by its parent based on an 'isOpen' state.
  // The 'isOpen' prop here is mostly for symmetry or potential future internal animations.

  return (
    <div
      className={cn(
        "absolute top-12 right-0 bg-card border-b border-l border-border shadow-lg p-3 w-full max-w-sm md:w-80 print:hidden z-40 flex flex-col rounded-bl-lg max-h-[80vh]"
        // Similar positioning and base style to AppNavigationMenu, but potentially different width (max-w-sm, md:w-80)
      )}
      // max-h-[80vh] added above, this comment can be removed or kept for context on vh unit.
    >
      {/* Header Section */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">Notifications</h3>
        <div className="flex items-center space-x-1">
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications} // Use context function
              className="text-xs text-muted-foreground hover:text-destructive px-2"
              aria-label="Clear all notifications"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground h-7 w-7"
            aria-label="Close notification center"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification List Area */}
      <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            You have no new notifications.
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="relative bg-muted/40 rounded-md shadow-sm hover:bg-muted/60 transition-colors" // Outer container
            >
              {/* Placeholder for background action revealed on swipe */}
              {/*
              <div className="absolute top-0 right-0 h-full flex items-center justify-center bg-red-500 px-4 rounded-r-md opacity-0 group-hover/swipe:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="text-white" onClick={() => removeNotification(notification.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              */}

              {/* This div would be the one made draggable with framer-motion later */}
              <div className="p-2.5"> {/* Add padding back here for the content part */}
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-foreground">{notification.title}</h4>
                    {notification.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.description}
                      </p>
                    )}
                    <p className="text-[0.65rem] text-muted-foreground/80 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 text-muted-foreground hover:text-destructive h-6 w-6 shrink-0"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Comment indicating future enhancement */}
              {/* TODO: Implement slide-to-cancel/reveal-action functionality here using a gesture library like framer-motion.
                          The outer div would be the swipe target, the inner div would be the draggable element.
              */}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
