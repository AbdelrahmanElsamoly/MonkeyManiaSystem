import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { SharedService } from '../../shared.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-branch-multi-select',
  templateUrl: './branch-multi-select.component.html',
  styleUrls: ['./branch-multi-select.component.scss'],
})
export class BranchMultiSelectComponent implements OnInit {
  @Output() selectedBranchesChange = new EventEmitter<number[]>();

  options: any[] = [];

  // Stores only selected IDs
  selectedValues: any[] = [];
  constructor(private sharedService: SharedService) {}
  ngOnInit() {
    this.selectedValues = ['all'];
    this.getAllBranches();
  }

  onSelectionChange(event: MatSelectChange): void {
    if (this.selectedValues.length == 0) {
      this.selectedValues = ['all'];
      this.selectedBranchesChange.emit(this.selectedValues);
      console.log(this.selectedBranchesChange);
    } else {
      const value = event.value;
      this.selectedValues = value;
    }

    this.selectedBranchesChange.emit(this.selectedValues);
  }
  clearSelection() {
    this.selectedValues = ['all'];
    this.selectedBranchesChange.emit(this.selectedValues);
  }
  getAllBranches() {
    this.sharedService.getBranches().subscribe((res: any) => {
      this.options = res;
    });
  }
}
