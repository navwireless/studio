'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ErrorModalProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
  title?: string;
}

export function ErrorModal({ message, onDismiss, onRetry, title }: ErrorModalProps) {
  return (
    <Dialog open={!!message} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md bg-destructive/95 border-destructive-foreground/20">
        <DialogHeader className="flex flex-col items-center sm:items-start">
          <DialogTitle className="flex items-center text-destructive-foreground gap-2 text-xl">
            <AlertTriangle className="h-6 w-6" />
            {title || "Analysis Error"}
          </DialogTitle>
          <DialogDescription className="text-destructive-foreground/90 mt-2 text-left w-full whitespace-pre-wrap">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onDismiss} className="bg-transparent border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10 hover:text-white">
            Dismiss
          </Button>
          {onRetry && (
             <Button type="button" variant="secondary" onClick={() => { onDismiss(); onRetry(); }} className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90 font-semibold">
              Retry Analysis
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
