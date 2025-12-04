export class PagerDutyClient {
  constructor(cookies) {
    // PagerDuty API authentication via browser cookies
    // Cookies are extracted from browser after logging into PagerDuty
    if (!cookies) {
      throw new Error(
        "PagerDuty authentication required. Cookies must be provided. " +
        "Use extract_cookies tool to get authenticated cookies from PagerDuty."
      );
    }

    this.cookies = typeof cookies === 'string' ? cookies : this.formatCookies(cookies);
    this.baseUrl = "https://api.pagerduty.com";
  }

  /**
   * Format cookies array into cookie string
   * @private
   */
  formatCookies(cookies) {
    // If already a string, return as-is
    if (typeof cookies === 'string') {
      // Check if it's a JSON string
      try {
        const parsed = JSON.parse(cookies);
        if (Array.isArray(parsed)) {
          return parsed.map(c => `${c.name}=${c.value}`).join('; ');
        }
        return cookies;
      } catch (e) {
        // Not JSON, assume it's already a cookie string
        return cookies;
      }
    }
    // If it's an array of cookie objects
    if (Array.isArray(cookies)) {
      return cookies.map(c => `${c.name}=${c.value}`).join('; ');
    }
    // If it's a single cookie object
    if (cookies && cookies.name && cookies.value) {
      return `${cookies.name}=${cookies.value}`;
    }
    return String(cookies);
  }

  /**
   * Fetch data from a PagerDuty API endpoint
   * @private
   */
  async fetchApi(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Cookie": this.cookies,
        "Accept": "application/vnd.pagerduty+json;version=2",
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies in request
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(
        `PagerDuty API error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 500)}`
      );
    }

    if (!response.ok) {
      const errorMsg = data.error?.message || data.message || response.statusText;
      throw new Error(
        `PagerDuty API error (${response.status}): ${errorMsg}`
      );
    }

    return data;
  }

  /**
   * List incidents
   * @param {Object} options - Query options
   * @param {string} options.statuses - Comma-separated list of statuses (triggered, acknowledged, resolved)
   * @param {string} options.urgencies - Comma-separated list of urgencies (high, low)
   * @param {number} options.limit - Number of results per page (default: 25)
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Object>} Incidents data
   */
  async listIncidents(options = {}) {
    const params = new URLSearchParams();
    if (options.statuses) params.append("statuses[]", options.statuses);
    if (options.urgencies) params.append("urgencies[]", options.urgencies);
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/incidents${queryString ? `?${queryString}` : ""}`;

    return await this.fetchApi(endpoint);
  }

  /**
   * Get a specific incident by ID
   * @param {string} incidentId - The incident ID
   * @returns {Promise<Object>} Incident details
   */
  async getIncident(incidentId) {
    if (!incidentId) {
      throw new Error("incidentId is required");
    }

    return await this.fetchApi(`/incidents/${incidentId}`);
  }

  /**
   * List on-call schedules
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of results per page
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Object>} Schedules data
   */
  async listSchedules(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/schedules${queryString ? `?${queryString}` : ""}`;

    return await this.fetchApi(endpoint);
  }

  /**
   * Get on-call users for a schedule
   * @param {string} scheduleId - The schedule ID
   * @param {Object} options - Query options
   * @param {string} options.since - Start of the time range
   * @param {string} options.until - End of the time range
   * @returns {Promise<Object>} On-call data
   */
  async getOnCall(scheduleId, options = {}) {
    if (!scheduleId) {
      throw new Error("scheduleId is required");
    }

    const params = new URLSearchParams();
    if (options.since) params.append("since", options.since);
    if (options.until) params.append("until", options.until);

    const queryString = params.toString();
    const endpoint = `/schedules/${scheduleId}/users${queryString ? `?${queryString}` : ""}`;

    return await this.fetchApi(endpoint);
  }

  /**
   * List services
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of results per page
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Object>} Services data
   */
  async listServices(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/services${queryString ? `?${queryString}` : ""}`;

    return await this.fetchApi(endpoint);
  }

  /**
   * Format incidents as markdown
   * @private
   */
  formatIncidents(data) {
    let markdown = `# PagerDuty Incidents\n\n`;

    if (data.incidents && Array.isArray(data.incidents)) {
      markdown += `**Total**: ${data.incidents.length}\n\n`;

      data.incidents.forEach((incident, index) => {
        markdown += `## ${index + 1}. ${incident.title || incident.summary || "Untitled Incident"}\n\n`;
        markdown += `**ID**: ${incident.id}\n\n`;
        markdown += `**Status**: ${incident.status}\n\n`;
        markdown += `**Urgency**: ${incident.urgency}\n\n`;
        if (incident.created_at) {
          markdown += `**Created**: ${new Date(incident.created_at).toLocaleString()}\n\n`;
        }
        if (incident.html_url) {
          markdown += `**Link**: [View Incident](${incident.html_url})\n\n`;
        }
        markdown += `---\n\n`;
      });
    } else {
      markdown += `No incidents found.\n\n`;
    }

    return markdown;
  }

  /**
   * Format incident details as markdown
   * @private
   */
  formatIncident(data) {
    const incident = data.incident || data;
    let markdown = `# PagerDuty Incident\n\n`;

    markdown += `## ${incident.title || incident.summary || "Untitled Incident"}\n\n`;
    markdown += `**ID**: ${incident.id}\n\n`;
    markdown += `**Status**: ${incident.status}\n\n`;
    markdown += `**Urgency**: ${incident.urgency}\n\n`;

    if (incident.created_at) {
      markdown += `**Created**: ${new Date(incident.created_at).toLocaleString()}\n\n`;
    }
    if (incident.updated_at) {
      markdown += `**Updated**: ${new Date(incident.updated_at).toLocaleString()}\n\n`;
    }
    if (incident.resolved_at) {
      markdown += `**Resolved**: ${new Date(incident.resolved_at).toLocaleString()}\n\n`;
    }

    if (incident.service) {
      markdown += `**Service**: ${incident.service.summary || incident.service.name || "Unknown"}\n\n`;
    }

    if (incident.assignments && Array.isArray(incident.assignments) && incident.assignments.length > 0) {
      markdown += `**Assignments**:\n\n`;
      incident.assignments.forEach((assignment) => {
        if (assignment.assignee) {
          markdown += `- ${assignment.assignee.summary || assignment.assignee.name || "Unknown"}\n`;
        }
      });
      markdown += `\n`;
    }

    if (incident.html_url) {
      markdown += `**Link**: [View Incident](${incident.html_url})\n\n`;
    }

    return markdown;
  }

  /**
   * Format schedules as markdown
   * @private
   */
  formatSchedules(data) {
    let markdown = `# PagerDuty Schedules\n\n`;

    if (data.schedules && Array.isArray(data.schedules)) {
      markdown += `**Total**: ${data.schedules.length}\n\n`;

      data.schedules.forEach((schedule, index) => {
        markdown += `## ${index + 1}. ${schedule.name || "Untitled Schedule"}\n\n`;
        markdown += `**ID**: ${schedule.id}\n\n`;
        if (schedule.description) {
          markdown += `**Description**: ${schedule.description}\n\n`;
        }
        if (schedule.time_zone) {
          markdown += `**Time Zone**: ${schedule.time_zone}\n\n`;
        }
        if (schedule.html_url) {
          markdown += `**Link**: [View Schedule](${schedule.html_url})\n\n`;
        }
        markdown += `---\n\n`;
      });
    } else {
      markdown += `No schedules found.\n\n`;
    }

    return markdown;
  }

  /**
   * Format on-call users as markdown
   * @private
   */
  formatOnCall(data) {
    let markdown = `# On-Call Users\n\n`;

    if (data.users && Array.isArray(data.users)) {
      data.users.forEach((user, index) => {
        markdown += `## ${index + 1}. ${user.name || user.email || "Unknown"}\n\n`;
        markdown += `**ID**: ${user.id}\n\n`;
        if (user.email) {
          markdown += `**Email**: ${user.email}\n\n`;
        }
        if (user.role) {
          markdown += `**Role**: ${user.role}\n\n`;
        }
        markdown += `---\n\n`;
      });
    } else {
      markdown += `No on-call users found.\n\n`;
    }

    return markdown;
  }

  /**
   * Format services as markdown
   * @private
   */
  formatServices(data) {
    let markdown = `# PagerDuty Services\n\n`;

    if (data.services && Array.isArray(data.services)) {
      markdown += `**Total**: ${data.services.length}\n\n`;

      data.services.forEach((service, index) => {
        markdown += `## ${index + 1}. ${service.name || "Untitled Service"}\n\n`;
        markdown += `**ID**: ${service.id}\n\n`;
        if (service.description) {
          markdown += `**Description**: ${service.description}\n\n`;
        }
        if (service.status) {
          markdown += `**Status**: ${service.status}\n\n`;
        }
        if (service.html_url) {
          markdown += `**Link**: [View Service](${service.html_url})\n\n`;
        }
        markdown += `---\n\n`;
      });
    } else {
      markdown += `No services found.\n\n`;
    }

    return markdown;
  }
}

