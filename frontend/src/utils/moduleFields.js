/**
 * Module Field Definitions
 * Defines all fields for each survey module with metadata
 */

export const MODULE_FIELDS = {
  basic_info: {
    fields: [
      { name: 'population', label: 'Total Population', type: 'number', required: true, placeholder: 'Enter total population' },
      { name: 'households', label: 'Number of Households', type: 'number', required: true, placeholder: 'Enter number of households' },
      { name: 'male_population', label: 'Male Population', type: 'number', required: false, placeholder: 'Enter male population' },
      { name: 'female_population', label: 'Female Population', type: 'number', required: false, placeholder: 'Enter female population' },
      { name: 'literacy_rate', label: 'Literacy Rate (%)', type: 'number', required: false, placeholder: 'Enter literacy rate' },
      { name: 'sc_population', label: 'SC Population', type: 'number', required: false, placeholder: 'Enter SC population' },
      { name: 'st_population', label: 'ST Population', type: 'number', required: false, placeholder: 'Enter ST population' },
      { name: 'panchayat_area', label: 'Panchayat Area (sq km)', type: 'number', required: false, placeholder: 'Enter area in square kilometers' },
    ],
    totalFields: 8,
    requiredFields: ['population', 'households']
  },

  infrastructure: {
    fields: [
      { name: 'primary_schools', label: 'Number of Primary Schools', type: 'number', required: true, placeholder: 'Enter number of primary schools' },
      { name: 'high_schools', label: 'Number of High Schools', type: 'number', required: false, placeholder: 'Enter number of high schools' },
      { name: 'hospitals', label: 'Number of Hospitals/PHCs', type: 'number', required: true, placeholder: 'Enter number of hospitals/PHCs' },
      { name: 'roads_paved', label: 'Paved Roads (km)', type: 'number', required: false, placeholder: 'Enter paved roads in km' },
      { name: 'roads_unpaved', label: 'Unpaved Roads (km)', type: 'number', required: false, placeholder: 'Enter unpaved roads in km' },
      { name: 'community_halls', label: 'Number of Community Halls', type: 'number', required: false, placeholder: 'Enter number of community halls' },
      { name: 'water_supply', label: 'Water Supply Status', type: 'select', required: true, 
        options: ['Adequate', 'Insufficient', 'None'],
        placeholder: 'Select water supply status' 
      },
    ],
    totalFields: 7,
    requiredFields: ['primary_schools', 'hospitals', 'water_supply']
  },

  sanitation: {
    fields: [
      { name: 'households_with_toilet', label: 'Households with Toilet', type: 'number', required: true, placeholder: 'Enter number of households with toilet' },
      { name: 'public_toilets', label: 'Number of Public Toilets', type: 'number', required: false, placeholder: 'Enter number of public toilets' },
      { name: 'waste_collection', label: 'Waste Collection System', type: 'select', required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'None'],
        placeholder: 'Select waste collection frequency'
      },
      { name: 'drainage_system', label: 'Drainage System', type: 'select', required: true,
        options: ['Covered', 'Open', 'None'],
        placeholder: 'Select drainage system type'
      },
      { name: 'sewage_treatment', label: 'Sewage Treatment Facility', type: 'select', required: false,
        options: ['Yes', 'No'],
        placeholder: 'Select if sewage treatment exists'
      },
    ],
    totalFields: 5,
    requiredFields: ['households_with_toilet', 'waste_collection', 'drainage_system']
  },

  connectivity: {
    fields: [
      { name: 'internet_availability', label: 'Internet Availability', type: 'select', required: true,
        options: ['Good', 'Poor', 'None'],
        placeholder: 'Select internet availability'
      },
      { name: 'mobile_coverage', label: 'Mobile Network Coverage', type: 'select', required: true,
        options: ['4G', '3G', '2G', 'None'],
        placeholder: 'Select mobile coverage'
      },
      { name: 'public_transport', label: 'Public Transport Access', type: 'select', required: true,
        options: ['Regular', 'Irregular', 'None'],
        placeholder: 'Select public transport access'
      },
      { name: 'nearest_railway_station', label: 'Distance to Railway Station (km)', type: 'number', required: false, placeholder: 'Enter distance to nearest railway station' },
      { name: 'nearest_bus_stand', label: 'Distance to Bus Stand (km)', type: 'number', required: false, placeholder: 'Enter distance to nearest bus stand' },
      { name: 'postal_service', label: 'Postal Service Available', type: 'select', required: false,
        options: ['Yes', 'No'],
        placeholder: 'Select if postal service available'
      },
    ],
    totalFields: 6,
    requiredFields: ['internet_availability', 'mobile_coverage', 'public_transport']
  },

  land_forest: {
    fields: [
      { name: 'agricultural_land', label: 'Agricultural Land (hectares)', type: 'number', required: true, placeholder: 'Enter agricultural land in hectares' },
      { name: 'forest_area', label: 'Forest Area (hectares)', type: 'number', required: false, placeholder: 'Enter forest area in hectares' },
      { name: 'barren_land', label: 'Barren Land (hectares)', type: 'number', required: false, placeholder: 'Enter barren land in hectares' },
      { name: 'irrigated_land', label: 'Irrigated Land (hectares)', type: 'number', required: false, placeholder: 'Enter irrigated land in hectares' },
      { name: 'major_crops', label: 'Major Crops Grown', type: 'text', required: false, placeholder: 'Enter major crops (comma separated)' },
      { name: 'livestock_count', label: 'Livestock Count', type: 'number', required: false, placeholder: 'Enter total livestock count' },
    ],
    totalFields: 6,
    requiredFields: ['agricultural_land']
  },

  electricity: {
    fields: [
      { name: 'households_electrified', label: 'Households with Electricity', type: 'number', required: true, placeholder: 'Enter households with electricity' },
      { name: 'street_lights', label: 'Number of Street Lights', type: 'number', required: false, placeholder: 'Enter number of street lights' },
      { name: 'power_supply_hours', label: 'Power Supply (hours/day)', type: 'number', required: true, placeholder: 'Enter power supply hours per day' },
      { name: 'solar_panels', label: 'Solar Panel Installations', type: 'number', required: false, placeholder: 'Enter number of solar installations' },
      { name: 'transformer_capacity', label: 'Transformer Capacity (KVA)', type: 'number', required: false, placeholder: 'Enter transformer capacity' },
    ],
    totalFields: 5,
    requiredFields: ['households_electrified', 'power_supply_hours']
  },

  waste_management: {
    fields: [
      { name: 'waste_collection_points', label: 'Waste Collection Points', type: 'number', required: true, placeholder: 'Enter number of collection points' },
      { name: 'recycling_facility', label: 'Recycling Facility', type: 'select', required: true,
        options: ['Yes', 'No'],
        placeholder: 'Select if recycling facility exists'
      },
      { name: 'composting_facility', label: 'Composting Facility', type: 'select', required: false,
        options: ['Yes', 'No'],
        placeholder: 'Select if composting facility exists'
      },
      { name: 'waste_segregation', label: 'Waste Segregation Practice', type: 'select', required: true,
        options: ['Practiced', 'Not Practiced'],
        placeholder: 'Select waste segregation status'
      },
      { name: 'plastic_ban', label: 'Plastic Ban Enforcement', type: 'select', required: false,
        options: ['Strictly Enforced', 'Partially Enforced', 'Not Enforced'],
        placeholder: 'Select plastic ban enforcement'
      },
    ],
    totalFields: 5,
    requiredFields: ['waste_collection_points', 'recycling_facility', 'waste_segregation']
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
