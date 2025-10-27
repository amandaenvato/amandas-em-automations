# Generate Current Document Snapshot

## Goal
Read and save the current state of the Google Drive document as a markdown file.

## Task
1. Read the Google Drive document with ID `1JRQS1rBc7XmNJkt28ZvKFB4oIY239vyv5HaOaGwjhiY` (document named "Feedback To Reports")
2. Convert the content to markdown format
3. Save the content to `feedback/dd-mm-yyyy/current-doc.md`

## Instructions
- Use the MCP Google Drive tools to read the document
- Parse the content to extract all feedback entries for each person
- Note the date of the last feedback entry for each person
- Save as clean markdown in the current-doc.md file

## Output
- File: `feedback/dd-mm-yyyy/current-doc.md`
- Contains: The entire current state of the feedback document

