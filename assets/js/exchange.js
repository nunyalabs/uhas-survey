/* ============================================
   UHAS-HPI Import/Export Module
   JSON and CSV import/export for survey data
   ============================================ */

class DataExchange {
  /**
   * Export survey data as JSON
   */
  static async exportJSON() {
    try {
      if (!db.db) {
        await db.init();
      }

      const surveys = await db.getAll('surveys');
      const participants = await db.getAll('participants');

      const exportData = {
        app: CONFIG.app.name,
        version: CONFIG.app.version,
        exportedAt: new Date().toISOString(),
        data: {
          surveys,
          participants,
          summary: {
            totalSurveys: surveys.length,
            totalParticipants: participants.length,
            surveysByType: this._summarizeSurveysByType(surveys)
          }
        }
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      return this._downloadFile(
        jsonStr,
        `survey-export-${new Date().toISOString().split('T')[0]}.json`,
        'application/json'
      );
    } catch (error) {
      console.error('❌ JSON export failed:', error);
      throw error;
    }
  }

  /**
   * Export survey data as CSV
   */
  static async exportCSV() {
    try {
      if (!db.db) {
        await db.init();
      }

      const surveys = await db.getAll('surveys');
      
      if (surveys.length === 0) {
        alert('⚠️ No survey data to export');
        return;
      }

      // Flatten nested data
      const flatData = surveys.map(survey => ({
        participantId: survey.participantId,
        type: survey.type,
        studySite: survey.studySite,
        createdAt: survey.createdAt,
        ...survey.data
      }));

      const csv = this._arrayToCSV(flatData);
      return this._downloadFile(
        csv,
        `survey-export-${new Date().toISOString().split('T')[0]}.csv`,
        'text/csv'
      );
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      throw error;
    }
  }

  /**
   * Import JSON file
   */
  static async importJSON(file) {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      if (!db.db) {
        await db.init();
      }

      let importedCount = 0;

      // Import surveys
      if (importedData.data?.surveys) {
        for (const survey of importedData.data.surveys) {
          await db.add('surveys', {
            type: survey.type,
            participantId: survey.participantId,
            studySite: survey.studySite,
            data: survey.data,
            importedAt: new Date().toISOString()
          });
          importedCount++;
        }
      }

      // Import participants
      if (importedData.data?.participants) {
        for (const participant of importedData.data.participants) {
          await db.add('participants', {
            participantId: participant.participantId,
            type: participant.type,
            metadata: participant.metadata,
            importedAt: new Date().toISOString()
          });
        }
      }

      console.log(`✅ Imported ${importedCount} records`);
      return importedCount;
    } catch (error) {
      console.error('❌ JSON import failed:', error);
      throw error;
    }
  }

  /**
   * Import CSV file
   */
  static async importCSV(file) {
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const required = ['participantId', 'type', 'studySite'];
      
      for (const req of required) {
        if (!headers.includes(req)) {
          throw new Error(`Missing required column: ${req}`);
        }
      }

      if (!db.db) {
        await db.init();
      }

      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });

        const data = { ...row };
        const { participantId, type, studySite } = data;
        delete data.participantId;
        delete data.type;
        delete data.studySite;

        await db.add('surveys', {
          participantId,
          type,
          studySite,
          data,
          importedAt: new Date().toISOString()
        });

        importedCount++;
      }

      console.log(`✅ Imported ${importedCount} surveys from CSV`);
      return importedCount;
    } catch (error) {
      console.error('❌ CSV import failed:', error);
      throw error;
    }
  }

  /**
   * Helper: Summarize surveys by type
   */
  static _summarizeSurveysByType(surveys) {
    const summary = {};
    surveys.forEach(survey => {
      summary[survey.type] = (summary[survey.type] || 0) + 1;
    });
    return summary;
  }

  /**
   * Helper: Convert array to CSV
   */
  static _arrayToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [
      headers.map(h => `"${h}"`).join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return value;
        }).join(',')
      )
    ];

    return csv.join('\n');
  }

  /**
   * Helper: Download file
   */
  static _downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Downloaded: ${filename}`);
  }
}

// Make available globally
window.DataExchange = DataExchange;
