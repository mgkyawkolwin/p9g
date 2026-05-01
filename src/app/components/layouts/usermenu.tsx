'use client';

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import SignOutButton from "@/lib/components/web/react/uicustom/signoutbutton";
import { signOutAction } from "@/app/actions";
import { changePasswordAction } from "@/app/components/layouts/actions";

interface UserMenuProps {
  location: string;
  userName?: string | null;
}

export default function UserMenu({ location, userName }: UserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const openChangePasswordDialog = () => {
    setMenuOpen(false);
    resetForm();
    setDialogOpen(true);
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await changePasswordAction(
        currentPassword,
        newPassword,
        confirmPassword,
        location
      );

      if (result.error) {
        toast.error(result.message);
      } else {
        toast.success(result.message || 'Password changed successfully.');
        resetForm();
        setDialogOpen(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error changing password.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/10 text-sm text-white"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        <span>{userName || 'User'}</span>
        <span className="text-lg leading-none">▾</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded border border-[#333333] bg-[#333333] dark:bg-[#444444] dark:border-[#333333] shadow-xl cursor-pointer">
          <button
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10 cursor-pointer"
            onClick={openChangePasswordDialog}
          >
            Change Password
          </button>
          <div className="border-t border-white/10" />
          <div className="px-3 py-2">
            <SignOutButton action={signOutAction} />
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new password.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="grid gap-4 pt-4">
            <InputWithLabel
              label="Current Password"
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              size="full"
              variant="form"
            />
            <InputWithLabel
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="full"
              variant="form"
            />
            <InputWithLabel
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              size="full"
              variant="form"
            />

            <DialogFooter>
              <DialogClose asChild>
                <ButtonCustom type="button" variant="ghost" size="sm">Cancel</ButtonCustom>
              </DialogClose>
              <ButtonCustom type="submit" variant="default" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </ButtonCustom>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
