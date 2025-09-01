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
import { MatTabsModule } from '@angular/material/tabs';

import { RentalService } from '../../services/rental.service';
import { AuthService } from '../../services/auth.service';
import { Rental } from '../../models/rental.interface';

@Component({
  selector: 'app-rentals-list',
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
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="rentals-header">
      <div class="header-left">
        <button mat-icon-button routerLink="/dashboard" class="back-button" aria-label="Повернутися до панелі керування">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Управління орендованими книгами</h1>
      </div>
      @if (canManageRentals()) {
        <button mat-raised-button color="primary" routerLink="/rentals/add">
          <mat-icon>add</mat-icon>
          Орендувати книгу
        </button>
      }
    </div>

    <mat-tab-group class="rental-tabs" (selectedTabChange)="onTabChange($event)">
      <mat-tab label="Всі оренди">
        <ng-template matTabContent>
          <div class="tab-content">
            @if (rentalService.loading()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
                <p>Завантаження орендів...</p>
              </div>
            } @else if (filteredRentals().length === 0) {
              <div class="no-rentals">
                <mat-icon>library_books</mat-icon>
                <h3>Оренди не знайдені</h3>
                <p>Поки що немає жодної оренди</p>
              </div>
            } @else {
              <div class="rentals-grid">
                @for (rental of filteredRentals(); track rental._id) {
                  <mat-card class="rental-card" [class]="getRentalStatusClass(rental)">
                    <mat-card-header>
                      <mat-card-title>{{ rental.book.title }}</mat-card-title>
                      <mat-card-subtitle>{{ rental.book.author }}</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="rental-info">
                        <div class="reader-info">
                          <p><strong>Читач:</strong> {{ rental.reader.lastName }} {{ rental.reader.firstName }}</p>
                          <p><strong>Категорія:</strong> {{ getCategoryLabel(rental.reader.category) }}</p>
                        </div>
                        
                        <div class="dates-info">
                          <p><strong>Дата видачі:</strong> {{ formatDate(rental.issueDate) }}</p>
                          <p><strong>Очікувана дата повернення:</strong> {{ formatDate(rental.expectedReturnDate) }}</p>
                          @if (rental.actualReturnDate) {
                            <p><strong>Фактична дата повернення:</strong> {{ formatDate(rental.actualReturnDate) }}</p>
                          }
                        </div>
                        
                        <div class="financial-info">
                          @if (rental.totalRentalCost) {
                            <p><strong>Вартість оренди:</strong> {{ rental.totalRentalCost }} грн</p>
                          }
                          @if (rental.fineAmount && rental.fineAmount > 0) {
                            <p class="fine"><strong>Штраф:</strong> {{ rental.fineAmount }} грн</p>
                          }
                          @if (rental.discount && rental.discount > 0) {
                            <p class="discount"><strong>Знижка:</strong> {{ rental.discount }} грн</p>
                          }
                          @if (rental.finalAmount) {
                            <p class="final-amount"><strong>Підсумок:</strong> {{ rental.finalAmount }} грн</p>
                          }
                        </div>
                        
                        <mat-chip-set>
                          <mat-chip [color]="getStatusColor(rental.status)">
                            {{ getStatusLabel(rental.status) }}
                          </mat-chip>
                          @if (rental.isOverdue && rental.status === 'active') {
                            <mat-chip color="warn">Прострочено</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions align="start">
                      @if (canManageRentals()) {
                        @if (rental.status === 'active') {
                          <button mat-raised-button color="accent" [routerLink]="['/rentals/return', rental._id]">
                            <mat-icon>keyboard_return</mat-icon>
                            Повернути
                          </button>
                        }
                        <button mat-button [routerLink]="['/rentals', rental._id]">
                          <mat-icon>visibility</mat-icon>
                          Деталі
                        </button>
                      }
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </ng-template>
      </mat-tab>
      
      <mat-tab label="Активні">
        <ng-template matTabContent>
          <div class="tab-content">
            @if (rentalService.loading()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
                <p>Завантаження активних орендів...</p>
              </div>
            } @else if (filteredRentals().length === 0) {
              <div class="no-rentals">
                <mat-icon>library_books</mat-icon>
                <h3>Активні оренди не знайдені</h3>
                <p>Поки що немає жодної активної оренди</p>
              </div>
            } @else {
              <div class="rentals-grid">
                @for (rental of filteredRentals(); track rental._id) {
                  <mat-card class="rental-card" [class]="getRentalStatusClass(rental)">
                    <mat-card-header>
                      <mat-card-title>{{ rental.book.title }}</mat-card-title>
                      <mat-card-subtitle>{{ rental.book.author }}</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="rental-info">
                        <div class="reader-info">
                          <p><strong>Читач:</strong> {{ rental.reader.lastName }} {{ rental.reader.firstName }}</p>
                          <p><strong>Категорія:</strong> {{ getCategoryLabel(rental.reader.category) }}</p>
                        </div>
                        
                        <div class="dates-info">
                          <p><strong>Дата видачі:</strong> {{ formatDate(rental.issueDate) }}</p>
                          <p><strong>Очікувана дата повернення:</strong> {{ formatDate(rental.expectedReturnDate) }}</p>
                        </div>
                        
                        <mat-chip-set>
                          <mat-chip [color]="getStatusColor(rental.status)">
                            {{ getStatusLabel(rental.status) }}
                          </mat-chip>
                          @if (rental.isOverdue && rental.status === 'active') {
                            <mat-chip color="warn">Прострочено</mat-chip>
                          }
                        </mat-chip-set>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions align="start">
                      @if (canManageRentals()) {
                        @if (rental.status === 'active') {
                          <button mat-raised-button color="accent" [routerLink]="['/rentals/return', rental._id]">
                            <mat-icon>keyboard_return</mat-icon>
                            Повернути
                          </button>
                        }
                        <button mat-button [routerLink]="['/rentals', rental._id]">
                          <mat-icon>visibility</mat-icon>
                          Деталі
                        </button>
                      }
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </ng-template>
      </mat-tab>
      
      <mat-tab label="Прострочені">
        <ng-template matTabContent>
          <div class="tab-content">
            @if (rentalService.loading()) {
              <div class="loading-container">
                <mat-spinner></mat-spinner>
                <p>Завантаження прострочених орендів...</p>
              </div>
            } @else if (filteredRentals().length === 0) {
              <div class="no-rentals">
                <mat-icon>library_books</mat-icon>
                <h3>Прострочені оренди не знайдені</h3>
                <p>Немає прострочених орендів - це добре!</p>
              </div>
            } @else {
              <div class="rentals-grid">
                @for (rental of filteredRentals(); track rental._id) {
                  <mat-card class="rental-card overdue">
                    <mat-card-header>
                      <mat-card-title>{{ rental.book.title }}</mat-card-title>
                      <mat-card-subtitle>{{ rental.book.author }}</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="rental-info">
                        <div class="reader-info">
                          <p><strong>Читач:</strong> {{ rental.reader.lastName }} {{ rental.reader.firstName }}</p>
                          <p><strong>Категорія:</strong> {{ getCategoryLabel(rental.reader.category) }}</p>
                          <p><strong>Телефон:</strong> {{ rental.reader.phone }}</p>
                        </div>
                        
                        <div class="dates-info">
                          <p><strong>Дата видачі:</strong> {{ formatDate(rental.issueDate) }}</p>
                          <p><strong>Очікувана дата повернення:</strong> {{ formatDate(rental.expectedReturnDate) }}</p>
                          <p class="overdue-days"><strong>Днів прострочення:</strong> {{ getOverdueDays(rental.expectedReturnDate) }}</p>
                        </div>
                        
                        <mat-chip-set>
                          <mat-chip color="warn">Прострочена</mat-chip>
                        </mat-chip-set>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions align="start">
                      @if (canManageRentals()) {
                        <button mat-raised-button color="warn" [routerLink]="['/rentals/return', rental._id]">
                          <mat-icon>keyboard_return</mat-icon>
                          Терміново повернути
                        </button>
                        <button mat-button [routerLink]="['/rentals', rental._id]">
                          <mat-icon>visibility</mat-icon>
                          Деталі
                        </button>
                      }
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
  styleUrls: ['./rentals-list.component.scss']
})

export class RentalsListComponent implements OnInit {
  constructor(
    public rentalService: RentalService,
    public authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  filteredRentals = computed(() => {
    return this.rentalService.rentals();
  });

  canManageRentals(): boolean {
    const user = this.authService.currentUser();
    return user ? ['admin', 'librarian'].includes(user.role) : false;
  }

  getStatusLabel(status: string): string {
    const labels = {
      'active': 'Активна',
      'returned': 'Повернено',
      'overdue': 'Прострочена'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getStatusColor(status: string): string {
    const colors = {
      'active': 'primary',
      'returned': 'accent',
      'overdue': 'warn'
    };
    return colors[status as keyof typeof colors] || 'primary';
  }

  getCategoryLabel(category: string): string {
    const labels = {
      'regular': 'Звичайний',
      'student': 'Студент',
      'senior': 'Пенсіонер'
    };
    return labels[category as keyof typeof labels] || category;
  }

  getRentalStatusClass(rental: Rental): string {
    if (rental.status === 'returned') return 'returned';
    if (rental.isOverdue || rental.status === 'overdue') return 'overdue';
    return 'active';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA');
  }

  getOverdueDays(expectedReturnDate: string): number {
    const today = new Date();
    const expectedDate = new Date(expectedReturnDate);
    const diffTime = today.getTime() - expectedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  onTabChange(event: any): void {
    const index = event.index;
    switch (index) {
      case 0:
        this.loadRentals();
        break;
      case 1:
        this.loadActiveRentals();
        break;
      case 2:
        this.loadOverdueRentals();
        break;
    }
  }

  private loadRentals(): void {
    this.rentalService.getAllRentals().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження орендів', 'Закрити', {
          duration: 5000
        });
      }
    });
  }

  private loadActiveRentals(): void {
    this.rentalService.getActiveRentals().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження активних орендів', 'Закрити', {
          duration: 5000
        });
      }
    });
  }

  private loadOverdueRentals(): void {
    this.rentalService.getOverdueRentals().subscribe({
      error: (error) => {
        this.snackBar.open(error.message || 'Помилка завантаження прострочених орендів', 'Закрити', {
          duration: 5000
        });
      }
    });
  }
}