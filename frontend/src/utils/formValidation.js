/**
 * Form Validation Utilities
 * Handles validation and progress calculation for survey forms
 */

import { MODULE_FIELDS, getTotalFieldsCount } from './moduleFields';

/**
 * Validate a specific module's data
 * @param {string} moduleId - The module identifier
 * @param {object} data - The module's form data
 * @returns {object} - { isValid: boolean, errors: string[], warnings: string[] }
 */
export const validateModule = (moduleId, data = {}) => {
  const moduleConfig = MODULE_FIELDS[moduleId];
  if (!moduleConfig) {
    return { isValid: false, errors: ['Invalid module'], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Check required fields
  moduleConfig.requiredFields.forEach(fieldName => {
    const fieldConfig = moduleConfig.fields.find(f => f.name === fieldName);
    const value = data[fieldName];

    if (value === undefined || value === null || value === '') {
      errors.push(`${fieldConfig?.label || fieldName} is required`);
    }
  });

  // Check optional fields for warnings
  const filledFields = Object.keys(data).filter(key => {
    const value = data[key];
    return value !== undefined && value !== null && value !== '';
  }).length;

  if (filledFields < moduleConfig.totalFields && errors.length === 0) {
    const missing = moduleConfig.totalFields - filledFields;
    warnings.push(`${missing} optional field${missing > 1 ? 's' : ''} not filled`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calculate completion percentage for a specific module
 * @param {string} moduleId - The module identifier
 * @param {object} data - The module's form data
 * @returns {number} - Completion percentage (0-100)
 */
export const calculateModuleCompletion = (moduleId, data = {}) => {
  const moduleConfig = MODULE_FIELDS[moduleId];
  if (!moduleConfig) return 0;

  const filledFields = Object.keys(data).filter(key => {
    const value = data[key];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return Math.round((filledFields / moduleConfig.totalFields) * 100);
};

/**
 * Calculate overall completion percentage across all modules
 * @param {object} formData - All form data with module keys
 * @returns {number} - Overall completion percentage (0-100)
 */
export const calculateOverallCompletion = (formData = {}) => {
  let totalFields = 0;
  let filledFields = 0;

  Object.keys(MODULE_FIELDS).forEach(moduleId => {
    const moduleConfig = MODULE_FIELDS[moduleId];
    totalFields += moduleConfig.totalFields;

    const moduleData = formData[moduleId] || {};
    const filled = Object.keys(moduleData).filter(key => {
      const value = moduleData[key];
      return value !== undefined && value !== null && value !== '';
    }).length;

    filledFields += filled;
  });

  if (totalFields === 0) return 0;
  return Math.round((filledFields / totalFields) * 100);
};

/**
 * Get completion statistics for all modules
 * @param {object} formData - All form data with module keys
 * @returns {object} - Statistics object
 */
export const getCompletionStats = (formData = {}) => {
  const stats = {
    totalFields: getTotalFieldsCount(),
    filledFields: 0,
    completedModules: 0,
    partialModules: 0,
    emptyModules: 0,
    overallPercentage: 0,
    moduleStats: {}
  };

  Object.keys(MODULE_FIELDS).forEach(moduleId => {
    const moduleConfig = MODULE_FIELDS[moduleId];
    const moduleData = formData[moduleId] || {};
    
    const filled = Object.keys(moduleData).filter(key => {
      const value = moduleData[key];
      return value !== undefined && value !== null && value !== '';
    }).length;

    stats.filledFields += filled;

    const completion = Math.round((filled / moduleConfig.totalFields) * 100);
    const { isValid } = validateModule(moduleId, moduleData);

    stats.moduleStats[moduleId] = {
      total: moduleConfig.totalFields,
      filled,
      completion,
      isValid
    };

    if (completion === 100) {
      stats.completedModules++;
    } else if (completion > 0) {
      stats.partialModules++;
    } else {
      stats.emptyModules++;
    }
  });

  stats.overallPercentage = calculateOverallCompletion(formData);

  return stats;
};

/**
 * Check if a module can be considered complete
 * @param {string} moduleId - The module identifier
 * @param {object} data - The module's form data
 * @returns {boolean} - True if all required fields are filled
 */
export const isModuleComplete = (moduleId, data = {}) => {
  const { isValid } = validateModule(moduleId, data);
  return isValid;
};

/**
 * Get the next incomplete module
 * @param {object} formData - All form data
 * @param {string} currentModuleId - Current module ID
 * @param {array} moduleOrder - Array of module IDs in order
 * @returns {string|null} - Next incomplete module ID or null
 */
export const getNextIncompleteModule = (formData, currentModuleId, moduleOrder) => {
  const currentIndex = moduleOrder.findIndex(id => id === currentModuleId);
  
  for (let i = currentIndex + 1; i < moduleOrder.length; i++) {
    const moduleId = moduleOrder[i];
    const { isValid } = validateModule(moduleId, formData[moduleId] || {});
    if (!isValid) {
      return moduleId;
    }
  }
  
  return null;
};

/**
 * Count filled fields in form data
 * @param {object} formData - All form data
 * @returns {number} - Number of filled fields
 */
export const countFilledFields = (formData = {}) => {
  let count = 0;
  
  Object.keys(MODULE_FIELDS).forEach(moduleId => {
    const moduleData = formData[moduleId] || {};
    count += Object.keys(moduleData).filter(key => {
      const value = moduleData[key];
      return value !== undefined && value !== null && value !== '';
    }).length;
  });
  
  return count;
};

/**
 * Check if survey is fully complete (all required fields filled)
 * @param {object} formData - All form data
 * @returns {boolean} - True if all required fields across all modules are filled
 */
export const isSurveyComplete = (formData = {}) => {
  return Object.keys(MODULE_FIELDS).every(moduleId => {
    const { isValid } = validateModule(moduleId, formData[moduleId] || {});
    return isValid;
  });
};
