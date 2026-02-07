
import { TripData } from '../types';

/**
 * GOOGLE APPS SCRIPT CODE (Paste this in Google Apps Script associated with your Sheet):
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = JSON.parse(e.postData.contents);
 *   sheet.appendRow([
 *     data.date, 
 *     data.tripType, 
 *     data.description, 
 *     data.vehicleNumber, 
 *     data.dmId, 
 *     data.driverId, 
 *     data.phoneNumber,
 *     new Date()
 *   ]);
 *   return ContentService.createTextOutput(JSON.stringify({"result": "success"})).setMimeType(ContentService.MimeType.JSON);
 * }
 */

export const saveToGoogleSheets = async (data: TripData, scriptUrl: string): Promise<boolean> => {
  if (!scriptUrl || scriptUrl === '') {
    console.warn("Google Sheets Script URL not set. Data saved locally only.");
    return false;
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Apps Script often requires no-cors for simple triggers
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    console.error("Error saving to Google Sheets:", error);
    return false;
  }
};
