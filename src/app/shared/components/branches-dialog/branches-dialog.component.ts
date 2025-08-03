import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '../../shared.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-branches-dialog',
  templateUrl: './branches-dialog.component.html',
  styleUrls: ['./branches-dialog.component.scss'],
})
export class BranchesDialogComponent implements OnInit {
  branches: any[] = []; // Will come from API or dialog data
  selectedBranchId: number | null = null;
  branchInfo = JSON.parse(localStorage.getItem('branch') || '{}');
  constructor(
    private sharedService: SharedService,
    private translate: TranslateService,
    private toaster: ToastrService,
    public dialogRef: MatDialogRef<BranchesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    translate.setDefaultLang('ar');
    translate.use('ar');
    document.body.dir = 'rtl';
  }

  ngOnInit(): void {
    this.getBranches();
    this.selectedBranchId = this.branchInfo.id || null;
  }

  getBranches() {
    this.sharedService.getBranches().subscribe((res: any) => {
      this.branches = res;
    });
  }

  onConfirm() {
    const branch = this.branches.find((b) => b.id === this.selectedBranchId);
    if (branch) {
      localStorage.setItem('branch', JSON.stringify(branch));
      this.toaster.success(this.translate.instant('SUCCESS_CHOOSE'));
      this.dialogRef.close(branch);
    }
  }
  onClose() {
    this.dialogRef.close();
  }
}
