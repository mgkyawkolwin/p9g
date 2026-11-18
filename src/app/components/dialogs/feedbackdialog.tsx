// components/FeedbackDialog.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ClipboardPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import DataTable from '@/lib/components/web/react/uicustom/datatable';
import { FormState } from '@/core/types';
import { useParams } from 'next/navigation';

interface FeedbackRow {
  id: string;
  feedback: string | null;
  isTaskCreated: boolean;
}

interface FeedbackDialogProps {
  isOpen: boolean;
  reservationId: string;
  customerId: string;
  onFeedbackChanged: (reservationId: string, customerId: string, total: number) => void;
  onOpenChanged: () => void;
  title?: string;
  description?: string;
}

export default function FeedbackDialog({
  isOpen,
  reservationId,
  customerId,
  onFeedbackChanged,
  onOpenChanged,
  title = 'Feedback',
  description = 'Please provide your feedback below',
} : FeedbackDialogProps) {
  const params = useParams();
  const location = params.location as string;
  const headers = { 'X-Resort-Location': location };
  const formRef = useRef<HTMLFormElement>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<FormState>({ error: false, message: '' });
  const [toDelete, setToDelete] = useState<FeedbackRow | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback('');
      setState({ error: false, message: '' });
    }
  }, [isOpen, reservationId, customerId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const query = new URLSearchParams({
      reservationId,
      customerId,
      pageIndex: String(fd.get('pageIndex') ?? 1),
      pageSize: String(fd.get('pageSize') ?? 10),
    });
    try {
      const res = await fetch(`/api/feedbacks?${query}`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Unable to load feedbacks.');
      setState({ error: false, message: '', data: json.data, pager: json.pager });
      onFeedbackChanged(reservationId, customerId, json.pager?.records ?? 0);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Unable to load feedbacks.');
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId, customerId, feedback }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Save failed.');
      setFeedback('');
      formRef.current?.requestSubmit();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (row: FeedbackRow) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: row.id }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Create task failed.');
      toast('Task created.');
      formRef.current?.requestSubmit();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Create task failed.');
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null);
    try {
      const res = await fetch(`/api/feedbacks/${target.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed.');
      formRef.current?.requestSubmit();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const columns: ColumnDef<FeedbackRow>[] = [
    { accessorKey: 'feedback', header: 'Feedback', cell: ({ row }) => <div className="whitespace-pre-wrap">{row.original.feedback}</div> },
    {
      accessorKey: 'action',
      header: 'Action',
      size: 30,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {!row.original.isTaskCreated && (
            <ButtonCustom variant="black" size="sm" type="button" onClick={() => handleCreateTask(row.original)}>
              <ClipboardPlus aria-hidden="true" className="mr-1 size-4" />
              Create Task
            </ButtonCustom>
          )}
          <ButtonCustom variant="red" size="sm" type="button" onClick={() => setToDelete(row.original)}>
            <Trash2 aria-hidden="true" className="mr-1 size-4" />
            Delete
          </ButtonCustom>
        </div>
      ),
    },
  ];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChanged}>
      <DialogContent
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: '90vw', height: '90vh', maxHeight: '90vh' }}
        className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label htmlFor="feedback" className="text-sm font-medium">
            Your Feedback
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            rows={5}
            className="resize-y"
            style={{ fieldSizing: 'fixed', height: '8.5rem', minHeight: '8.5rem' } as React.CSSProperties}
            disabled={isSubmitting}
          />
          <div>
            <Button className='bg-green-600 hover:bg-green-700'
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || feedback.trim() === ''}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <form ref={formRef} onSubmit={onSubmit}>
          <DataTable columns={columns} formState={state} formAction={() => { }} formRef={formRef} />
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onOpenChanged}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={toDelete !== null} onOpenChange={(o) => { if (!o) setToDelete(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm!</DialogTitle>
          <DialogDescription>Are you sure you want to delete this feedback?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <ButtonCustom variant="red" type="button" onClick={handleDelete}>Yes</ButtonCustom>
          <ButtonCustom variant="black" type="button" onClick={() => setToDelete(null)}>No</ButtonCustom>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};