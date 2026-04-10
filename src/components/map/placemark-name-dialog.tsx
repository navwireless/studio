"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlacemarkNameDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Default name suggestion */
  defaultName: string;
  /** Callback when name is confirmed */
  onConfirm: (name: string) => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
}

/**
 * Dialog for naming a placemark after placement.
 * Features:
 * - Auto-focuses input field
 * - ESC key cancels
 * - ENTER key saves
 * - Default name suggested
 */
export function PlacemarkNameDialog({
  open,
  onOpenChange,
  defaultName,
  onConfirm,
  onCancel,
}: PlacemarkNameDialogProps) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset name when dialog opens with new default
  useEffect(() => {
    if (open) {
      setName(defaultName);
      // Focus input after a brief delay to ensure dialog is rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select(); // Select all text for easy replacement
      }, 50);
    }
  }, [open, defaultName]);

  const handleConfirm = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'z-50 w-full max-w-md',
            'rounded-xl border border-surface-border',
            'bg-surface-card shadow-xl',
            'p-6',
            'animate-in fade-in zoom-in-95 duration-200'
          )}
          onEscapeKeyDown={handleCancel}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-text-brand-primary">
              Name Placemark
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                onClick={handleCancel}
                className="rounded-lg p-1.5 text-text-brand-muted hover:text-text-brand-secondary hover:bg-surface-hover transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Description */}
          <Dialog.Description className="text-sm text-text-brand-secondary mb-4">
            Enter a name for this placemark. You can edit it later from the properties menu.
          </Dialog.Description>

          {/* Input */}
          <div className="mb-6">
            <label htmlFor="placemark-name" className="block text-sm font-medium text-text-brand-primary mb-2">
              Placemark Name
            </label>
            <input
              ref={inputRef}
              id="placemark-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter name..."
              maxLength={50}
              className={cn(
                'w-full px-3 py-2 rounded-lg',
                'bg-surface-input border border-surface-border',
                'text-text-brand-primary placeholder:text-text-brand-muted',
                'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                'transition-colors'
              )}
              autoFocus
            />
            <p className="text-xs text-text-brand-muted mt-1">
              {name.length}/50 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'text-text-brand-secondary',
                'hover:bg-surface-hover',
                'transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!name.trim()}
              className={cn(
                'px-4 py-2 rounded-lg',
                'text-sm font-medium',
                'bg-brand-500 text-white',
                'hover:bg-brand-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              Save
            </button>
          </div>

          {/* Keyboard hints */}
          <div className="mt-4 pt-4 border-t border-surface-border">
            <p className="text-xs text-text-brand-muted text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-hover text-text-brand-secondary font-mono">Enter</kbd> to save or{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-surface-hover text-text-brand-secondary font-mono">Esc</kbd> to cancel
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
