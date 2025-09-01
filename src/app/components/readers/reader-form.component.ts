import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ReaderService } from '../../services/reader.service';
import { AuthService } from '../../services/auth.service';
import { CreateReaderRequest, UpdateReaderRequest } from '../../models/reader.interface';

@Component({
  selector: 'app-reader-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="goBack()" aria-label="Повернутися до списку читачів">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ isEditMode ? 'Редагування читача' : 'Додавання нового читача' }}</span>
    </mat-toolbar>

    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditMode ? 'Редагувати читача' : 'Додати нового читача' }}
          </mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode ? 'Оновіть інформацію про читача' : 'Заповніть всі необхідні поля' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="readerForm" (ngSubmit)="onSubmit()">
            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Прізвище</mat-label>
                <input matInput formControlName="lastName" placeholder="Введіть прізвище">
                @if (readerForm.get('lastName')?.hasError('required') && readerForm.get('lastName')?.touched) {
                  <mat-error>Прізвище є обов'язковим</mat-error>
                }
                @if (readerForm.get('lastName')?.hasError('minlength')) {
                  <mat-error>Прізвище повинно містити мінімум 2 символи</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ім'я</mat-label>
                <input matInput formControlName="firstName" placeholder="Введіть ім'я">
                @if (readerForm.get('firstName')?.hasError('required') && readerForm.get('firstName')?.touched) {
                  <mat-error>Ім'я є обов'язковим</mat-error>
                }
                @if (readerForm.get('firstName')?.hasError('minlength')) {
                  <mat-error>Ім'я повинно містити мінімум 2 символи</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>По-батькові (необов'язково)</mat-label>
                <input matInput formControlName="middleName" placeholder="Введіть по-батькові">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Адреса</mat-label>
                <input matInput formControlName="address" placeholder="Введіть адресу">
                @if (readerForm.get('address')?.hasError('required') && readerForm.get('address')?.touched) {
                  <mat-error>Адреса є обов'язковою</mat-error>
                }
                @if (readerForm.get('address')?.hasError('minlength')) {
                  <mat-error>Адреса повинна містити мінімум 5 символів</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Телефон</mat-label>
                <input matInput formControlName="phone" placeholder="+380XXXXXXXXX">
                @if (readerForm.get('phone')?.hasError('required') && readerForm.get('phone')?.touched) {
                  <mat-error>Телефон є обов'язковим</mat-error>
                }
                @if (readerForm.get('phone')?.hasError('pattern')) {
                  <mat-error>Невірний формат телефону</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email (необов'язково)</mat-label>
                <input matInput formControlName="email" placeholder="email@example.com">
                @if (readerForm.get('email')?.hasError('email')) {
                  <mat-error>Невірний формат email</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Категорія читача</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="regular">Звичайний</mat-option>
                  <mat-option value="student">Студент</mat-option>
                  <mat-option value="senior">Пенсіонер</mat-option>
                </mat-select>
                @if (readerForm.get('category')?.hasError('required') && readerForm.get('category')?.touched) {
                  <mat-error>Категорія є обов'язковою</mat-error>
                }
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="goBack()">Скасувати</button>
          <button mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="readerForm.invalid || loading"
                  (click)="onSubmit()">
            @if (loading) {
              Збереження...
            } @else {
              {{ isEditMode ? 'Оновити' : 'Додати' }}
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./reader-form.component.scss']
})
export class ReaderFormComponent implements OnInit {
  readerForm!: FormGroup;
  isEditMode = false;
  loading = false;
  readerId?: string;

  constructor(
    private fb: FormBuilder,
    private readerService: ReaderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    if (!this.canManageReaders()) {
      this.router.navigate(['/readers']);
      return;
    }

    this.readerId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.readerId;

    if (this.isEditMode && this.readerId) {
      this.loadReader(this.readerId);
    }
  }

  private initializeForm(): void {
    this.readerForm = this.fb.group({
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+380\d{9}$/)]],
      email: ['', [Validators.email]],
      category: ['regular', [Validators.required]]
    });
  }

  private loadReader(id: string): void {
    this.loading = true;
    this.readerService.getReaderById(id).subscribe({
      next: (response) => {
        this.readerForm.patchValue(response.data.reader);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження читача', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
        this.router.navigate(['/readers']);
      }
    });
  }

  canManageReaders(): boolean {
    const user = this.authService.currentUser();
    return user ? ['admin', 'librarian'].includes(user.role) : false;
  }

  onSubmit(): void {
    if (this.readerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.readerForm.value;

    // Remove empty email if not provided
    if (!formValue.email) {
      delete formValue.email;
    }

    if (this.isEditMode && this.readerId) {
      const updateData: UpdateReaderRequest = { ...formValue };
      this.readerService.updateReader(this.readerId, updateData).subscribe({
        next: () => {
          this.snackBar.open('Читача успішно оновлено', 'Закрити', {
            duration: 3000
          });
          this.router.navigate(['/readers']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка оновлення читача', 'Закрити', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    } else {
      const createData: CreateReaderRequest = { ...formValue };
      this.readerService.createReader(createData).subscribe({
        next: () => {
          this.snackBar.open('Читача успішно додано', 'Закрити', {
            duration: 3000
          });
          this.router.navigate(['/readers']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка додавання читача', 'Закрити', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.readerForm.controls).forEach(key => {
      this.readerForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/readers']);
  }
}