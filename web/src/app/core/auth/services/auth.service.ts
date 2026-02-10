import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Auth, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Login the user.
   * @param payload 
   */
  public login(payload: { email: string; password: string }) {
    return this.http.post<User>(
      `${this.apiUrl}/login`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Register the user.
   * @param payload 
   */
  public register(payload: { email: string; password: string; confirmPassword: string; }) {
    return this.http.post<User>(
      `${this.apiUrl}/register`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Reset the password.
   * @param payload 
   */
  public resetPassword(payload: { email: string; }) {
    return this.http.post(
      `${this.apiUrl}/forgot-password`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Change effectively the password.
   * @param payload 
   */
  public changePassword(payload: { token: string; password: string; }) {
    return this.http.post(
      `${this.apiUrl}/reset-password`,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Logout the user.
   */
  public logout() {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Check if the current user is logged in.
   */
  me() {
    return this.http.get<Auth>(
      `${this.apiUrl}/check`,
      { withCredentials: true }
    );
  }
}