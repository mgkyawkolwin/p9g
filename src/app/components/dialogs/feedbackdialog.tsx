// components/FeedbackDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/lib/components/web/react/ui/dialog';
import { Button } from '@/lib/components/web/react/ui/button';
import { Textarea } from '@/lib/components/web/react/ui/textarea';

interface FeedbackDialogProps {
  isOpen: boolean;
  reservationId: string;
  initialFeedback?: string;
  onFeedbackSaved: (reservationId: string, feedback: string) => void;
  onOpenChanged: () => void;
  title?: string;
  description?: string;
}

export default function FeedbackDialog({
  isOpen,
  reservationId,
  initialFeedback = '',
  onFeedbackSaved,
  onOpenChanged,
  title = 'Feedback',
  description = 'Please provide your feedback below',
} : FeedbackDialogProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset feedback when dialog opens or initialFeedback changes
  useEffect(() => {
    if (isOpen) {
      setFeedback(initialFeedback);
    }
  }, [isOpen, initialFeedback]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      onFeedbackSaved(reservationId, feedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedback(initialFeedback); // Reset to initial value
    onOpenChanged();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChanged}>
      <DialogContent className="flex flex-col min-w-[70vw] h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Your Feedback
            </label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here..."
              className="flex-auto"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button className='bg-green-600 hover:bg-green-700'
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || feedback.trim() === initialFeedback.trim()}
          >
            {isSubmitting ? 'Saving...' : 'Save Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};