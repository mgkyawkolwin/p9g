

import { ConfigPermissions } from '@/core/authorization/ConfigPermissions';

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