import { Component, OnInit, computed } from '@angular/core';
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

import { ReaderService } from '../../services/reader.service';
import { AuthService } from '../../services/auth.service';
import { Reader } from '../../models/reader.interface';

@Component({
  selector: 'app-readers-list',
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
    <div class="readers-header">
      <div class="header-left">
        <button mat-icon-button routerLink="/dashboard" class="back-button" aria-label="Повернутися до панелі керування">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Читачі</h1>
      </div>
      @if (canManageReaders()) {
        <button mat-raised-button color="primary" routerLink="/readers/add">
          <mat-icon>add</mat-icon>
          Додати читача
        </button>
      }
    </div>

    <div class="search-filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Пошук читачів</mat-label>
        <input matInput 
               [(ngModel)]="searchQuery" 
               (input)="onSearchChange()"
               placeholder="Ім'я, прізвище, телефон...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Категорія</mat-label>
        <mat-select [(value)]="selectedCategory" (selectionChange)="onFilterChange()">
          <mat-option value="">Всі категорії</mat-option>
          <mat-option value="regular">Звичайні</mat-option>
          <mat-option value="student">Студенти</mat-option>
          <mat-option value="senior">Пенсіонери</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <div class="readers-content">
      @if (readerService.loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Завантаження читачів...</p>
        </div>
      } @else if (filteredReaders().length === 0 && !readerService.loading()) {
        <div class="no-readers">
          <mat-icon>people</mat-icon>
          <h3>Читачі не знайдені</h3>
          <p>Спробуйте змінити параметри пошуку</p>
        </div>
      } @else {
        <div class="readers-grid">
          @for (reader of filteredReaders(); track reader._id) {
            <mat-card class="reader-card">
              <mat-card-header>
                <mat-card-title>{{ reader.lastName }} {{ reader.firstName }}</mat-card-title>
                <mat-card-subtitle>{{ reader.middleName || '' }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="reader-info">
                  <mat-chip-set>
                    <mat-chip [color]="getCategoryColor(reader.category)">
                      {{ getCategoryLabel(reader.category) }}
                    </mat-chip>
                  </mat-chip-set>
                  
                  <div class="reader-details">
                    <p><strong>Телефон:</strong> {{ reader.phone }}</p>
                    @if (reader.email) {
                      <p><strong>Email:</strong> {{ reader.email }}</p>
                    }
                    <p><strong>Адреса:</strong> {{ reader.address }}</p>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions align="start">
                @if (canManageReaders()) {
                  <button mat-button [routerLink]="['/readers/edit', reader._id]">
                    <mat-icon>edit</mat-icon>
                    Редагувати
                  </button>
                  <button mat-button [routerLink]="['/rentals/reader', reader._id]">
                    <mat-icon>library_books</mat-icon>
                    Оренди
                  </button>
                  <button mat-button color="warn" (click)="deleteReader(reader)">
                    <mat-icon>delete</mat-icon>
                    Видалити
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./readers-list.component.scss']
})
export class ReadersListComponent implements OnInit {
  searchQuery = '';
  selectedCategory = '';
  
  private searchTimeout: any;

  constructor(
    public readerService: ReaderService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadReaders();
  }

  filteredReaders = computed(() => {
    let readers = this.readerService.readers();
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      readers = readers.filter(reader => 
        reader.firstName.toLowerCase().includes(query) ||
        reader.lastName.toLowerCase().includes(query) ||
        (reader.middleName && reader.middleName.toLowerCase().includes(query)) ||
        reader.phone.includes(query) ||
        (reader.email && reader.email.toLowerCase().includes(query))
      );
    }
    
    if (this.selectedCategory) {
      readers = readers.filter(reader => reader.category === this.selectedCategory);
    }
    
    return readers;
  });

  canManageReaders(): boolean {
    const user = this.authService.currentUser();
    return user ? ['admin', 'librarian'].includes(user.role) : false;
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'regular': 'Звичайний',
      'student': 'Студент',
      'senior': 'Пенсіонер'
    };
    return labels[category as keyof typeof labels] || category;
  }

  getCategoryColor(category: string): string {
    const colors = {
      'regular': 'primary',
      'student': 'accent',
      'senior': 'warn'
    };
    return colors[category as keyof typeof colors] || 'primary';
  }

  private loadReaders(): void {
    this.readerService.getAllReaders().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження читачів', 'Закрити', {
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
    this.applyFilters();
  }

  private applyFilters(): void {
    const params = {
      ...(this.searchQuery.trim() && { q: this.searchQuery.trim() }),
      ...(this.selectedCategory && { category: this.selectedCategory })
    };

    this.readerService.getAllReaders(params).subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка пошуку читачів', 'Закрити', {
          duration: 5000
        });
      }
    });
  }

  deleteReader(reader: Reader): void {
    if (confirm(`Ви впевнені, що хочете видалити читача "${reader.firstName} ${reader.lastName}"?`)) {
      this.readerService.deleteReader(reader._id).subscribe({
        next: () => {
          this.snackBar.open('Читача успішно видалено', 'Закрити', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Помилка видалення читача', 'Закрити', {
            duration: 5000
          });
        }
      });
    }
  }
}