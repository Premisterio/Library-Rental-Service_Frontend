import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="h1">Система прокату книг</mat-card-title>
          <mat-card-subtitle>Увійдіть у свій обліковий запис</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <mat-error>Будь ласка, введіть дійсний email</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Пароль</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <mat-error>Пароль обов'язковий</mat-error>
              }
            </mat-form-field>

            <mat-card-actions>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="loginForm.invalid || isLoading()"
                class="full-width">
                @if (isLoading()) {
                  Завантаження...
                } @else {
                  Увійти
                }
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p>Немає облікового запису? <a routerLink="/register">Зареєструйтеся тут</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.snackBar.open('Успішний вхід!', 'Закрити', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          const message = error.message || 'Помилка входу. Спробуйте ще раз.';
          this.snackBar.open(message, 'Закрити', { duration: 5000 });
        }
      });
    }
  }
}