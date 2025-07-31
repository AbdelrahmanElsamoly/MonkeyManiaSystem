import { Component, Input, OnInit } from '@angular/core';
import { loginService } from '../../login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss'],
})
export class BranchesComponent implements OnInit {
  @Input() branches: any[] = []; // From API
  selectedBranchId: number | null = null;
  constructor(
    private loginService: loginService,
    private translate: TranslateService,
    private router: Router,
    private toaster: ToastrService
  ) {
    translate.setDefaultLang('ar');
    translate.use('ar');
    document.body.dir = 'rtl';
  }

  ngOnInit(): void {
    this.getBranches();
  }
  getBranches() {
    this.loginService.getBranches().subscribe((res: any) => {
      this.branches = res;
    });
  }
  onConfirm() {
    const branch = this.branches.find((b) => b.id === this.selectedBranchId);
    if (branch) {
      localStorage.setItem('branch', JSON.stringify(branch));
      this.toaster.success(this.translate.instant('SUCCESS_CHOOSE'));
      this.router.navigate(['/dashboard']);
    }
  }
}
