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
  userInfo: any; // You should type this properly based on your user interface

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Remove the automatic API call
    this.loadAllowedTypes(); // <-- Commented out
    // Initialize userInfo - replace with your actual user service call
    // this.userInfo = this.userService.getCurrentUser();
  }

  loadAllowedTypes(): void {
    // Don't call API if already loaded or currently loading
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

  // New method: Called when dropdown is clicked/focused
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

        // Check if response is an error or success
        if (this.isErrorResponse(response)) {
          this.handleErrorResponse(response);
          return;
        }

        // Check if response contains file data
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
      response?.message?.includes('خطأ') || // Arabic for "error"
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
    // Check if response has actual data to download
    if (typeof response === 'string') {
      const trimmed = response.trim();
      // Check if it has CSV structure (header + data)
      if (trimmed.length === 0) return false;
      const lines = trimmed
        .split('\n')
        .filter((line) => line.trim().length > 0);
      return lines.length >= 2 && lines.some((line) => line.includes(','));
    }

    if (Array.isArray(response) && response.length > 0) {
      return true;
    }

    if (typeof response === 'object' && response !== null) {
      // Look for common data properties or file-related properties
      const dataFields = [
        'data',
        'results',
        'content',
        'csv',
        'file_content',
        'items',
        'FileByteArr',
        'FileName',
        'MimeType', // File model properties
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

      // If response is CSV string, convert to file model
      if (typeof response === 'string') {
        console.log('Response is string, processing as CSV');
        console.log(
          'Raw CSV content (first 200 chars):',
          response.substring(0, 200)
        );

        const cleanedCSV = this.cleanCSVContent(response);
        console.log(
          'Cleaned CSV content (first 200 chars):',
          cleanedCSV.substring(0, 200)
        );

        const fileModel = this.createFileModelFromCSV(cleanedCSV);
        console.log('Created file model:', fileModel);

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
              const cleanedCSV = this.cleanCSVContent(response[field]);
              const fileModel = this.createFileModelFromCSV(cleanedCSV);
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
        csvContent.substring(0, 100)
      );

      // Add UTF-8 BOM for better Excel compatibility
      const csvWithBOM = '\uFEFF' + csvContent;

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

      console.log('createFileModelFromCSV - Created file model:', {
        ...fileModel,
        FileByteArr: `[Base64 data - ${fileModel.FileByteArr?.length} chars]`,
      });

      return fileModel;
    } catch (error) {
      console.error('Error creating file model from CSV:', error);
      throw error;
    }
  }

  private cleanCSVContent(csvString: string): string {
    // Split into lines and filter out empty lines
    const lines = csvString.split('\n').filter((line) => {
      const trimmed = line.trim();
      return trimmed.length > 0 && trimmed !== ',' && !trimmed.match(/^,+$/);
    });

    if (lines.length === 0) {
      throw new Error('No valid data found in CSV');
    }

    let processedLines = [];

    // Check if first line looks like a header
    const firstLine = lines[0];
    if (
      firstLine.includes('value,created') ||
      firstLine.includes('value') ||
      firstLine.includes('created')
    ) {
      processedLines.push(firstLine);
    } else {
      processedLines.push('value,created');
    }

    // Process data lines
    const dataStartIndex = firstLine.includes('value,created') ? 1 : 0;

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length === 0 || line.match(/^,+$/)) {
        continue;
      }

      const parts = line.split(',');

      if (parts.length >= 2) {
        const value = parts[0].trim();
        const created = parts[1].trim();

        if (value && created) {
          processedLines.push(`${value},${created}`);
        }
      }
    }

    if (processedLines.length <= 1) {
      throw new Error('No valid data rows found in CSV');
    }

    return processedLines.join('\n');
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';

    data.forEach((row) => {
      const values = headers.map((header) => {
        let value = row[header];
        if (value == null) value = '';
        value = String(value);
        if (
          value.includes(',') ||
          value.includes('"') ||
          value.includes('\n')
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  // File download utility method (embedded in component)
  private downloadFile(fileData: DownloadFileModel): void {
    try {
      console.log('downloadFile - Starting download process');
      console.log('downloadFile - File data:', {
        ...fileData,
        FileByteArr: fileData.FileByteArr
          ? `[Base64 data - ${fileData.FileByteArr.length} chars]`
          : 'null',
      });

      if (!fileData.FileByteArr) {
        throw new Error('No file data to download - FileByteArr is empty');
      }

      console.log('downloadFile - Decoding Base64...');
      // Decode Base64 to binary
      const byteCharacters = atob(fileData.FileByteArr);
      console.log('downloadFile - Decoded length:', byteCharacters.length);

      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
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
      console.log('downloadFile - Blob URL created:', url);

      const fileName = `${fileData.FileName}.${fileData.FileNameExtension}`;
      console.log('downloadFile - Full filename:', fileName);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none'; // Hide the element

      document.body.appendChild(a);
      console.log('downloadFile - Link element added to DOM');

      // Trigger click
      a.click();
      console.log('downloadFile - Click triggered');

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('downloadFile - Cleanup completed');
      }, 100);
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
