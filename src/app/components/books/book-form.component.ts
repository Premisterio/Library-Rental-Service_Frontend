import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Book, CreateBookRequest, UpdateBookRequest } from '../../models/book.interface';

@Component({
  selector: 'app-book-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <span>{{ isEditMode ? 'Редагування книги' : 'Додавання нової книги' }}</span>
    </mat-toolbar>

    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditMode ? 'Редагувати книгу' : 'Додати нову книгу' }}
          </mat-card-title>
          <mat-card-subtitle>
            {{ isEditMode ? 'Оновіть інформацію про книгу' : 'Заповніть всі необхідні поля' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Назва книги</mat-label>
                <input matInput formControlName="title" placeholder="Введіть назву книги">
                @if (bookForm.get('title')?.hasError('required') && bookForm.get('title')?.touched) {
                  <mat-error>Назва книги є обов'язковою</mat-error>
                }
                @if (bookForm.get('title')?.hasError('minlength')) {
                  <mat-error>Назва повинна містити мінімум 2 символи</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Автор</mat-label>
                <input matInput formControlName="author" placeholder="Введіть ім'я автора">
                @if (bookForm.get('author')?.hasError('required') && bookForm.get('author')?.touched) {
                  <mat-error>Ім'я автора є обов'язковим</mat-error>
                }
                @if (bookForm.get('author')?.hasError('minlength')) {
                  <mat-error>Ім'я автора повинно містити мінімум 2 символи</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Жанр</mat-label>
                <input matInput formControlName="genre" placeholder="Введіть жанр книги">
                @if (bookForm.get('genre')?.hasError('required') && bookForm.get('genre')?.touched) {
                  <mat-error>Жанр є обов'язковим</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Заставна вартість (грн)</mat-label>
                <input matInput type="number" formControlName="depositAmount" placeholder="0">
                @if (bookForm.get('depositAmount')?.hasError('required') && bookForm.get('depositAmount')?.touched) {
                  <mat-error>Заставна вартість є обов'язковою</mat-error>
                }
                @if (bookForm.get('depositAmount')?.hasError('min')) {
                  <mat-error>Заставна вартість повинна бути більше 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Вартість прокату за день (грн)</mat-label>
                <input matInput type="number" formControlName="rentalPricePerDay" placeholder="0">
                @if (bookForm.get('rentalPricePerDay')?.hasError('required') && bookForm.get('rentalPricePerDay')?.touched) {
                  <mat-error>Вартість прокату є обов'язковою</mat-error>
                }
                @if (bookForm.get('rentalPricePerDay')?.hasError('min')) {
                  <mat-error>Вартість прокату повинна бути більше 0</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Загальна кількість копій</mat-label>
                <input matInput type="number" formControlName="totalCopies" placeholder="1">
                @if (bookForm.get('totalCopies')?.hasError('required') && bookForm.get('totalCopies')?.touched) {
                  <mat-error>Кількість копій є обов'язковою</mat-error>
                }
                @if (bookForm.get('totalCopies')?.hasError('min')) {
                  <mat-error>Кількість копій повинна бути мінімум 1</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Доступних копій</mat-label>
                <input matInput type="number" formControlName="availableCopies" placeholder="1">
                @if (bookForm.get('availableCopies')?.hasError('required') && bookForm.get('availableCopies')?.touched) {
                  <mat-error>Кількість доступних копій є обов'язковою</mat-error>
                }
                @if (bookForm.get('availableCopies')?.hasError('min')) {
                  <mat-error>Кількість доступних копій не може бути менше 0</mat-error>
                }
                @if (bookForm.get('availableCopies')?.hasError('max')) {
                  <mat-error>Доступних копій не може бути більше за загальну кількість</mat-error>
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
                  [disabled]="bookForm.invalid || loading"
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
  styleUrls: ['./book-form.component.scss']
})
export class BookFormComponent implements OnInit {
  bookForm!: FormGroup;
  isEditMode = false;
  loading = false;
  bookId?: string;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if user has permission to manage books
    if (!this.canManageBooks()) {
      this.router.navigate(['/books']);
      return;
    }

    this.bookId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.bookId;

    if (this.isEditMode && this.bookId) {
      this.loadBook(this.bookId);
    }
  }

  private initializeForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      author: ['', [Validators.required, Validators.minLength(2)]],
      genre: ['', [Validators.required]],
      depositAmount: [0, [Validators.required, Validators.min(0.01)]],
      rentalPricePerDay: [0, [Validators.required, Validators.min(0.01)]],
      totalCopies: [1, [Validators.required, Validators.min(1)]],
      availableCopies: [1, [Validators.required, Validators.min(0)]]
    });

    // Add custom validator for available copies
    this.bookForm.get('availableCopies')?.addValidators(
      this.availableCopiesValidator.bind(this)
    );

    // Update available copies validator when total copies change
    this.bookForm.get('totalCopies')?.valueChanges.subscribe(() => {
      this.bookForm.get('availableCopies')?.updateValueAndValidity();
    });
  }

  private availableCopiesValidator(control: any) {
    const totalCopies = this.bookForm?.get('totalCopies')?.value || 0;
    const availableCopies = control.value;
    
    if (availableCopies > totalCopies) {
      return { max: true };
    }
    return null;
  }

  private loadBook(id: string): void {
    this.loading = true;
    this.bookService.getBookById(id).subscribe({
      next: (response) => {
        this.bookForm.patchValue(response.data.book);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження книги', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
        this.router.navigate(['/books']);
      }
    });
  }

  canManageBooks(): boolean {
    const user = this.authService.currentUser();
    return user ? ['admin', 'librarian'].includes(user.role) : false;
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.bookForm.value;

    if (this.isEditMode && this.bookId) {
      const updateData: UpdateBookRequest = { ...formValue };
      this.bookService.updateBook(this.bookId, updateData).subscribe({
        next: () => {
          this.snackBar.open('Книгу успішно оновлено', 'Закрити', {
            duration: 3000
          });
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка оновлення книги', 'Закрити', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    } else {
      const createData: CreateBookRequest = { ...formValue };
      this.bookService.createBook(createData).subscribe({
        next: () => {
          this.snackBar.open('Книгу успішно додано', 'Закрити', {
            duration: 3000
          });
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка додавання книги', 'Закрити', {
            duration: 5000
          });
          this.loading = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookForm.controls).forEach(key => {
      this.bookForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }
}