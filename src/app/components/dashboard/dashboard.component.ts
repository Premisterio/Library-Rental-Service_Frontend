import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Система прокату книг</span>
      <span class="spacer"></span>
      @if (authService.currentUser(); as user) {
        <span class="user-welcome">Вітаємо, {{ user.username }}!</span>
      }
      <button mat-stroked-button class="logout-button" (click)="logout()">Вийти</button>
    </mat-toolbar>

    <div class="dashboard-content">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Панель керування</mat-card-title>
          <mat-card-subtitle>В розробці</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          @if (authService.currentUser(); as user) {
            <p>Користувач: {{ user.username }}</p>
            <p>Email: {{ user.email }}</p>
            <p>Роль: {{ getRoleTranslation(user.role) }}</p>
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

  getRoleTranslation(role: string): string {
    const roleTranslations: { [key: string]: string } = {
      'reader': 'Читач',
      'librarian': 'Бібліотекар',
      'admin': 'Адміністратор'
    };
    return roleTranslations[role] || role;
  }
}