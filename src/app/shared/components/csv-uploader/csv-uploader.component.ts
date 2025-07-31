import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from 'src/app/dashboard/dashboard.service';

@Component({
  selector: 'app-csv-uploader',
  templateUrl: './csv-uploader.component.html',
  styleUrls: ['./csv-uploader.component.scss'],
})
export class CsvUploaderComponent {
  selectedFile: File | null = null;
  fileName: string = '';
  uploadError: string = '';
  @Output() csvFile = new EventEmitter<any>(); // emit response
  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService
  ) {}

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;

      if (!this.fileName.endsWith('.csv')) {
        this.uploadError = 'Please upload a valid CSV file.';
        this.selectedFile = null;
      } else {
        this.uploadError = '';
      }
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.csvFile.emit(formData);
  }
  removeFile(fileInput: HTMLInputElement) {
    this.selectedFile = null;
    this.fileName = '';
    this.uploadError = '';
    fileInput.value = '';
  }
}
