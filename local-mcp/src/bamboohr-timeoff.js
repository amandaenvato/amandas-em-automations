/**
 * BambooHR Time Off Utilities
 * Functions to fetch time off/leave data from BambooHR API
 */

import { BambooHRClient } from './bamboohr-client.js';

/**
 * Get time off requests for a date range
 * @param {BambooHRClient} client - BambooHR client instance
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of time off requests
 */
export async function getTimeOffRequests(client, startDate, endDate) {
  const endpoint = `/api/v1/time_off/requests?start=${startDate}&end=${endDate}`;
  return await client.fetchApi(endpoint);
}

/**
 * Get time off requests for specific employees
 * @param {BambooHRClient} client - BambooHR client instance
 * @param {Array<string>} employeeIds - Array of employee IDs
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} status - Filter by status (e.g., 'approved', 'pending', 'denied'). Default: 'approved'
 * @returns {Promise<Array>} Filtered array of time off requests
 */
export async function getTimeOffForEmployees(client, employeeIds, startDate, endDate, status = 'approved') {
  const allRequests = await getTimeOffRequests(client, startDate, endDate);
  
  return allRequests.filter(req => 
    employeeIds.includes(req.employeeId) && 
    req.status.status === status
  );
}

/**
 * Format time off requests for display
 * @param {Array} requests - Array of time off request objects
 * @returns {Object} Object keyed by employee ID with formatted leave data
 */
export function formatTimeOffRequests(requests) {
  const formatted = {};
  
  requests.forEach(req => {
    if (!formatted[req.employeeId]) {
      formatted[req.employeeId] = {
        name: req.name,
        leave: []
      };
    }
    
    formatted[req.employeeId].leave.push({
      start: req.start,
      end: req.end,
      type: req.type.name,
      days: Object.keys(req.dates || {}).length,
      dates: Object.keys(req.dates || {}).sort(),
      status: req.status.status
    });
  });
  
  return formatted;
}

