import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: number;
}

type CreateUserPayload = {
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: number;
  password: string;
};

type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & { password?: string };

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public list() {
    return this.http
      .get<{ data: AdminUser[] }>(`${this.apiUrl}/users`, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public create(payload: CreateUserPayload) {
    return this.http
      .post<{ data: AdminUser }>(`${this.apiUrl}/users`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public update(userId: string, payload: UpdateUserPayload) {
    return this.http
      .put<{ data: AdminUser }>(`${this.apiUrl}/users/${userId}`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public delete(userId: string) {
    return this.http
      .delete<{ data: AdminUser }>(`${this.apiUrl}/users/${userId}`, { withCredentials: true })
      .pipe(map((response) => response.data));
  }
}
