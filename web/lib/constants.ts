export const ISSUE_CHARGES: Record<string, number> = {
  Puncture: 100,
  "Battery Issue": 300,
  "Fuel Delivery": 500,
  "Oil Change": 800,
  "Engine Repair": 2500,
  "Brake Service": 1200,
  Towing: 1500,
};

export const ISSUES = Object.keys(ISSUE_CHARGES);

export const DELIVERY_PRICE = 50;
export const OFFER_STEP = 50;
export const RADIUS_KM = 20;
/** Shaded circle on map (km) — service area hint */
export const MAP_HIGHLIGHT_RADIUS_KM = 8;
export const CUSTOM_ISSUE = "Custom issue (type below)";

export const SPECIALIZATIONS = [
  "Select Specialization",
  "Car Mechanic",
  "Bike Mechanic",
  "Both Car and Bike",
];

export const ISSUES_WITH_CUSTOM = [...Object.keys(ISSUE_CHARGES), CUSTOM_ISSUE];
