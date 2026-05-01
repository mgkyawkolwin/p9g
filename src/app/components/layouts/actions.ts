'use server';

import { ConfigPermissions } from '@/core/authorization/ConfigPermissions';
import { headers } from 'next/headers';
import c from '@/lib/loggers/console/ConsoleLogger';
import { FormState } from '@/core/types';
import { userPasswordChangeSchema } from '@/core/validators/zodschema';

export async function getUserMenuPermissions(userRole: string) {
  if (!userRole || !ConfigPermissions[userRole]) {
    return {
      canAccessReservations: false,
      canAccessReservationNew: false,
      canAccessCheckin: false,
      canAccessCheckout: false,
      canAccessPickup: false,
      canAccessDropoff: false,
      canAccessRoomchange: false,
      canAccessRoomschedule: false,
      canAccessCustomers: false,
      canAccessReports: false,
      canAccessSettings: false,
    };
  }

  const userPermissions = ConfigPermissions[userRole];

  // Helper function to check if a path exists in permissions
  const hasPermission = (path: string) =>
    userPermissions.some(perm => perm.startsWith(path));

  return {
    canAccessReservations: hasPermission('/console/reservations'),
    canAccessReservationNew: hasPermission('/console/reservations/new'),
    canAccessCheckin: hasPermission('/console/checkin'),
    canAccessCheckout: hasPermission('/console/checkout'),
    canAccessPickup: hasPermission('/console/pickup'),
    canAccessDropoff: hasPermission('/console/dropoff'),
    canAccessRoomchange: hasPermission('/console/roomchange'),
    canAccessRoomschedule: hasPermission('/console/roomschedule'),
    canAccessCustomers: hasPermission('/console/customers'),
    canAccessReports: hasPermission('/console/reports'), // Assuming reports permission
    canAccessSettings: true, // Or define specific settings permission
  };
}

export async function changePasswordAction(currentPassword: string, newPassword: string, confirmPassword: string, location: string): Promise<FormState> {
  c.fs('Action > changePasswordAction');
  try {
    if (!currentPassword) {
      return { error: true, message: 'Current password is required.' };
    }
    if (newPassword !== confirmPassword) {
      return { error: true, message: 'New passwords do not match.' };
    }

    c.i('Change password action validated input. Sending request to API.');
    const response = await fetch(process.env.API_URL + 'users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Resort-Location': location,
        'cookie': (await headers()).get('cookie'),
      },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      cache: 'no-store',
    });

    const result = await response.json();
    c.i('Received response from change password API:');
    c.d(result);
    if (!response.ok) {
      return { error: true, message: result.message || 'Failed to change password.' };
    }

    return { error: false, message: result.message || 'Password changed successfully.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occured.';
    return { error: true, message };
  } finally {
    c.fe('Action > changePasswordAction');
  }
}