export class TrelloClient {
  constructor(apiKey, apiToken) {
    if (!apiKey || !apiToken) {
      throw new Error(
        "Trello authentication required. Both apiKey and apiToken must be provided."
      );
    }

    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.baseUrl = "https://api.trello.com/1";
  }

  /**
   * Fetch data from a Trello API endpoint
   * @private
   */
  async fetchApi(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add authentication query parameters
    const urlObj = new URL(url);
    urlObj.searchParams.append('key', this.apiKey);
    urlObj.searchParams.append('token', this.apiToken);

    const response = await fetch(urlObj.toString(), {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error(
        `Trello API error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 500)}`
      );
    }

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || response.statusText;
      throw new Error(
        `Trello API error (${response.status}): ${errorMsg}`
      );
    }

    return data;
  }

  /**
   * Extract board ID from URL or search by name
   * @param {string} boardIdentifier - Board URL or name
   * @returns {Promise<Object>} Board information with short and full IDs
   */
  async getBoardId(boardIdentifier) {
    // If it's a URL, extract the short ID
    const urlMatch = boardIdentifier.match(/trello\.com\/b\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      const shortId = urlMatch[1];
      // Get full board details
      const board = await this.fetchApi(`/boards/${shortId}`);
      return {
        shortId: shortId,
        fullId: board.id,
        name: board.name,
        url: board.url,
      };
    }

    // If it's already an ID (short or full), try to get board details
    if (/^[a-zA-Z0-9]{8,}$/.test(boardIdentifier)) {
      try {
        const board = await this.fetchApi(`/boards/${boardIdentifier}`);
        return {
          shortId: board.shortLink || boardIdentifier,
          fullId: board.id,
          name: board.name,
          url: board.url,
        };
      } catch (error) {
        throw new Error(`Board not found: ${boardIdentifier}. ${error.message}`);
      }
    }

    // Search by name
    const boards = await this.fetchApi('/members/me/boards');
    const matchingBoard = boards.find(
      board => board.name.toLowerCase() === boardIdentifier.toLowerCase()
    );

    if (!matchingBoard) {
      throw new Error(`Board not found: ${boardIdentifier}`);
    }

    return {
      shortId: matchingBoard.shortLink,
      fullId: matchingBoard.id,
      name: matchingBoard.name,
      url: matchingBoard.url,
    };
  }

  /**
   * Get all lists from a board
   * @param {string} boardId - Board ID (short or full)
   * @returns {Promise<Array>} Array of lists
   */
  async getBoardLists(boardId) {
    return await this.fetchApi(`/boards/${boardId}/lists`);
  }

  /**
   * Get all cards from a list
   * @param {string} listId - List ID
   * @returns {Promise<Array>} Array of cards
   */
  async getListCards(listId) {
    return await this.fetchApi(`/lists/${listId}/cards`);
  }

  /**
   * Create a new list on a board
   * @param {string} boardId - Board ID
   * @param {string} name - List name
   * @param {number} pos - Position (optional, 'top' or 'bottom' or number)
   * @returns {Promise<Object>} Created list
   */
  async createList(boardId, name, pos = 'bottom') {
    return await this.fetchApi(`/lists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        idBoard: boardId,
        pos,
      }),
    });
  }

  /**
   * Create a new card in a list
   * @param {string} listId - List ID
   * @param {string} name - Card name
   * @param {string} desc - Card description (optional)
   * @param {Array} idLabels - Array of label IDs (optional)
   * @param {Array} idMembers - Array of member IDs (optional)
   * @param {number} pos - Position (optional)
   * @returns {Promise<Object>} Created card
   */
  async createCard(listId, name, desc = '', idLabels = [], idMembers = [], pos = 'bottom') {
    return await this.fetchApi(`/cards`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        desc,
        idList: listId,
        idLabels,
        idMembers,
        pos,
      }),
    });
  }

  /**
   * Update a list (e.g., rename, archive, move)
   * @param {string} listId - List ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated list
   */
  async updateList(listId, updates) {
    return await this.fetchApi(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Update a card
   * @param {string} cardId - Card ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated card
   */
  async updateCard(cardId, updates) {
    return await this.fetchApi(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Archive a list
   * @param {string} listId - List ID
   * @returns {Promise<Object>} Updated list
   */
  async archiveList(listId) {
    return await this.updateList(listId, { closed: true });
  }

  /**
   * Copy all lists and cards from source board to destination board
   * @param {string} sourceBoardId - Source board ID
   * @param {string} destBoardId - Destination board ID
   * @returns {Promise<Object>} Summary of copied items
   */
  async copyLists(sourceBoardId, destBoardId) {
    const sourceLists = await this.getBoardLists(sourceBoardId);
    const results = {
      listsCopied: 0,
      cardsCopied: 0,
      errors: [],
    };

    for (const sourceList of sourceLists) {
      // Skip archived lists
      if (sourceList.closed) {
        continue;
      }

      try {
        // Create new list in destination board
        const newList = await this.createList(destBoardId, sourceList.name, sourceList.pos);

        // Get all cards from source list
        const cards = await this.getListCards(sourceList.id);

        // Copy each card
        for (const card of cards) {
          try {
            await this.createCard(
              newList.id,
              card.name,
              card.desc || '',
              card.idLabels || [],
              card.idMembers || [],
              card.pos || 'bottom'
            );
            results.cardsCopied++;
          } catch (error) {
            results.errors.push(`Error copying card "${card.name}": ${error.message}`);
          }
        }

        results.listsCopied++;
      } catch (error) {
        results.errors.push(`Error copying list "${sourceList.name}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Move lists by name pattern from source to destination board
   * @param {string} sourceBoardId - Source board ID
   * @param {string} destBoardId - Destination board ID
   * @param {string} pattern - Name pattern to match (case-insensitive, matches start of name)
   * @param {boolean} dryRun - If true, only preview what would be moved
   * @returns {Promise<Object>} Summary of moved items
   */
  async moveListsByPattern(sourceBoardId, destBoardId, pattern, dryRun = false) {
    const sourceLists = await this.getBoardLists(sourceBoardId);
    const patternLower = pattern.toLowerCase();
    
    const matchingLists = sourceLists.filter(
      list => !list.closed && list.name.toLowerCase().startsWith(patternLower)
    );

    const results = {
      listsFound: matchingLists.length,
      listsMoved: 0,
      cardsMoved: 0,
      errors: [],
      dryRun,
    };

    if (dryRun) {
      results.preview = matchingLists.map(list => ({
        name: list.name,
        id: list.id,
        cardCount: 0, // Would need to fetch cards to get accurate count
      }));
      return results;
    }

    for (const list of matchingLists) {
      try {
        // Update list to move it to destination board
        await this.updateList(list.id, {
          idBoard: destBoardId,
          pos: 'bottom',
        });

        // Count cards (lists moved with all their cards automatically)
        const cards = await this.getListCards(list.id);
        results.cardsMoved += cards.length;
        results.listsMoved++;
      } catch (error) {
        results.errors.push(`Error moving list "${list.name}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Archive lists by number range
   * @param {string} boardId - Board ID
   * @param {number} startNum - Start number (1-based index)
   * @param {number} endNum - End number (1-based index)
   * @param {boolean} dryRun - If true, only preview what would be archived
   * @returns {Promise<Object>} Summary of archived items
   */
  async archiveListsByRange(boardId, startNum, endNum, dryRun = false) {
    const lists = await this.getBoardLists(boardId);
    const activeLists = lists.filter(list => !list.closed);
    
    // Sort by position
    activeLists.sort((a, b) => a.pos - b.pos);

    const results = {
      listsFound: activeLists.length,
      listsToArchive: [],
      listsArchived: 0,
      errors: [],
      dryRun,
    };

    // Get lists in range (1-based indexing)
    const listsInRange = activeLists.slice(startNum - 1, endNum);

    if (dryRun) {
      results.listsToArchive = listsInRange.map((list, index) => ({
        number: startNum + index,
        name: list.name,
        id: list.id,
      }));
      return results;
    }

    for (const list of listsInRange) {
      try {
        await this.archiveList(list.id);
        results.listsArchived++;
      } catch (error) {
        results.errors.push(`Error archiving list "${list.name}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Reset retrospective board by renaming lists with date and creating new empty lists
   * @param {string} sourceBoardId - Source board ID
   * @param {string} destBoardId - Destination board ID
   * @param {number} startListNum - Start list number (1-based)
   * @param {number} endListNum - End list number (1-based)
   * @param {Date} date - Date to append to list names (defaults to 2 weeks ago)
   * @returns {Promise<Object>} Summary of reset operation
   */
  async resetRetroBoard(sourceBoardId, destBoardId, startListNum, endListNum, date = null) {
    // Default to 2 weeks ago if no date provided
    if (!date) {
      date = new Date();
      date.setDate(date.getDate() - 14);
    }

    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const lists = await this.getBoardLists(sourceBoardId);
    const activeLists = lists.filter(list => !list.closed);
    
    // Sort by position
    activeLists.sort((a, b) => a.pos - b.pos);

    const results = {
      listsProcessed: 0,
      listsRenamed: 0,
      listsCreated: 0,
      listsMoved: 0,
      errors: [],
      date: dateStr,
    };

    // Get lists in range (1-based indexing)
    const listsInRange = activeLists.slice(startListNum - 1, endListNum);

    // Store original names before renaming
    const listNames = listsInRange.map(list => ({
      id: list.id,
      originalName: list.name,
      pos: list.pos,
    }));

    // Step 1: Rename lists with date
    for (const listInfo of listNames) {
      try {
        const newName = `${listInfo.originalName} ${dateStr}`;
        await this.updateList(listInfo.id, { name: newName });
        results.listsRenamed++;
      } catch (error) {
        results.errors.push(`Error renaming list "${listInfo.originalName}": ${error.message}`);
      }
    }

    // Step 2: Create new empty lists with original names
    for (const listInfo of listNames) {
      try {
        await this.createList(sourceBoardId, listInfo.originalName, listInfo.pos);
        results.listsCreated++;
      } catch (error) {
        results.errors.push(`Error creating new list "${listInfo.originalName}": ${error.message}`);
      }
    }

    // Step 3: Move renamed lists to destination board
    for (const listInfo of listNames) {
      try {
        await this.updateList(listInfo.id, {
          idBoard: destBoardId,
          pos: 'bottom',
        });
        results.listsMoved++;
        results.listsProcessed++;
      } catch (error) {
        results.errors.push(`Error moving list "${listInfo.originalName}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Format board ID information as markdown
   * @private
   */
  formatBoardId(boardInfo) {
    return `# Board ID Information

**Board Name**: ${boardInfo.name}

**Short ID** (from URL): \`${boardInfo.shortId}\`

**Full ID** (from API): \`${boardInfo.fullId}\`

**Board URL**: ${boardInfo.url}

## Usage

Use either ID format in API calls:
- Short ID: \`${boardInfo.shortId}\`
- Full ID: \`${boardInfo.fullId}\`
`;
  }

  /**
   * Format copy lists result as markdown
   * @private
   */
  formatCopyListsResult(result) {
    let markdown = `# Copy Lists Result\n\n`;
    markdown += `**Lists Copied**: ${result.listsCopied}\n\n`;
    markdown += `**Cards Copied**: ${result.cardsCopied}\n\n`;
    
    if (result.errors.length > 0) {
      markdown += `## Errors\n\n`;
      result.errors.forEach(error => {
        markdown += `- ${error}\n`;
      });
    } else {
      markdown += `✅ All lists and cards copied successfully!\n`;
    }
    
    return markdown;
  }

  /**
   * Format move lists result as markdown
   * @private
   */
  formatMoveListsResult(result) {
    let markdown = `# Move Lists Result\n\n`;
    markdown += `**Lists Found**: ${result.listsFound}\n\n`;
    
    if (result.dryRun) {
      markdown += `## Preview (Dry Run)\n\n`;
      markdown += `The following lists would be moved:\n\n`;
      result.preview.forEach((list, index) => {
        markdown += `${index + 1}. **${list.name}** (ID: ${list.id})\n`;
      });
    } else {
      markdown += `**Lists Moved**: ${result.listsMoved}\n\n`;
      markdown += `**Cards Moved**: ${result.cardsMoved}\n\n`;
      
      if (result.errors.length > 0) {
        markdown += `## Errors\n\n`;
        result.errors.forEach(error => {
          markdown += `- ${error}\n`;
        });
      } else {
        markdown += `✅ All lists moved successfully!\n`;
      }
    }
    
    return markdown;
  }

  /**
   * Format archive lists result as markdown
   * @private
   */
  formatArchiveListsResult(result) {
    let markdown = `# Archive Lists Result\n\n`;
    markdown += `**Total Lists**: ${result.listsFound}\n\n`;
    
    if (result.dryRun) {
      markdown += `## Preview (Dry Run)\n\n`;
      markdown += `The following lists would be archived:\n\n`;
      result.listsToArchive.forEach(list => {
        markdown += `${list.number}. **${list.name}** (ID: ${list.id})\n`;
      });
    } else {
      markdown += `**Lists Archived**: ${result.listsArchived}\n\n`;
      
      if (result.errors.length > 0) {
        markdown += `## Errors\n\n`;
        result.errors.forEach(error => {
          markdown += `- ${error}\n`;
        });
      } else {
        markdown += `✅ All lists archived successfully!\n`;
      }
    }
    
    return markdown;
  }

  /**
   * Format reset retro board result as markdown
   * @private
   */
  formatResetRetroResult(result) {
    let markdown = `# Reset Retrospective Board Result\n\n`;
    markdown += `**Date Used**: ${result.date}\n\n`;
    markdown += `**Lists Processed**: ${result.listsProcessed}\n\n`;
    markdown += `**Lists Renamed**: ${result.listsRenamed}\n\n`;
    markdown += `**Lists Created**: ${result.listsCreated}\n\n`;
    markdown += `**Lists Moved**: ${result.listsMoved}\n\n`;
    
    if (result.errors.length > 0) {
      markdown += `## Errors\n\n`;
      result.errors.forEach(error => {
        markdown += `- ${error}\n`;
      });
    } else {
      markdown += `✅ Retrospective board reset complete!\n`;
    }
    
    return markdown;
  }
}
