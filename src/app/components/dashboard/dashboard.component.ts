import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
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
              <p><strong>Роль:</strong> {{ getRoleTranslation(user.role) }}</p>
            </div>
            
            <div class="quick-actions">
              <h3>Швидкі дії:</h3>
              <div class="action-buttons">
                <button mat-raised-button routerLink="/books" color="primary" class="action-button">
                  <mat-icon>library_books</mat-icon>
                  Переглянути книги
                </button>
                
                @if (canManageLibrary()) {
                  <button mat-raised-button routerLink="/books/add" class="action-button mat-green-accent">
                    <mat-icon>add</mat-icon>
                    Додати книгу
                  </button>
                  
                  <button mat-raised-button routerLink="/rentals" color="primary" class="action-button">
                    <mat-icon>assignment</mat-icon>
                    Переглянути оренди
                  </button>
                  
                  <button mat-raised-button routerLink="/rentals/add" class="action-button mat-green-accent">
                    <mat-icon>add_circle</mat-icon>
                    Нова оренда
                  </button>

                  <button mat-raised-button routerLink="/readers" color="accent" class="action-button">
                    <mat-icon>people</mat-icon>
                    Управління читачами
                  </button>
                  
                }
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }

  canManageLibrary(): boolean {
    const user = this.authService.currentUser();
    return user ? ['admin', 'librarian'].includes(user.role) : false;
  }

  getRoleTranslation(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'reader': 'Читач',
      'librarian': 'Бібліотекар',
      'admin': 'Адміністратор'
    };
    return roleTranslations[role] || role;
  }
}