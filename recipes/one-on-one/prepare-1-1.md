# Prepare 1-on-1

This recipe prepares for a 1-on-1 meeting by collecting activity data and opening relevant pages (Culture Amp and Google Drive) for the team member.

## Task

When the user says "1-1 [Person Name]", execute these steps in sequence:

1. **Step 1: Get Team Member Information** (see details below)
2. **Step 2: Execute Activity Collection** (see details below)
3. **Step 3: Generate HTML and Open in Browser** (see details below)
4. **Step 4: Open Culture Amp Page** (see details below)
5. **Step 5: Open Google Drive Page** (see details below)

## Context

### Important: Review Context First
**Before starting**:
1. **Read the `files/recipe-config/people-info.md` file** to get information about:
   - Team member details including:
     - Email addresses
     - Slack IDs
     - Jira account IDs
     - Culture Amp URLs
     - Google Drive URLs
     - Local Google Drive Paths
2. **Identify the team member** from the user's request (e.g., "1-1 Sam" or "1-1 Sam Gold")

## Step 1: Get Team Member Information

### Goal
Retrieve all necessary information about the team member from the configuration file, including URLs for Culture Amp and Google Drive.

### Instructions
1. Read `files/recipe-config/people-info.md`
2. Locate the team member's section (match by first name, last name, or full name)
3. Extract:
   - Email address
   - Slack ID (format: UXXXXXXXXX)
   - Slack display name (e.g., @Alex Johnson)
   - Jira account_id (format: 123456:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
   - **Culture Amp URL** (if available)
   - **Google Drive URL** (if available)
   - Local Google Drive Path

### Expected Output
- Team member's information ready for use in subsequent steps
- Culture Amp URL (may be empty if not configured)
- Google Drive URL (may be empty if not configured)

## Step 2: Execute Activity Collection

### Goal
Execute the activity collection recipe to gather all recent activity data for the team member.

### Instructions
1. Execute the `recipes/activity-log/collect-activity.md` recipe for the identified team member
2. Follow all steps in that recipe:
   - Collect Slack Activity
   - Collect Jira Activity
   - Collect Confluence Activity
   - Generate Activity Report
   - Copy Report to Google Drive
3. Use the default date range (last 7 days ending yesterday) unless the user specifies otherwise

### Expected Output
- Activity report generated in `files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.md`
- Report copied to Google Drive Activity folder

## Step 3: Generate HTML and Open in Browser

### Goal
Generate an HTML version of the activity report and open it in the browser for easy viewing during the 1-on-1 meeting.

### Instructions
1. After the markdown report is generated, convert it to HTML
2. Use the markdown-to-HTML converter script (`files/scratch/md_to_html.py`)
3. The script will automatically extract the person's name from the markdown title and use it in the HTML page title
4. Generate the HTML file in the same directory as the markdown file
5. Open the HTML file in the default browser

### Process
```bash
# Generate HTML from markdown
python3 files/scratch/md_to_html.py "files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.md"

# Open HTML in browser
open "files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.html"
```

### Important Notes
- The HTML file is **disposable** - it's only generated for viewing during the 1-on-1
- The HTML file is **NOT** copied to Google Drive (only the markdown file is copied)
- The HTML file will be generated in the same output directory as the markdown file
- If the markdown-to-HTML converter script doesn't exist, create it first (see script location: `files/scratch/md_to_html.py`)

### Expected Output
- HTML file generated: `files/output/{firstname}-activity-dd-mm-yyyy/{firstname}-activity-dd-mm-yyyy.html`
- HTML file opens in the default browser with styled, readable formatting
- HTML page title reflects the person's name (e.g., "Victor Chang - Activity Report")

## Step 4: Open Culture Amp Page

### Goal
Open the team member's Culture Amp conversation page in the default browser.

### Instructions
1. Check if the team member has a Culture Amp URL in `people-info.md`
2. If the URL exists and is not empty:
   - Use the `open` command (macOS) to open the URL in the default browser
   - Command: `open "{Culture Amp URL}"`
3. If the URL is empty or missing:
   - Note that Culture Amp URL is not configured for this team member
   - Skip opening the Culture Amp page

### Process
```bash
# If Culture Amp URL exists
open "https://envato.cultureamp.com/app/conversations/0196779c-da88-702d-9105-05a3a02ed337?tab=history"
```

### Expected Output
- Culture Amp page opens in the default browser (if URL is configured)
- Or a note that the URL is not configured

## Step 5: Open Google Drive Page

### Goal
Open the team member's Google Drive folder page in the default browser.

### Instructions
1. Check if the team member has a Google Drive URL in `people-info.md`
2. If the URL exists and is not empty:
   - Use the `open` command (macOS) to open the URL in the default browser
   - Command: `open "{Google Drive URL}"`
3. If the URL is empty or missing:
   - Note that Google Drive URL is not configured for this team member
   - Skip opening the Google Drive page

### Process
```bash
# If Google Drive URL exists
open "https://drive.google.com/drive/folders/15PUviwhwfAf6pNzb1TVvah4NH0aN4A_V"
```

### Expected Output
- Google Drive page opens in the default browser (if URL is configured)
- Or a note that the URL is not configured

## Example Usage

To prepare for a 1-on-1 with Sam Gold:
1. Read `people-info.md` to get Sam's details:
   - Culture Amp URL: `https://envato.cultureamp.com/app/conversations/0196779c-da88-702d-9105-05a3a02ed337?tab=history`
   - Google Drive URL: `https://drive.google.com/drive/folders/15PUviwhwfAf6pNzb1TVvah4NH0aN4A_V`
2. Execute `collect-activity.md` recipe for Sam
3. Generate HTML and open in browser: `python3 files/scratch/md_to_html.py "files/output/sam-activity-dd-mm-yyyy/sam-activity-dd-mm-yyyy.md" && open "files/output/sam-activity-dd-mm-yyyy/sam-activity-dd-mm-yyyy.html"`
4. Open Culture Amp page: `open "https://envato.cultureamp.com/app/conversations/0196779c-da88-702d-9105-05a3a02ed337?tab=history"`
5. Open Google Drive page: `open "https://drive.google.com/drive/folders/15PUviwhwfAf6pNzb1TVvah4NH0aN4A_V"`

## Notes

- The activity collection uses the default date range (last 7 days ending yesterday) unless specified
- If Culture Amp or Google Drive URLs are not configured for a team member, those steps will be skipped
- URLs are opened in the default browser using the macOS `open` command
- The markdown activity report will be available in both the local output directory and Google Drive
- The HTML version is generated temporarily for browser viewing and is **not** copied to Google Drive (disposable)

## Troubleshooting

### Team Member Not Found
- Check the spelling of the name in the user's request
- Verify the team member exists in `people-info.md`
- Try matching by first name, last name, or full name

### Missing URLs
- If Culture Amp URL is missing, the Culture Amp page will not open (this is expected if not configured)
- If Google Drive URL is missing, the Google Drive page will not open (this is expected if not configured)
- Activity collection will still proceed even if URLs are missing

### Activity Collection Issues
- Refer to troubleshooting section in `recipes/activity-log/collect-activity.md`
- Common issues: missing Slack IDs, incorrect Jira account IDs, date format issues


