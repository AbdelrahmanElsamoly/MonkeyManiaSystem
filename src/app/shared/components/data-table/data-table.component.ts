import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() displayedColumns: string[] = [];
  userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  @Input() data: any[] = [];
  @Output() editClicked = new EventEmitter<any>();
  @Output() promoClicked = new EventEmitter<any>();
  @Output() CloseBillClicked = new EventEmitter<any>();
  @Output() itemClicked = new EventEmitter<any>();
  @Input() isActiveBills: boolean = false;
  @Input() isActive: boolean = true;

  // ✅ Server pagination inputs
  @Input() paginationType: 'local' | 'server' = 'local';
  @Input() totalItems: number = 0;
  @Output() pageChange = new EventEmitter<number>();

  filteredData: any[] = [];
  pageSize = 10;
  @Input() currentPage: number = 1; // ✅ Controlled by parent in server mode
  searchQuery = '';

  // Pagination controls
  visiblePages: number[] = [];
  maxVisible = 10;
  startPage = 1;
  endPage = 10;

  ngOnInit(): void {
    if (this.paginationType === 'local') {
      this.applyFilter();
    } else {
      this.filteredData = this.data;
      this.updatePagination();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      this.paginationType === 'local' &&
      (changes['data'] || changes['searchQuery'])
    ) {
      this.applyFilter();
    } else if (this.paginationType === 'server' && changes['data']) {
      // In server mode, just update the data without resetting page
      this.filteredData = this.data;
      this.updatePagination();
    }
  }

  applyFilter() {
    const query = this.searchQuery.toLowerCase();
    this.filteredData = this.data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );

    if (this.paginationType === 'local') {
      this.currentPage = 1; // ✅ Only reset page in local mode
    }

    this.updatePagination();
  }

  get paginatedData() {
    if (this.paginationType === 'local') {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredData.slice(start, start + this.pageSize);
    }
    return this.filteredData;
  }

  totalPages(): number {
    if (this.paginationType === 'server') {
      return Math.ceil(this.totalItems / this.pageSize);
    }
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    if (this.paginationType === 'server') {
      this.pageChange.emit(page); // Let parent update currentPage
    } else {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  updatePagination() {
    const total = this.totalPages();

    if (total <= this.maxVisible) {
      this.startPage = 1;
      this.endPage = total;
    } else {
      if (this.currentPage <= 6) {
        this.startPage = 1;
        this.endPage = this.maxVisible;
      } else if (this.currentPage + 4 >= total) {
        this.startPage = total - this.maxVisible + 1;
        this.endPage = total;
      } else {
        this.startPage = this.currentPage - 5;
        this.endPage = this.currentPage + 4;
      }
    }

    this.visiblePages = Array.from(
      { length: this.endPage - this.startPage + 1 },
      (_, i) => this.startPage + i
    );
  }

  edit(row: any) {
    this.editClicked.emit(row);
  }

  delete(row: any) {
    this.itemClicked.emit(row);
  }
}
