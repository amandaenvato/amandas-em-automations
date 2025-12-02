export class BambooHRClient {
  constructor(subdomain, apiKey) {
    if (!subdomain || !apiKey) {
      throw new Error(
        "BambooHR authentication required. Both subdomain and apiKey must be provided."
      );
    }

    this.subdomain = subdomain;
    this.apiKey = apiKey;
    this.baseUrl = `https://${subdomain}.bamboohr.com`;
  }

  /**
   * Fetch data from a BambooHR API endpoint
   * @private
   */
  async fetchApi(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // BambooHR uses Basic Auth with API key as password and empty username
    const auth = Buffer.from(`:${this.apiKey}`).toString('base64');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(
        `BambooHR API error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 500)}`
      );
    }

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || response.statusText;
      throw new Error(
        `BambooHR API error (${response.status}): ${errorMsg}`
      );
    }

    return data;
  }

  /**
   * List all employees from the directory
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Limit number of results
   * @param {string} params.fields - Comma-separated list of fields to return
   * @returns {Promise<Object>} Employee directory data
   */
  async listEmployees(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }

    const endpoint = `/employees/directory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.fetchApi(endpoint);
  }

  /**
   * Get a specific employee by ID
   * @param {string|number} employeeId - The employee ID
   * @param {Object} params - Query parameters
   * @param {string} params.fields - Comma-separated list of fields to return
   * @returns {Promise<Object>} Employee data
   */
  async getEmployee(employeeId, params = {}) {
    if (!employeeId && employeeId !== 0) {
      throw new Error("employeeId is required");
    }

    const queryParams = new URLSearchParams();
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }

    const endpoint = `/employees/${employeeId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.fetchApi(endpoint);
  }

  /**
   * Get the current employee (API key owner)
   * @param {Object} params - Query parameters
   * @param {string} params.fields - Comma-separated list of fields to return
   * @returns {Promise<Object>} Current employee data
   */
  async getCurrentEmployee(params = {}) {
    return await this.getEmployee(0, params);
  }

  /**
   * Format employee data as markdown
   * @private
   */
  formatEmployee(employee) {
    let markdown = `# Employee Information\n\n`;

    if (employee.id) {
      markdown += `**Employee ID**: ${employee.id}\n\n`;
    }

    if (employee.firstName || employee.lastName) {
      markdown += `**Name**: ${employee.firstName || ''} ${employee.lastName || ''}\n\n`;
    }

    if (employee.displayName) {
      markdown += `**Display Name**: ${employee.displayName}\n\n`;
    }

    if (employee.workEmail) {
      markdown += `**Work Email**: ${employee.workEmail}\n\n`;
    }

    if (employee.jobTitle) {
      markdown += `**Job Title**: ${employee.jobTitle}\n\n`;
    }

    if (employee.department) {
      markdown += `**Department**: ${employee.department}\n\n`;
    }

    if (employee.location) {
      markdown += `**Location**: ${employee.location}\n\n`;
    }

    if (employee.division) {
      markdown += `**Division**: ${employee.division}\n\n`;
    }

    if (employee.supervisor) {
      markdown += `**Supervisor**: ${employee.supervisor}\n\n`;
    }

    if (employee.employeeNumber) {
      markdown += `**Employee Number**: ${employee.employeeNumber}\n\n`;
    }

    if (employee.status) {
      markdown += `**Status**: ${employee.status}\n\n`;
    }

    // Add any other fields that might be present
    const knownFields = [
      'id', 'firstName', 'lastName', 'displayName', 'workEmail',
      'jobTitle', 'department', 'location', 'division', 'supervisor',
      'employeeNumber', 'status'
    ];

    const otherFields = Object.keys(employee).filter(key => !knownFields.includes(key));
    if (otherFields.length > 0) {
      markdown += `## Additional Fields\n\n`;
      otherFields.forEach(field => {
        const value = employee[field];
        if (value !== null && value !== undefined) {
          markdown += `**${field}**: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}\n\n`;
        }
      });
    }

    return markdown;
  }

  /**
   * Format employee directory as markdown
   * @private
   */
  formatEmployeeDirectory(data) {
    let markdown = `# Employee Directory\n\n`;

    // Handle different response structures
    let employees = [];
    if (Array.isArray(data)) {
      employees = data;
    } else if (data && Array.isArray(data.employees)) {
      employees = data.employees;
    } else if (data && Array.isArray(data.data)) {
      employees = data.data;
    } else if (data && Array.isArray(data.results)) {
      employees = data.results;
    } else if (data && typeof data === 'object') {
      // Try to find any array property
      const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
      if (arrayKeys.length > 0) {
        employees = data[arrayKeys[0]];
      }
    }

    markdown += `**Total Employees**: ${employees.length}\n\n`;
    markdown += `---\n\n`;

    employees.forEach((employee, index) => {
      markdown += `## ${index + 1}. ${employee.firstName || ''} ${employee.lastName || ''} ${employee.displayName ? `(${employee.displayName})` : ''}\n\n`;
      
      if (employee.id) {
        markdown += `**ID**: ${employee.id}\n\n`;
      }
      if (employee.workEmail) {
        markdown += `**Email**: ${employee.workEmail}\n\n`;
      }
      if (employee.jobTitle) {
        markdown += `**Title**: ${employee.jobTitle}\n\n`;
      }
      if (employee.department) {
        markdown += `**Department**: ${employee.department}\n\n`;
      }
      if (employee.location) {
        markdown += `**Location**: ${employee.location}\n\n`;
      }
      markdown += `\n`;
    });

    return markdown;
  }
}

