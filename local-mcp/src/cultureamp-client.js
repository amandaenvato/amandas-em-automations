export class CultureAmpClient {
  constructor(token, refreshToken) {
    if (!token || !refreshToken) {
      throw new Error(
        "Culture Amp authentication required. Both token and refreshToken must be provided."
      );
    }

    this.baseUrl = process.env.CULTUREAMP_BASE_URL || "https://envato.cultureamp.com";

    // Build cookie string from provided tokens
    this.cookies = `cultureamp.production-us.token=${token}; cultureamp.production-us.refresh-token=${refreshToken}`;
  }

  /**
   * Fetch data from a Culture Amp API endpoint
   * @private
   */
  async fetchApi(url) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        cookie: this.cookies,
      },
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(
        `Culture Amp API error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 500)}`
      );
    }

    if (!response.ok) {
      const errorMsg = data.error?.message || data.message || response.statusText;
      throw new Error(
        `Culture Amp API error (${response.status}): ${errorMsg}`
      );
    }

    return data;
  }

  /**
   * Get details about a specific conversation
   * @param {string} conversationId - The conversation ID (UUID format)
   * @returns {Promise<Object>} Conversation details
   */
  async getConversation(conversationId) {
    if (!conversationId) {
      throw new Error("conversationId is required");
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      throw new Error(`Invalid conversation ID format: ${conversationId}. Expected UUID format.`);
    }

    try {
      // Fetch conversation data and completed topics in parallel
      const conversationUrl = `${this.baseUrl}/sgw/conversations-api/v1/conversations/${conversationId}`;
      const topicsUrl = `${this.baseUrl}/sgw/conversations-api/v1/conversations/${conversationId}/topics/completed?limit=50`;

      const [conversationData, completedTopicsResult] = await Promise.all([
        this.fetchApi(conversationUrl),
        this.fetchApi(topicsUrl).catch((error) => {
          // If topics endpoint fails, log but don't fail the whole request
          console.error(`Warning: Failed to fetch completed topics: ${error.message}`);
          return null;
        }),
      ]);

      // Handle different response structures - could be array directly or wrapped in object
      let completedTopics = [];
      if (completedTopicsResult) {
        if (Array.isArray(completedTopicsResult)) {
          completedTopics = completedTopicsResult;
        } else if (completedTopicsResult && Array.isArray(completedTopicsResult.records)) {
          // The completed topics endpoint returns { records: [...], next_cursor: ..., previous_cursor: ... }
          completedTopics = completedTopicsResult.records;
        } else if (completedTopicsResult && Array.isArray(completedTopicsResult.topics)) {
          completedTopics = completedTopicsResult.topics;
        } else if (completedTopicsResult && Array.isArray(completedTopicsResult.data)) {
          completedTopics = completedTopicsResult.data;
        } else if (completedTopicsResult && typeof completedTopicsResult === 'object') {
          // Try to find any array property
          const arrayKeys = Object.keys(completedTopicsResult).filter(key =>
            Array.isArray(completedTopicsResult[key])
          );
          if (arrayKeys.length > 0) {
            completedTopics = completedTopicsResult[arrayKeys[0]];
          }
        }
      }

      // Fetch attachments for each topic in parallel
      const topicsWithAttachments = await Promise.all(
        completedTopics.map(async (topic) => {
          if (!topic.id) {
            return { ...topic, attachments: [] };
          }

          const attachmentsUrl = `${this.baseUrl}/sgw/conversations-api/v1/topics/${topic.id}/attachments`;

          try {
            const attachmentsResult = await this.fetchApi(attachmentsUrl);

            // Handle different attachment response structures
            let attachments = [];
            if (Array.isArray(attachmentsResult)) {
              attachments = attachmentsResult;
            } else if (attachmentsResult && Array.isArray(attachmentsResult.attachments)) {
              attachments = attachmentsResult.attachments;
            } else if (attachmentsResult && Array.isArray(attachmentsResult.records)) {
              attachments = attachmentsResult.records;
            } else if (attachmentsResult && Array.isArray(attachmentsResult.data)) {
              attachments = attachmentsResult.data;
            } else if (attachmentsResult && typeof attachmentsResult === 'object') {
              // Try to find any array property
              const arrayKeys = Object.keys(attachmentsResult).filter(key =>
                Array.isArray(attachmentsResult[key])
              );
              if (arrayKeys.length > 0) {
                attachments = attachmentsResult[arrayKeys[0]];
              }
            }

            return {
              ...topic,
              attachments: attachments,
            };
          } catch (error) {
            // If attachments fetch fails, log but don't fail the whole request
            console.error(`Warning: Failed to fetch attachments for topic ${topic.id}: ${error.message}`);
            return {
              ...topic,
              attachments: [],
            };
          }
        })
      );

      // Merge completed topics (with attachments) into conversation data
      const mergedData = {
        ...conversationData,
        completed_topics: topicsWithAttachments,
        _completed_topics_count: topicsWithAttachments.length,
        _completed_topics_fetched: completedTopicsResult !== null,
      };

      return {
        content: [
          {
            type: "text",
            text: this.formatConversation(mergedData),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching Culture Amp conversation: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Format file size in human-readable format
   * @private
   */
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format conversation data as markdown
   * @private
   */
  formatConversation(data) {
    let markdown = `# Culture Amp Conversation\n\n`;

    // Summary section
    markdown += `## Summary\n\n`;
    if (data.title) {
      markdown += `**Title**: ${data.title}\n\n`;
    }
    if (data.id) {
      markdown += `**Conversation ID**: ${data.id}\n\n`;
    }

    // Handle participants - could be object or array
    if (data.participants) {
      const participants = Array.isArray(data.participants)
        ? data.participants
        : Object.values(data.participants);
      markdown += `**Participants**: ${participants.map(p => p.name || p.email || 'Unknown').join(', ')}\n\n`;
    }

    if (data.created_at) {
      markdown += `**Created**: ${new Date(data.created_at).toLocaleString()}`;
    }
    if (data.updated_at) {
      markdown += ` | **Last Updated**: ${new Date(data.updated_at).toLocaleString()}`;
    }
    markdown += `\n\n`;

    if (data.completed_topics && Array.isArray(data.completed_topics)) {
      markdown += `**Completed Topics**: ${data.completed_topics.length}\n\n`;

      // Count topics by type
      const topicsByType = {};
      data.completed_topics.forEach(topic => {
        const type = topic.type || 'unknown';
        topicsByType[type] = (topicsByType[type] || 0) + 1;
      });

      const typeSummary = Object.entries(topicsByType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');
      if (typeSummary) {
        markdown += `**Topic Types**: ${typeSummary}\n\n`;
      }
    }

    markdown += `---\n\n`;

    // Handle participants - detailed section
    if (data.participants) {
      markdown += `## Participants\n\n`;
      const participants = Array.isArray(data.participants)
        ? data.participants
        : Object.values(data.participants);

      participants.forEach((participant, index) => {
        markdown += `${index + 1}. ${participant.name || participant.email || 'Unknown'}`;
        if (participant.email && participant.name !== participant.email) {
          markdown += ` (${participant.email})`;
        }
        if (participant.role) {
          markdown += ` - ${participant.role}`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    }

    if (data.title) {
      markdown += `## Title\n\n${data.title}\n\n`;
    }

    if (data.description) {
      markdown += `## Description\n\n${data.description}\n\n`;
    }

    if (data.created_at) {
      markdown += `**Created**: ${new Date(data.created_at).toLocaleString()}\n\n`;
    }

    if (data.updated_at) {
      markdown += `**Last Updated**: ${new Date(data.updated_at).toLocaleString()}\n\n`;
    }

    if (data.status) {
      markdown += `**Status**: ${data.status}\n\n`;
    }

    if (data.notes && Array.isArray(data.notes) && data.notes.length > 0) {
      markdown += `## Notes (${data.notes.length})\n\n`;
      data.notes.forEach((note, index) => {
        markdown += `### Note ${index + 1}\n\n`;
        if (note.created_at) {
          markdown += `**Date**: ${new Date(note.created_at).toLocaleString()}\n\n`;
        }
        if (note.author) {
          markdown += `**Author**: ${note.author.name || note.author.email || 'Unknown'}\n\n`;
        }
        if (note.content) {
          markdown += `${note.content}\n\n`;
        }
        markdown += `---\n\n`;
      });
    }

    if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
      markdown += `## Topics (${data.topics.length})\n\n`;
      data.topics.forEach((topic, index) => {
        markdown += `### ${index + 1}. ${topic.title || 'Untitled Topic'}\n\n`;
        if (topic.description) {
          markdown += `${topic.description}\n\n`;
        }
        if (topic.created_at) {
          markdown += `**Created**: ${new Date(topic.created_at).toLocaleString()}\n\n`;
        }
        if (topic.completed_at) {
          markdown += `**Completed**: ${new Date(topic.completed_at).toLocaleString()}\n\n`;
        }
        markdown += `\n`;
      });
    }

    if (data.completed_topics && Array.isArray(data.completed_topics) && data.completed_topics.length > 0) {
      markdown += `## Completed Topics (${data.completed_topics.length})\n\n`;
      data.completed_topics.forEach((topic, index) => {
        markdown += `### ${index + 1}. ${topic.title || topic.name || 'Untitled Topic'}\n\n`;
        if (topic.description) {
          markdown += `${topic.description}\n\n`;
        }
        if (topic.type) {
          markdown += `**Type**: ${topic.type}\n\n`;
        }
        if (topic.created_at) {
          markdown += `**Created**: ${new Date(topic.created_at).toLocaleString()}\n\n`;
        }
        if (topic.completed_at) {
          markdown += `**Completed**: ${new Date(topic.completed_at).toLocaleString()}\n\n`;
        }
        if (topic.attachments_count !== undefined) {
          markdown += `**Attachments Count**: ${topic.attachments_count}\n\n`;
        }
        if (topic.notes && Array.isArray(topic.notes) && topic.notes.length > 0) {
          markdown += `**Notes**: ${topic.notes.length} note(s)\n\n`;
          topic.notes.forEach((note, noteIndex) => {
            markdown += `  - ${note.content || note.text || 'Note'}`;
            if (note.created_at) {
              markdown += ` (${new Date(note.created_at).toLocaleDateString()})`;
            }
            markdown += `\n`;
          });
          markdown += `\n`;
        }
        if (topic.attachments && Array.isArray(topic.attachments) && topic.attachments.length > 0) {
          markdown += `**Attachments** (${topic.attachments.length}):\n\n`;
          topic.attachments.forEach((attachment, attachIndex) => {
            markdown += `  ${attachIndex + 1}. `;

            // Show attachment type
            const attachType = attachment.attachable_type || attachment.type || 'Unknown';
            markdown += `[${attachType}]`;

            // Add specific info based on type
            if (attachType === 'Note' && attachment.content) {
              // Extract text from JSON content if present
              try {
                const content = typeof attachment.content === 'string' ? JSON.parse(attachment.content) : attachment.content;
                if (Array.isArray(content) && content[0]?.content) {
                  const text = content[0].content.map(c => c.text || '').join('').substring(0, 100);
                  if (text) markdown += `: ${text}${text.length >= 100 ? '...' : ''}`;
                }
              } catch (e) {
                // Not JSON, use as-is
                const text = attachment.content.substring(0, 100);
                markdown += `: ${text}${text.length >= 100 ? '...' : ''}`;
              }
            } else if (attachType === 'Response' && attachment.content) {
              try {
                const content = typeof attachment.content === 'string' ? JSON.parse(attachment.content) : attachment.content;
                if (Array.isArray(content) && content[0]?.content) {
                  const text = content[0].content.map(c => c.text || '').join('').substring(0, 100);
                  if (text) markdown += `: ${text}${text.length >= 100 ? '...' : ''}`;
                }
              } catch (e) {
                const text = attachment.content.substring(0, 100);
                markdown += `: ${text}${text.length >= 100 ? '...' : ''}`;
              }
            } else if (attachType === 'AttachmentEvent' && attachment.event_type) {
              markdown += ` (${attachment.event_type})`;
            } else if (attachment.filename || attachment.name) {
              markdown += `: ${attachment.filename || attachment.name}`;
            } else if (attachment.url) {
              markdown += `: [View](${attachment.url})`;
            }

            if (attachment.created_at) {
              markdown += ` (${new Date(attachment.created_at).toLocaleDateString()})`;
            }
            markdown += `\n`;
          });
          markdown += `\n`;
        }
        markdown += `\n`;
      });
    }

    if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
      markdown += `## Actions (${data.actions.length})\n\n`;
      data.actions.forEach((action, index) => {
        markdown += `${index + 1}. **${action.title || 'Untitled Action'}**`;
        if (action.assignee) {
          markdown += ` (Assigned to: ${action.assignee.name || action.assignee.email || 'Unknown'})`;
        }
        if (action.status) {
          markdown += ` - Status: ${action.status}`;
        }
        if (action.due_date) {
          markdown += ` - Due: ${new Date(action.due_date).toLocaleDateString()}`;
        }
        markdown += `\n`;
        if (action.description) {
          markdown += `   ${action.description}\n`;
        }
        markdown += `\n`;
      });
    }

    return markdown;
  }
}

