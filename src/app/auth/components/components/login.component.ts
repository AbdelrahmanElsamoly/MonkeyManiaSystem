import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { loginService } from '../../login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private loginService: loginService,
    private toaster: ToastrService,
    private router: Router,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('ar');
    translate.use('ar');
    document.body.dir = 'rtl';
    this.loginForm = this.fb.group({
      phone_number: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;

      this.loginService.login(credentials).subscribe(
        (res: any) => {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          if (res.user.role === 'owner' || res.user.role === 'admin') {
            this.router.navigate(['branches']);
          } else {
            this.toaster.success(res.message);
            this.router.navigate(['/dashboard']);
          }
        },
        (error) => {
          this.loading = false;
          this.toaster.error(error.error.message);
        }
      );
    }
  }
}
