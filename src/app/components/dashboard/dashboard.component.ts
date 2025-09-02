import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';
import { RentalService } from '../../services/rental.service';
import { RentalStatsResponse } from '../../models/rental.interface';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Система прокату книг</span>
      
      <span class="spacer"></span>
      @if (authService.currentUser(); as user) {
        <span class="user-welcome">Вітаємо, {{ user.username }}!</span>
      }
      <button mat-stroked-button class="logout-button" (click)="logout()">
        Вийти
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dashboard-content">
      <mat-card>
        <mat-card-header>
          <mat-card-title class="title">Панель керування</mat-card-title>
          <mat-card-subtitle class="subtitle">Ваші дані:</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          @if (authService.currentUser(); as user) {
            <div class="user-info">
              <p><strong>Користувач:</strong> {{ user.username }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
            </div>
            
            @if (stats()) {
              <div class="statistics-section">
                <h3>Статистика бібліотеки:</h3>
                @if (statsLoading()) {
                  <div class="loading-stats">
                    <mat-spinner diameter="40"></mat-spinner>
                    <p>Завантаження статистики...</p>
                  </div>
                } @else {
                  <div class="stats-grid">
                    <div class="stat-card">
                      <div class="stat-info">
                        <p class="stat-label">Всього книг в оренді:</p>
                        <p class="stat-number">{{ stats()?.data?.totalRentals || 0 }}</p>
                      </div>
                    </div>
                    
                    <div class="stat-card">
                      <div class="stat-info">
                        <p class="stat-label">Активно орендовані книги:</p>
                        <p class="stat-number">{{ stats()?.data?.activeRentals || 0 }}</p>
                      </div>
                    </div>
                    
                    <div class="stat-card">
                      <div class="stat-info">
                        <p class="stat-label">Прострочені книги:</p>
                        <p class="stat-number">{{ stats()?.data?.overdueRentals || 0 }}</p>
                      </div>
                    </div>
                    
                    <div class="stat-card">
                      <div class="stat-info">
                        <p class="stat-label">Загальний дохід:</p>
                        <p class="stat-number">{{ stats()?.data?.totalRevenue || 0 }} грн</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
            
            <div class="quick-actions">

              <div class="action-section">
                <h3 class="section-title">
                  <mat-icon>dashboard</mat-icon>
                  Перегляд та управління
                </h3>
                <div class="action-buttons management-buttons">
                  <button mat-raised-button routerLink="/books" color="primary" class="action-button">
                    <mat-icon>library_books</mat-icon>
                    Переглянути каталог книг
                  </button>
                  
                  <button mat-raised-button routerLink="/rentals" color="primary" class="action-button">
                    <mat-icon>book_4</mat-icon>
                    Переглянути орендовані книги
                  </button>

                  <button mat-raised-button routerLink="/readers" color="primary" class="action-button">
                    <mat-icon>people</mat-icon>
                    Управління читачами
                  </button>
                </div>
              </div>

              <!-- ADD NEW SECTION -->
              <div class="action-section">
                <h3 class="section-title">
                  <mat-icon>add_circle</mat-icon>
                  Додавання нового
                </h3>
                <div class="action-buttons add-buttons">
                  <button mat-raised-button routerLink="/books/add" class="action-button mat-green-accent">
                    <mat-icon>add</mat-icon>
                    Додати книгу
                  </button>
                  
                  <button mat-raised-button routerLink="/rentals/add" class="action-button mat-green-accent">
                    <mat-icon>add</mat-icon>
                    Орендувати книгу
                  </button>

                  <button mat-raised-button routerLink="/readers/add" class="action-button mat-green-accent">
                    <mat-icon>add</mat-icon>
                    Додати читача
                  </button>
                </div>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = signal<RentalStatsResponse | null>(null);
  statsLoading = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    private rentalService: RentalService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  logout(): void {
    this.authService.logout();
  }

  private loadStatistics(): void {
    this.statsLoading.set(true);
    this.rentalService.getRentalStats().subscribe({
      next: (response) => {
        this.stats.set(response);
        this.statsLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.statsLoading.set(false);
      }
    });
  }
}