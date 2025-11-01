/**
 * Module Field Definitions
 * Defines all fields for each survey module with metadata
 */

export const MODULE_FIELDS = {
  basic_info: {
    fields: [
      { name: 'population', label: 'Population', type: 'number', required: true, placeholder: 'Enter total population' },
      { name: 'households', label: 'Number of Households', type: 'number', required: true, placeholder: 'Enter number of households' },
      { name: 'literacy_rate', label: 'Literacy Rate (%)', type: 'number', required: false, placeholder: 'Enter literacy rate' },
      { name: 'primary_occupation', label: 'Primary Occupation', type: 'select', required: false,
        options: ['Agriculture', 'Business', 'Service', 'Labor', 'Other'],
        placeholder: 'Select primary occupation'
      },
    ],
    totalFields: 4,
    requiredFields: ['population', 'households']
  },

  infrastructure: {
    fields: [
      { name: 'roads', label: 'Road Conditions', type: 'select', required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
        placeholder: 'Select road conditions'
      },
      { name: 'schools', label: 'Number of Schools', type: 'number', required: true, placeholder: 'Enter number of schools' },
      { name: 'hospitals', label: 'Number of Health Centers', type: 'number', required: true, placeholder: 'Enter number of health centers' },
      { name: 'community_centers', label: 'Community Centers', type: 'number', required: false, placeholder: 'Enter number of community centers' },
    ],
    totalFields: 4,
    requiredFields: ['roads', 'schools', 'hospitals']
  },

  sanitation: {
    fields: [
      { name: 'toilets', label: 'Household Toilets Coverage (%)', type: 'number', required: true, placeholder: 'Enter percentage' },
      { name: 'drainage', label: 'Drainage System', type: 'select', required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
        placeholder: 'Select drainage system'
      },
      { name: 'water_supply', label: 'Water Supply Status', type: 'select', required: true,
        options: ['24x7', 'Scheduled', 'Limited', 'Insufficient'],
        placeholder: 'Select water supply status'
      },
    ],
    totalFields: 3,
    requiredFields: ['toilets', 'drainage', 'water_supply']
  },

  connectivity: {
    fields: [
      { name: 'mobile_network', label: 'Mobile Network Coverage', type: 'select', required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
        placeholder: 'Select mobile network coverage'
      },
      { name: 'internet', label: 'Internet Availability', type: 'select', required: true,
        options: ['Broadband', '4G', '3G', '2G', 'None'],
        placeholder: 'Select internet availability'
      },
      { name: 'transport', label: 'Public Transport', type: 'select', required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
        placeholder: 'Select public transport'
      },
    ],
    totalFields: 3,
    requiredFields: ['mobile_network', 'internet', 'transport']
  },

  land_forest: {
    fields: [
      { name: 'agricultural_land', label: 'Agricultural Land (acres)', type: 'number', required: true, placeholder: 'Enter area in acres' },
      { name: 'forest_area', label: 'Forest Area (acres)', type: 'number', required: false, placeholder: 'Enter area in acres' },
      { name: 'irrigation', label: 'Irrigation Facilities', type: 'select', required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
        placeholder: 'Select irrigation facilities'
      },
    ],
    totalFields: 3,
    requiredFields: ['agricultural_land', 'irrigation']
  },

  electricity: {
    fields: [
      { name: 'coverage', label: 'Electricity Coverage (%)', type: 'number', required: true, placeholder: 'Enter percentage' },
      { name: 'supply_hours', label: 'Average Supply Hours/Day', type: 'number', required: true, placeholder: 'Enter hours' },
      { name: 'street_lights', label: 'Street Light Coverage', type: 'select', required: false,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
        placeholder: 'Select street light coverage'
      },
    ],
    totalFields: 3,
    requiredFields: ['coverage', 'supply_hours']
  },

  waste_management: {
    fields: [
      { name: 'collection_system', label: 'Waste Collection System', type: 'select', required: true,
        options: ['Daily', 'Weekly', 'Bi-weekly', 'None'],
        placeholder: 'Select waste collection system'
      },
      { name: 'segregation', label: 'Waste Segregation Practice', type: 'select', required: true,
        options: ['Yes', 'No', 'Partial'],
        placeholder: 'Select waste segregation practice'
      },
      { name: 'disposal_method', label: 'Disposal Method', type: 'select', required: true,
        options: ['Composting', 'Landfill', 'Burning', 'Other'],
        placeholder: 'Select disposal method'
      },
    ],
    totalFields: 3,
    requiredFields: ['collection_system', 'segregation', 'disposal_method']
  },
};

/**
 * Get total number of fields across all modules
 */
export const getTotalFieldsCount = () => {
  return Object.values(MODULE_FIELDS).reduce((sum, module) => sum + module.totalFields, 0);
};

/**
 * Get total number of required fields across all modules
 */
export const getTotalRequiredFieldsCount = () => {
  return Object.values(MODULE_FIELDS).reduce((sum, module) => sum + module.requiredFields.length, 0);
};

/**
 * Get fields for a specific module
 */
export const getModuleFields = (moduleId) => {
  return MODULE_FIELDS[moduleId]?.fields || [];
};

/**
 * Get required fields for a specific module
 */
export const getRequiredFields = (moduleId) => {
  return MODULE_FIELDS[moduleId]?.requiredFields || [];
};

/**
 * Check if a field is required
 */
export const isFieldRequired = (moduleId, fieldName) => {
  const requiredFields = MODULE_FIELDS[moduleId]?.requiredFields || [];
  return requiredFields.includes(fieldName);
};
