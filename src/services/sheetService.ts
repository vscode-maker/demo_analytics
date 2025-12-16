import Papa from 'papaparse';
import { ImportRecord, RepairData } from '../types';

export const sheetService = {
  /**
   * Extract spreadsheet ID from Google Sheets URL
   */
  extractSpreadsheetId(sheetsUrl: string): string | null {
    const idMatch = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return idMatch ? idMatch[1] : null;
  },

  /**
   * Extract gid (sheet tab ID) from Google Sheets URL
   */
  extractGid(sheetsUrl: string): string {
    const gidMatch = sheetsUrl.match(/[#&]gid=([0-9]+)/);
    return gidMatch ? gidMatch[1] : '0';
  },

  /**
   * Create unique key for a sheet (spreadsheetId + gid)
   */
  getSheetKey(sheetsUrl: string): string {
    const spreadsheetId = this.extractSpreadsheetId(sheetsUrl);
    const gid = this.extractGid(sheetsUrl);
    return `${spreadsheetId}_${gid}`;
  },

  /**
   * Check if a sheet already exists in import history
   */
  findExistingImport(sheetsUrl: string): ImportRecord | null {
    const sheetKey = this.getSheetKey(sheetsUrl);
    const imports = this.getImports();
    
    return imports.find(imp => this.getSheetKey(imp.url) === sheetKey) || null;
  },

  /**
   * Convert Google Sheets URL to CSV export URL
   */
  convertToCsvUrl(sheetsUrl: string): string {
    // Extract spreadsheet ID
    const spreadsheetId = this.extractSpreadsheetId(sheetsUrl);
    if (!spreadsheetId) {
      throw new Error('Invalid Google Sheets URL');
    }
    
    // Extract gid (sheet ID)
    const gid = this.extractGid(sheetsUrl);
    
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  },
  
  /**
   * Import data from Google Sheets (CSV export)
   * If the same spreadsheet+gid already exists, update it instead of creating new
   */
  async importSheet(url: string, sheetName?: string): Promise<ImportRecord> {
    try {
      // Check if this sheet already exists in history
      const existingImport = this.findExistingImport(url);
      
      // Convert to CSV URL
      const csvUrl = this.convertToCsvUrl(url);
      
      // Fetch CSV data
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error('Cannot access Google Sheets. Make sure the link has public view permission.');
      }
      
      const csvText = await response.text();
      
      // Parse CSV
      const parsed = Papa.parse<RepairData>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });
      
      if (parsed.errors.length > 0) {
        console.warn('CSV parsing warnings:', parsed.errors);
      }
      
      const data = parsed.data;
      
      // Log parsed data
      console.log('📊 Parsed Data:', {
        rowCount: data.length,
        columns: parsed.meta.fields,
        firstRow: data[0],
        sample3Rows: data.slice(0, 3)
      });
      
      // Determine sheet name
      let finalSheetName = sheetName;
      if (!finalSheetName) {
        if (existingImport) {
          // Keep existing name
          finalSheetName = existingImport.sheetName;
        } else {
          // Generate new name with timestamp
          const timestamp = new Date().toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          finalSheetName = `Import ${timestamp}`;
        }
      }
      
      // Create or update import record
      const importRecord: ImportRecord = {
        // Keep same ID if updating existing, otherwise generate new
        id: existingImport ? existingImport.id : `import_${Date.now()}`,
        url: url,
        csvUrl: csvUrl,
        sheetName: finalSheetName,
        rowCount: data.length,
        columnCount: parsed.meta.fields?.length || 0,
        data: data,
        status: 'completed',
        createdAt: existingImport ? existingImport.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (existingImport) {
        console.log(`🔄 Updating existing import: ${existingImport.sheetName} (${existingImport.rowCount} → ${data.length} rows)`);
      } else {
        console.log(`✅ New import: ${finalSheetName} (${data.length} rows)`);
      }
      
      // Save to localStorage (will update if same ID exists)
      this.saveImport(importRecord);
      
      // Set as active import
      localStorage.setItem('vla_active_import', importRecord.id);
      
      return importRecord;
      
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },
  
  /**
   * Save import to localStorage
   */
  saveImport(importRecord: ImportRecord): void {
    const imports = this.getImports();
    
    // Remove if already exists
    const filtered = imports.filter(imp => imp.id !== importRecord.id);
    
    // Add to beginning
    filtered.unshift(importRecord);
    
    // Keep only last 10 imports to avoid localStorage quota
    const toStore = filtered.slice(0, 10);
    
    localStorage.setItem('vla_imports', JSON.stringify(toStore));
  },
  
  /**
   * Get all imports from localStorage
   */
  getImports(): ImportRecord[] {
    const stored = localStorage.getItem('vla_imports');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },
  
  /**
   * Get specific import by ID
   */
  getImport(id: string): ImportRecord | null {
    const imports = this.getImports();
    return imports.find(imp => imp.id === id) || null;
  },
  
  /**
   * Get active import
   */
  getActiveImport(): ImportRecord | null {
    const activeId = localStorage.getItem('vla_active_import');
    if (!activeId) return null;
    
    return this.getImport(activeId);
  },
  
  /**
   * Set active import
   */
  setActiveImport(id: string): void {
    localStorage.setItem('vla_active_import', id);
  },
  
  /**
   * Delete import
   */
  deleteImport(id: string): void {
    const imports = this.getImports();
    const filtered = imports.filter(imp => imp.id !== id);
    localStorage.setItem('vla_imports', JSON.stringify(filtered));
    
    // Clear active if deleted
    const activeId = localStorage.getItem('vla_active_import');
    if (activeId === id) {
      localStorage.removeItem('vla_active_import');
    }
  },
  
  /**
   * Get import history (alias for getImports)
   */
  getImportHistory(): ImportRecord[] {
    return this.getImports();
  },
  
  /**
   * Get repair data from specific import
   */
  getRepairData(importId: string): RepairData[] {
    const importRecord = this.getImport(importId);
    if (!importRecord || !importRecord.data) {
      return [];
    }
    return importRecord.data;
  },
  
  /**
   * Get merged repair data from multiple imports
   */
  getMergedRepairData(importIds: string[]): RepairData[] {
    const allData: RepairData[] = [];
    
    for (const importId of importIds) {
      const data = this.getRepairData(importId);
      allData.push(...data);
    }
    
    console.log('📊 Merged Data:', {
      totalImports: importIds.length,
      totalRows: allData.length
    });
    
    return allData;
  }
};
