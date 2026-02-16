/**
 * Role-based permission constants and helpers.
 * Admin: full access. Instructor: limited with approval flows.
 */
export const ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.INSTRUCTOR]: "Instructor",
};

/** Routes only admin can access */
export const ADMIN_ONLY_ROUTES = [
  "/branches",
  "/instructors",
  "/inventory",
  "/announcements",
];

/** Routes only instructor can access (Shop replaces Inventory for them) */
export const INSTRUCTOR_ROUTES = ["/shop"];

/** Check if role can access route */
export function canAccessRoute(role, pathname) {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.INSTRUCTOR) {
    if (ADMIN_ONLY_ROUTES.some((r) => pathname?.startsWith(r))) return false;
    return true;
  }
  return false;
}

/**
 * Filter nav items by role. Pass full nav items array and role.
 * Returns items the role can access.
 */
export function filterNavItemsByRole(items, role) {
  if (!role) return items.filter((i) => !i.adminOnly && !i.instructorOnly);
  if (role === ROLES.ADMIN) return items.filter((i) => !i.instructorOnly);
  if (role === ROLES.INSTRUCTOR) return items.filter((i) => !i.adminOnly);
  return items;
}
