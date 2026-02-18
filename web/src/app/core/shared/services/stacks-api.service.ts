import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import {
  CreateStackPayload,
  CreateStackVersionPayload,
  Stack,
  StackVersion,
  UpdateStackVersionPayload,
} from '@shared/models/stack.model';

@Injectable({ providedIn: 'root' })
export class StacksApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public listStacks() {
    return this.http
      .get<{ data: Stack[] }>(`${this.apiUrl}/stacks`)
      .pipe(map((response) => response.data));
  }

  public createStack(payload: CreateStackPayload) {
    return this.http
      .post<{ data: Stack }>(`${this.apiUrl}/stacks`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public listVersions(stackId: string) {
    return this.http
      .get<{ data: StackVersion[] }>(`${this.apiUrl}/stacks/${stackId}/versions`)
      .pipe(map((response) => response.data));
  }

  public createVersion(stackId: string, payload: CreateStackVersionPayload) {
    return this.http
      .post<{ data: StackVersion }>(`${this.apiUrl}/stacks/${stackId}/versions`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public updateVersion(versionId: string, payload: UpdateStackVersionPayload) {
    return this.http
      .put<{ data: StackVersion }>(`${this.apiUrl}/stacks/versions/${versionId}`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public deleteVersion(versionId: string) {
    return this.http
      .delete<{ data: StackVersion }>(`${this.apiUrl}/stacks/versions/${versionId}`, { withCredentials: true })
      .pipe(map((response) => response.data));
  }
}
