import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.interface';

@Component({
  selector: 'app-books-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="books-header">
      <div class="header-left">
        <button mat-icon-button routerLink="/dashboard" class="back-button" aria-label="Повернутися до панелі керування">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Каталог книг</h1>
      </div>
      <button mat-raised-button color="primary" routerLink="/books/add">
        <mat-icon>add</mat-icon>
        Додати книгу
      </button>
    </div>

    <div class="search-filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Знайти книгу</mat-label>
        <input matInput 
               [ngModel]="searchQuery()"
               (ngModelChange)="searchQuery.set($event); onSearchChange()"
               placeholder="Назва, автор...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Жанр</mat-label>
        <mat-select [value]="selectedGenre()" (selectionChange)="selectedGenre.set($event.value); onFilterChange()">
          <mat-option value="">Всі жанри</mat-option>
          @for (genre of availableGenres(); track genre) {
            <mat-option [value]="genre">{{ genre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Статус</mat-label>
        <mat-select [value]="availabilityFilter()" (selectionChange)="availabilityFilter.set($event.value); onFilterChange()">
          <mat-option value="">Всі</mat-option>
          <mat-option value="true">Доступні</mat-option>
          <mat-option value="false">Недоступні</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="books-content">
      @if (bookService.loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Завантаження книг...</p>
        </div>
      } @else if (filteredBooks().length === 0 && !bookService.loading()) {
        <div class="no-books">
          <mat-icon>book</mat-icon>
          <h3>Книги не знайдені</h3>
          <p>Спробуйте змінити параметри пошуку</p>
        </div>
      } @else {
        <div class="books-grid">
          @for (book of filteredBooks(); track book._id) {
            <mat-card class="book-card" [class.unavailable]="book.availableCopies === 0">
              <mat-card-header>
                <mat-card-title>{{ book.title }}</mat-card-title>
                <mat-card-subtitle>{{ book.author }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="book-info">
                  <mat-chip-set>
                    <mat-chip>{{ book.genre }}</mat-chip>
                    <mat-chip [color]="book.availableCopies > 0 ? 'primary' : 'warn'">
                      {{ book.availableCopies > 0 ? 'Доступна' : 'Недоступна' }}
                    </mat-chip>
                  </mat-chip-set>
                  
                  <div class="book-details">
                    <p><strong>Застава:</strong> {{ book.depositAmount }} грн</p>
                    <p><strong>Прокат за день:</strong> {{ book.rentalPricePerDay }} грн</p>
                    <p><strong>Доступно копій:</strong> {{ book.availableCopies }} з {{ book.totalCopies }}</p>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions align="start">
                <button mat-button [routerLink]="['/books/edit', book._id]">
                  <mat-icon>edit</mat-icon>
                  Редагувати
                </button>
                <button mat-button color="warn" (click)="deleteBook(book)">
                  <mat-icon>delete</mat-icon>
                  Видалити
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent implements OnInit {
  searchQuery = signal('');
  selectedGenre = signal('');
  availabilityFilter = signal('');
  
  private searchTimeout: any;

  constructor(
    public bookService: BookService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  availableGenres = computed(() => {
    const allBooks = this.bookService.books();
    const genres = allBooks.map(book => book.genre);
    return [...new Set(genres)].sort();
  });

  filteredBooks = computed(() => {
    let books = this.bookService.books();
    
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase().trim();
      books = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }
    
    if (this.selectedGenre()) {
      books = books.filter(book => book.genre === this.selectedGenre());
    }
    
    if (this.availabilityFilter() !== '') {
      const isAvailable = this.availabilityFilter() === 'true';
      books = books.filter(book => 
        isAvailable ? book.availableCopies > 0 : book.availableCopies === 0
      );
    }
    
    return books;
  });


  private loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження книг', 'Закрити', {
          duration: 5000
        });
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  onFilterChange(): void {
    // Client-side filtering handled by computed property
  }

  private applyFilters(): void {
    const params = {
      ...(this.searchQuery().trim() && { search: this.searchQuery().trim() })
    };

    this.bookService.getAllBooks(params).subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка пошуку книг', 'Закрити', {
          duration: 5000
        });
      }
    });
  }

  deleteBook(book: Book): void {
    if (confirm(`Ви впевнені, що хочете видалити книгу "${book.title}"?`)) {
      this.bookService.deleteBook(book._id).subscribe({
        next: () => {
          this.snackBar.open('Книгу успішно видалено', 'Закрити', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка видалення книги', 'Закрити', {
            duration: 5000
          });
        }
      });
    }
  }
}