export const SURVEY_MODULES = [
  { id: 'basic_info', name: 'Basic Information', icon: 'ℹ️', totalFields: 4, requiredFields: 2 },
  { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️', totalFields: 4, requiredFields: 3 },
  { id: 'sanitation', name: 'Sanitation', icon: '💧', totalFields: 3, requiredFields: 3 },
  { id: 'connectivity', name: 'Connectivity', icon: '📡', totalFields: 3, requiredFields: 3 },
  { id: 'land_forest', name: 'Land & Forest', icon: '🌳', totalFields: 3, requiredFields: 2 },
  { id: 'electricity', name: 'Electricity', icon: '⚡', totalFields: 3, requiredFields: 2 },
  { id: 'waste_management', name: 'Waste Management', icon: '🗑️', totalFields: 3, requiredFields: 3 },
];

export const USER_ROLES = {
  STAFF: 'staff',
  ADMIN: 'admin',
  BLOCK_OFFICER: 'block_officer',
};

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  CONFLICT: 'conflict',
  FAILED: 'failed',
};

export const STATUS_COLORS = {
  pending: 'badge-warning',
  synced: 'badge-success',
  conflict: 'badge-error',
  failed: 'badge-error',
};
