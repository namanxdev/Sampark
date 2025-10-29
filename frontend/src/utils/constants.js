export const SURVEY_MODULES = [
  { id: 'basic_info', name: 'Basic Information', icon: 'FiInfo' },
  { id: 'infrastructure', name: 'Infrastructure', icon: 'FiTool' },
  { id: 'sanitation', name: 'Sanitation', icon: 'FiDroplet' },
  { id: 'connectivity', name: 'Connectivity', icon: 'FiWifi' },
  { id: 'land_forest', name: 'Land & Forest', icon: 'FiMap' },
  { id: 'electricity', name: 'Electricity', icon: 'FiZap' },
  { id: 'waste_management', name: 'Waste Management', icon: 'FiTrash2' },
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
