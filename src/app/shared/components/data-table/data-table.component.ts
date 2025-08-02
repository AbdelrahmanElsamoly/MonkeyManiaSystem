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
  @Input() data: any[] = [];
  @Output() editClicked = new EventEmitter<any>();
  @Output() promoClicked = new EventEmitter<any>();
  @Output() itemClicked = new EventEmitter<any>();
  @Input() isActiveBills: boolean = false;
  @Input() isActive: boolean = true;
  filteredData: any[] = [];
  pageSize = 7;
  currentPage = 1;
  searchQuery = '';

  // ✅ Pagination controls
  visiblePages: number[] = [];
  maxVisible = 10; // Max pages to show
  startPage = 1;
  endPage = 10;

  ngOnInit(): void {
    this.applyFilter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['searchQuery']) {
      this.applyFilter();
    }
  }

  applyFilter() {
    const query = this.searchQuery.toLowerCase();
    this.filteredData = this.data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePagination();
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

  // ✅ Emit Events
  edit(row: any) {
    this.editClicked.emit(row);
  }

  delete(row: any) {
    this.itemClicked.emit(row);
  }
}
