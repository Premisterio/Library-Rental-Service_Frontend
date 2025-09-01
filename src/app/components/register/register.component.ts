import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title class="h1">Система прокату книг</mat-card-title>
          <mat-card-subtitle>Реєстрація облікового запису</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width">
              <mat-label>Ім'я користувача</mat-label>
              <input matInput formControlName="username" required>
              @if (registerForm.get('username')?.invalid && registerForm.get('username')?.touched) {
                <mat-error>
                  @if (registerForm.get('username')?.errors?.['required']) {
                    Ім'я користувача обов'язкове
                  }
                  @if (registerForm.get('username')?.errors?.['minlength']) {
                    Ім'я користувача повинно містити принаймні 3 символи
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <mat-error>Будь ласка, введіть дійсний email</mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Пароль</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <mat-error>
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Пароль обов'язковий
                  }
                  @if (registerForm.get('password')?.errors?.['minlength']) {
                    Пароль повинен містити принаймні 6 символів
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field class="full-width">
              <mat-label>Роль</mat-label>
              <mat-select formControlName="role">
                <mat-option value="reader">Читач</mat-option>
                <mat-option value="librarian">Бібліотекар</mat-option>
                <mat-option value="admin">Адміністратор</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-card-actions>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading()"
                class="full-width">
                @if (isLoading()) {
                  Завантаження...
                } @else {
                  Зареєструватися
                }
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <p>Вже маєте обліковий запис? <a routerLink="/login">Увійдіть тут</a></p>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['reader', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.snackBar.open('Реєстрація успішна!', 'Закрити', { duration: 3000 });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          const message = error.message || 'Помилка реєстрації. Спробуйте ще раз.';
          this.snackBar.open(message, 'Закрити', { duration: 5000 });
        }
      });
    }
  }
}