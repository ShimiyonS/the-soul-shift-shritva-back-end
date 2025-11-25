/**
 * Google Apps Script Code for Updating Google Sheets
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire code
 * 5. Click Save (Ctrl+S or Cmd+S)
 * 6. IMPORTANT: Run testDoPost() function once to authorize (Run > testDoPost)
 * 7. Click "Review Permissions" and authorize access
 * 8. Click Deploy > New deployment
 * 9. Select type: Web app
 * 10. Execute as: Me
 * 11. Who has access: Anyone (including anonymous)
 * 12. Click Deploy
 * 13. Copy the Web App URL
 * 14. Add it to your .env file as: GOOGLE_APPS_SCRIPT_URL="your-url-here"
 * 
 * IMPORTANT: Make sure your sheet has a sheet named "Shritva appointment" with headers in row 1:
 * Submitted At | Full Name | Email | Phone | Service | Preferred Date | Preferred Time | Duration | Message
 */

function doPost(e) {
    try {
        // Enable CORS
        const output = ContentService.createTextOutput();

        // Get the active spreadsheet
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getSheetByName('Shritva appointment');

        // If sheet doesn't exist, create it
        if (!sheet) {
            sheet = spreadsheet.insertSheet('Shritva appointment');
            // Add headers
            sheet.getRange(1, 1, 1, 9).setValues([[
                'Submitted At',
                'Full Name',
                'Email',
                'Phone',
                'Service',
                'Preferred Date',
                'Preferred Time',
                'Duration',
                'Message'
            ]]);
            // Format header row
            sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#7450A5').setFontColor('#ffffff');
        }

        // Parse the incoming data
        let data;
        if (e.postData && e.postData.contents) {
            data = JSON.parse(e.postData.contents);
        } else if (e.parameter) {
            // Handle GET requests for testing
            data = e.parameter;
        } else {
            throw new Error('No data received');
        }

        // Prepare the row data
        const rowData = [
            data.submittedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            data.fullName || '',
            data.email || '',
            data.phone || '',
            data.service || '',
            data.preferredDate || 'Not specified',
            data.preferredTime || 'Not specified',
            data.duration || '',
            data.message || 'No additional notes'
        ];

        // Append the new row
        sheet.appendRow(rowData);

        // Return success response with CORS headers
        return output.setContent(JSON.stringify({
            success: true,
            message: 'Data saved successfully'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        // Return error response
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: error.toString(),
            message: 'Error saving data: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Handle GET requests (for testing and authorization)
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Google Apps Script is working!',
        instructions: 'Make sure you have authorized the script and deployed it as a web app.'
    })).setMimeType(ContentService.MimeType.JSON);
}

// Test function - RUN THIS FIRST to authorize the script
// Steps:
// 1. Select this function from the dropdown
// 2. Click Run (▶️)
// 3. Click "Review Permissions"
// 4. Choose your Google account
// 5. Click "Advanced" → "Go to [Project Name] (unsafe)"
// 6. Click "Allow"
// 7. After authorization, redeploy the web app
function testDoPost() {
    try {
        const mockEvent = {
            postData: {
                contents: JSON.stringify({
                    submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '1234567890',
                    service: 'Test Service',
                    preferredDate: '2024-01-15',
                    preferredTime: '14:00',
                    duration: '60 minutes',
                    message: 'Test message - This is a test run'
                })
            }
        };

        const result = doPost(mockEvent);
        const response = JSON.parse(result.getContent());

        if (response.success) {
            Logger.log('✅ Test successful! Data saved to sheet.');
            Logger.log('You can now deploy the web app.');
        } else {
            Logger.log('❌ Test failed: ' + response.error);
        }

        return result;
    } catch (error) {
        Logger.log('❌ Authorization needed. Error: ' + error.toString());
        Logger.log('Please run this function and authorize when prompted.');
        throw error;
    }
}

