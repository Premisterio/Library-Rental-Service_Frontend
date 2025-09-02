import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith, combineLatest } from 'rxjs';

import { RentalService } from '../../services/rental.service';
import { BookService } from '../../services/book.service';
import { ReaderService } from '../../services/reader.service';
import { AuthService } from '../../services/auth.service';
import { CreateRentalRequest } from '../../models/rental.interface';
import { Book } from '../../models/book.interface';
import { Reader } from '../../models/reader.interface';

@Component({
  selector: 'app-rental-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="books-header">
      <div class="header-left">
        <button mat-icon-button (click)="goBack()" class="back-button" aria-label="Повернутися до орендів">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Нова оренда</h1>
      </div>
    </div>

    <div class="form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Створити нову оренду</mat-card-title>
          <mat-card-subtitle>Заповніть всі необхідні поля для оформлення оренди</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="rentalForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Книга</mat-label>
                <input matInput 
                       formControlName="bookSearch" 
                       [matAutocomplete]="bookAuto"
                       placeholder="Почніть вводити назву або автора...">
                <mat-autocomplete #bookAuto="matAutocomplete" 
                                  [displayWith]="displayBook"
                                  (optionSelected)="onBookSelected($event)">
                  @for (book of filteredBooks$ | async; track book._id) {
                    <mat-option [value]="book">
                      <div class="book-option">
                        <div class="book-title">{{ book.title }}</div>
                        <div class="book-author">{{ book.author }}</div>
                        <div class="book-availability" 
                             [class.unavailable]="book.availableCopies === 0">
                          {{ book.availableCopies > 0 ? 'Доступна' : 'Недоступна' }}
                          ({{ book.availableCopies }}/{{ book.totalCopies }})
                        </div>
                      </div>
                    </mat-option>
                  }
                </mat-autocomplete>
                @if (rentalForm.get('bookId')?.hasError('required') && rentalForm.get('bookId')?.touched) {
                  <mat-error>Оберіть книгу для оренди</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Читач</mat-label>
                <input matInput 
                       formControlName="readerSearch" 
                       [matAutocomplete]="readerAuto"
                       placeholder="Почніть вводити ім'я або прізвище...">
                <mat-autocomplete #readerAuto="matAutocomplete" 
                                  [displayWith]="displayReader"
                                  (optionSelected)="onReaderSelected($event)">
                  @for (reader of filteredReaders$ | async; track reader._id) {
                    <mat-option [value]="reader">
                      <div class="reader-option">
                        <div class="reader-name">{{ reader.lastName }} {{ reader.firstName }}</div>
                        <div class="reader-category">{{ getCategoryLabel(reader.category) }}</div>
                        <div class="reader-phone">{{ reader.phone }}</div>
                      </div>
                    </mat-option>
                  }
                </mat-autocomplete>
                @if (rentalForm.get('readerId')?.hasError('required') && rentalForm.get('readerId')?.touched) {
                  <mat-error>Оберіть читача для оренди</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Очікувана дата повернення</mat-label>
                <input matInput 
                       formControlName="expectedReturnDate"
                       [matDatepicker]="picker"
                       [min]="minDate"
                       [max]="maxDate">
                <mat-hint>Оберіть дату, коли читач повинен повернути книгу</mat-hint>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (rentalForm.get('expectedReturnDate')?.hasError('required') && rentalForm.get('expectedReturnDate')?.touched) {
                  <mat-error>Оберіть дату повернення</mat-error>
                }
                @if (rentalForm.get('expectedReturnDate')?.hasError('matDatepickerMin')) {
                  <mat-error>Дата повернення не може бути раніше завтрашнього дня</mat-error>
                }
              </mat-form-field>
            </div>

            @if (selectedBook && selectedReader) {
              <div class="rental-summary">
                <h3>Підсумок оренди</h3>
                <div class="summary-details">
                  <p><strong>Книга:</strong> {{ selectedBook.title }} - {{ selectedBook.author }}</p>
                  <p><strong>Читач:</strong> {{ selectedReader.lastName }} {{ selectedReader.firstName }}</p>
                  <p><strong>Категорія читача:</strong> {{ getCategoryLabel(selectedReader.category) }}</p>
                  <p><strong>Застава:</strong> {{ selectedBook.depositAmount }} грн</p>
                  <p><strong>Вартість за день:</strong> {{ selectedBook.rentalPricePerDay }} грн</p>
                  @if (estimatedCost > 0) {
                    <p class="estimated-cost"><strong>Орієнтовна вартість:</strong> {{ estimatedCost }} грн</p>
                    @if (discount > 0) {
                      <p class="discount"><strong>Знижка ({{ discountPercentage }}%):</strong> -{{ discount }} грн</p>
                    }
                  }
                </div>
              </div>
            }
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button type="button" (click)="goBack()">Скасувати</button>
          <button mat-raised-button 
                  color="primary" 
                  type="submit" 
                  [disabled]="rentalForm.invalid || loading"
                  (click)="onSubmit()">
            @if (loading) {
              Створення...
            } @else {
              Створити оренду
            }
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./rental-form.component.scss']
})
export class RentalFormComponent implements OnInit {
  rentalForm!: FormGroup;
  loading = false;
  
  books: Book[] = [];
  readers: Reader[] = [];
  selectedBook: Book | null = null;
  selectedReader: Reader | null = null;
  
  filteredBooks$!: Observable<Book[]>;
  filteredReaders$!: Observable<Reader[]>;
  
  minDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // One year from now
  
  estimatedCost = 0;
  discount = 0;
  discountPercentage = 0;

  constructor(
    private fb: FormBuilder,
    private rentalService: RentalService,
    private bookService: BookService,
    private readerService: ReaderService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupAutocomplete();
  }

  private initializeForm(): void {
    this.rentalForm = this.fb.group({
      bookSearch: ['', [Validators.required]],
      bookId: ['', [Validators.required]],
      readerSearch: ['', [Validators.required]],
      readerId: ['', [Validators.required]],
      expectedReturnDate: ['', [Validators.required]]
    });

    // Calculate estimated cost when date changes
    this.rentalForm.get('expectedReturnDate')?.valueChanges.subscribe(() => {
      this.calculateEstimatedCost();
    });
  }

  private setupAutocomplete(): void {
    this.filteredBooks$ = this.rentalForm.get('bookSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterBooks(typeof value === 'string' ? value : ''))
    );

    this.filteredReaders$ = this.rentalForm.get('readerSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterReaders(typeof value === 'string' ? value : ''))
    );
  }

  private _filterBooks(value: string): Book[] {
    const filterValue = value.toLowerCase();
    return this.books.filter(book => 
      book.availableCopies > 0 && (
        book.title.toLowerCase().includes(filterValue) ||
        book.author.toLowerCase().includes(filterValue)
      )
    );
  }

  private _filterReaders(value: string): Reader[] {
    const filterValue = value.toLowerCase();
    return this.readers.filter(reader => 
      reader.firstName.toLowerCase().includes(filterValue) ||
      reader.lastName.toLowerCase().includes(filterValue) ||
      reader.phone.includes(filterValue)
    );
  }

  private loadData(): void {
    this.loading = true;
    
    combineLatest([
      this.bookService.getAllBooks(),
      this.readerService.getAllReaders()
    ]).subscribe({
      next: ([booksResponse, readersResponse]) => {
        this.books = booksResponse.data.books.filter(book => book.availableCopies > 0);
        this.readers = readersResponse.data.readers;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження даних', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  displayBook(book: Book): string {
    return book ? `${book.title} - ${book.author}` : '';
  }

  displayReader(reader: Reader): string {
    return reader ? `${reader.lastName} ${reader.firstName}` : '';
  }

  onBookSelected(event: any): void {
    this.selectedBook = event.option.value;
    this.rentalForm.patchValue({ bookId: this.selectedBook?._id });
    this.calculateEstimatedCost();
  }

  onReaderSelected(event: any): void {
    this.selectedReader = event.option.value;
    this.rentalForm.patchValue({ readerId: this.selectedReader?._id });
    this.calculateEstimatedCost();
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'regular': 'Звичайний',
      'student': 'Студент',
      'senior': 'Пенсіонер'
    };
    return labels[category as keyof typeof labels] || category;
  }

  private calculateEstimatedCost(): void {
    if (!this.selectedBook || !this.selectedReader || !this.rentalForm.get('expectedReturnDate')?.value) {
      this.estimatedCost = 0;
      this.discount = 0;
      this.discountPercentage = 0;
      return;
    }

    const expectedDate = new Date(this.rentalForm.get('expectedReturnDate')?.value);
    const today = new Date();
    const diffTime = expectedDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      this.estimatedCost = 0;
      return;
    }

    const baseCost = days * this.selectedBook.rentalPricePerDay;
    
    // Apply discounts based on reader category
    switch (this.selectedReader.category) {
      case 'student':
        this.discountPercentage = 20;
        this.discount = baseCost * 0.2;
        break;
      case 'senior':
        this.discountPercentage = 15;
        this.discount = baseCost * 0.15;
        break;
      default:
        this.discountPercentage = 0;
        this.discount = 0;
    }

    this.estimatedCost = baseCost - this.discount;
  }


  onSubmit(): void {
    if (this.rentalForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const createData: CreateRentalRequest = {
      bookId: this.rentalForm.value.bookId,
      readerId: this.rentalForm.value.readerId,
      expectedReturnDate: this.rentalForm.value.expectedReturnDate.toISOString().split('T')[0]
    };

    this.rentalService.createRental(createData).subscribe({
      next: () => {
        this.snackBar.open('Оренду успішно створено', 'Закрити', {
          duration: 3000
        });
        this.router.navigate(['/rentals']);
      },
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка створення оренди', 'Закрити', {
          duration: 5000
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.rentalForm.controls).forEach(key => {
      this.rentalForm.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    window.history.back();
  }
}