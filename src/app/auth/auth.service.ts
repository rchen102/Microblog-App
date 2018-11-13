import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient,
              private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post('http://localhost:3000/api/users/signup', authData)
      .subscribe(response => {
        console.log(response);
        this.router.navigate(['/']);
      });
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post<{message: string, token: string, expiresIn: number}>('http://localhost:3000/api/users/login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          console.log(response.message);
          // Set timer
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          // Update status
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          // Save token and expiration data in localStorage
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate);
          this.router.navigate(['/']);
        }
      });
  }

  logoutUser() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer); // If user logout manually, we should clear timer
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  // Will run in app component
  autoAuthUser() {
    const authInformation =  this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn / 1000);
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logoutUser();
    }, duration * 1000);  // unit is ms
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate)
    };
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }
}
