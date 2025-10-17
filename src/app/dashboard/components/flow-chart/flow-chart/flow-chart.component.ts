import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

export interface DownloadFileModel {
  MimeType?: string | null;
  FileNameExtension?: string | null;
  FileByteArr?: string | null;
  FileName?: string | null;
}

@Component({
  selector: 'app-flow-chart',
  templateUrl: './flow-chart.component.html',
  styleUrls: ['./flow-chart.component.scss'],
})
export class FlowChartComponent implements OnInit {
  // Type selection properties
  allowedTypes: string[] = [];
  selectedType: string = '';

  // Loading states
  isLoading: boolean = false;
  isCreatingRequest: boolean = false;
  error: string = '';

  // Date range properties
  selectedDateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null,
  };

  // Branch selection properties
  selectedBranches: any[] = [];
  userInfo: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllowedTypes();
  }

  loadAllowedTypes(): void {
    if (this.allowedTypes.length > 0 || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.dashboardService.getAllowedTypes().subscribe({
      next: (response) => {
        this.allowedTypes = response as string[];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching allowed types:', error);
        this.error = 'Failed to load allowed types';
        this.isLoading = false;
      },
    });
  }

  onDropdownOpen(): void {
    this.loadAllowedTypes();
  }

  onTypeSelect(type: string): void {
    this.selectedType = type;
    console.log('Selected type:', type);
  }

  onBranchSelectionChange(branches: any[]): void {
    this.selectedBranches = branches;
    console.log('Selected branches:', branches);
  }

  onStartDateChange(date: Date | null): void {
    this.selectedDateRange.start = date;
    console.log('Start date changed:', date);
  }

  onEndDateChange(date: Date | null): void {
    this.selectedDateRange.end = date;
    console.log('End date changed:', date);
  }

  get canCreateRequest(): boolean {
    return !!this.selectedType && !this.isLoading && !this.isCreatingRequest;
  }

  createRequest(): void {
    if (!this.canCreateRequest) return;

    this.isCreatingRequest = true;
    this.error = '';

    const requestParams = {
      type: this.selectedType,
      branchIds: this.selectedBranches.map((branch) => branch.id || branch),
      startDate: this.selectedDateRange.start
        ? this.formatDate(this.selectedDateRange.start)
        : null,
      endDate: this.selectedDateRange.end
        ? this.formatDate(this.selectedDateRange.end)
        : null,
    };

    console.log('Creating request with params:', requestParams);

    this.dashboardService.getFileSelected(requestParams).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        console.log('Response type:', typeof response);

        if (this.isErrorResponse(response)) {
          this.handleErrorResponse(response);
          return;
        }

        if (this.hasFileData(response)) {
          this.processAndDownloadFile(response);
        } else {
          console.warn('No file data found in response:', response);
          this.error =
            'No data received from server. Please check your filters and try again.';
        }

        this.isCreatingRequest = false;
      },
      error: (error) => {
        console.error('HTTP Error:', error);

        // Special handling for CSV responses that come as HttpErrorResponse
        if (error.status === 200 && error.error && error.error.text) {
          console.log('Detected CSV response in HttpErrorResponse.error.text');
          this.processAndDownloadFile(error.error.text);
          this.isCreatingRequest = false;
          return;
        }

        this.handleHttpError(error);
        this.isCreatingRequest = false;
      },
    });
  }

  private isErrorResponse(response: any): boolean {
    return (
      response?.error ||
      response?.message?.includes('error') ||
      response?.message?.includes('خطأ') ||
      response?.status === 'error' ||
      (response?.count !== undefined &&
        response.count === 0 &&
        response?.message)
    );
  }

  private handleErrorResponse(response: any): void {
    let errorMessage = 'Unknown error occurred';

    if (response?.message) {
      errorMessage = response.message;
    } else if (response?.error) {
      errorMessage = response.error;
    } else if (typeof response === 'string') {
      errorMessage = response;
    }

    console.error('API returned error:', errorMessage);
    this.error = `Server error: ${errorMessage}`;
    this.isCreatingRequest = false;
  }

  private handleHttpError(error: any): void {
    if (error.status === 404) {
      this.error = 'API endpoint not found. Please check the URL.';
    } else if (error.status === 400) {
      this.error = 'Invalid request parameters. Please check your selection.';
    } else if (error.status === 500) {
      this.error = 'Server error. Please try again later.';
    } else {
      this.error = `Failed to create request: ${error.status} ${error.statusText}`;
    }
  }

  private hasFileData(response: any): boolean {
    if (typeof response === 'string') {
      const trimmed = response.trim();
      if (trimmed.length === 0) return false;
      const lines = trimmed
        .split('\n')
        .filter((line) => line.trim().length > 0);
      return lines.length >= 1; // At least one line (could be just headers or data)
    }

    if (Array.isArray(response) && response.length > 0) {
      return true;
    }

    if (typeof response === 'object' && response !== null) {
      const dataFields = [
        'data',
        'results',
        'content',
        'csv',
        'file_content',
        'items',
        'FileByteArr',
        'FileName',
        'MimeType',
      ];
      return dataFields.some((field) => response[field]);
    }

    return false;
  }

  private processAndDownloadFile(response: any): void {
    try {
      console.log('processAndDownloadFile - Raw response:', response);
      console.log('processAndDownloadFile - Response type:', typeof response);

      // If response is already a DownloadFileModel structure
      if (this.isDownloadFileModel(response)) {
        console.log('Response is DownloadFileModel, downloading directly');
        this.downloadFile(response);
        return;
      }

      // If response is CSV string
      if (typeof response === 'string') {
        console.log('Response is string, processing as CSV');
        const fileModel = this.createFileModelFromCSV(response);
        this.downloadFile(fileModel);
        return;
      }

      // If response is an array of objects
      if (Array.isArray(response)) {
        console.log('Response is array, converting to CSV');
        const csvContent = this.arrayToCSV(response);
        const fileModel = this.createFileModelFromCSV(csvContent);
        this.downloadFile(fileModel);
        return;
      }

      // If response has data in a nested property
      if (typeof response === 'object' && response !== null) {
        console.log('Response is object, checking for nested data');
        const dataFields = [
          'data',
          'results',
          'content',
          'csv',
          'file_content',
          'items',
        ];

        for (const field of dataFields) {
          if (response[field]) {
            console.log(`Found data in field: ${field}`);
            if (typeof response[field] === 'string') {
              const fileModel = this.createFileModelFromCSV(response[field]);
              this.downloadFile(fileModel);
              return;
            } else if (Array.isArray(response[field])) {
              const csvContent = this.arrayToCSV(response[field]);
              const fileModel = this.createFileModelFromCSV(csvContent);
              this.downloadFile(fileModel);
              return;
            }
          }
        }
      }

      throw new Error(
        'Unable to process response data - no recognizable format found'
      );
    } catch (error) {
      console.error('Error processing file:', error);
      this.error = `Failed to process file: ${error}`;
    }
  }

  private isDownloadFileModel(obj: any): obj is DownloadFileModel {
    return obj && (obj.FileByteArr || obj.FileName || obj.MimeType);
  }

  private createFileModelFromCSV(csvContent: string): DownloadFileModel {
    try {
      console.log(
        'createFileModelFromCSV - Input CSV length:',
        csvContent.length
      );
      console.log(
        'createFileModelFromCSV - CSV preview:',
        csvContent.substring(0, 200)
      );

      // Clean the CSV content but preserve all columns
      const cleanedCSV = this.cleanCSVContent(csvContent);

      // Add UTF-8 BOM for better Excel compatibility with Arabic text
      const csvWithBOM = '\uFEFF' + cleanedCSV;

      // Convert CSV string to Base64
      const base64Content = btoa(unescape(encodeURIComponent(csvWithBOM)));
      console.log(
        'createFileModelFromCSV - Base64 length:',
        base64Content.length
      );

      const fileName = `${this.selectedType}_${this.getCurrentTimestamp()}`;
      console.log('createFileModelFromCSV - Generated filename:', fileName);

      const fileModel: DownloadFileModel = {
        FileByteArr: base64Content,
        FileName: fileName,
        FileNameExtension: 'csv',
        MimeType: 'text/csv;charset=utf-8',
      };

      return fileModel;
    } catch (error) {
      console.error('Error creating file model from CSV:', error);
      throw error;
    }
  }

  private cleanCSVContent(csvString: string): string {
    try {
      // Remove any BOM that might already exist
      csvString = csvString.replace(/^\uFEFF/, '');

      // Split into lines and filter out completely empty lines
      const lines = csvString.split(/\r?\n/).filter((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0;
      });

      if (lines.length === 0) {
        throw new Error('No valid data found in CSV');
      }

      console.log(`Found ${lines.length} lines in CSV`);

      // Keep all lines as-is, just trim trailing whitespace
      const processedLines = lines.map((line) => line.trimEnd());

      if (processedLines.length === 0) {
        throw new Error('No valid data rows found in CSV');
      }

      console.log(`Processed ${processedLines.length} lines`);
      return processedLines.join('\n');
    } catch (error) {
      console.error('Error cleaning CSV content:', error);
      throw error;
    }
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) {
      throw new Error('No data to convert to CSV');
    }

    // Get all unique headers from all objects (in case objects have different properties)
    const headersSet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => headersSet.add(key));
    });
    const headers = Array.from(headersSet);

    // Create header row
    let csv = headers.map((h) => this.escapeCSVValue(h)).join(',') + '\n';

    // Create data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header];
        if (value == null) {
          return '';
        }
        return this.escapeCSVValue(String(value));
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  private escapeCSVValue(value: string): string {
    // Check if value needs escaping (contains comma, quote, newline, or starts with special chars)
    if (
      value.includes(',') ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r') ||
      value.startsWith('=') ||
      value.startsWith('+') ||
      value.startsWith('-') ||
      value.startsWith('@')
    ) {
      // Escape quotes by doubling them and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private downloadFile(fileData: DownloadFileModel): void {
    try {
      console.log('downloadFile - Starting download process');

      if (!fileData.FileByteArr) {
        throw new Error('No file data to download - FileByteArr is empty');
      }

      console.log('downloadFile - Decoding Base64...');
      // Decode Base64 to binary
      const byteCharacters = atob(fileData.FileByteArr);
      console.log('downloadFile - Decoded length:', byteCharacters.length);

      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      console.log('downloadFile - Byte array length:', byteArray.length);

      const mimeType = fileData.MimeType || 'text/csv;charset=utf-8';
      const blob = new Blob([byteArray], { type: mimeType });
      console.log(
        'downloadFile - Blob created, size:',
        blob.size,
        'type:',
        blob.type
      );

      const url = window.URL.createObjectURL(blob);
      const fileName = `${fileData.FileName}.${fileData.FileNameExtension}`;
      console.log('downloadFile - Full filename:', fileName);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('downloadFile - Cleanup completed');
      }, 100);

      // Show success message
      console.log('File downloaded successfully:', fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      this.error = `Failed to download file: ${error}`;
    }
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  resetFilters(): void {
    this.selectedType = '';
    this.selectedBranches = [];
    this.selectedDateRange = { start: null, end: null };
    this.error = '';
  }

  clearError(): void {
    this.error = '';
  }
}
