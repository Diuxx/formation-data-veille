import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import {
  CreateToolPayload,
  CreateToolTypePayload,
  Tool,
  ToolType,
  UpdateToolPayload,
} from '@shared/models/tool.model';

@Injectable({ providedIn: 'root' })
export class ToolsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public listTypes() {
    return this.http
      .get<{ data: ToolType[] }>(`${this.apiUrl}/tools/types`)
      .pipe(map((response) => response.data));
  }

  public createType(payload: CreateToolTypePayload) {
    return this.http
      .post<{ data: ToolType }>(`${this.apiUrl}/tools/types`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public listTools() {
    return this.http
      .get<{ data: Tool[] }>(`${this.apiUrl}/tools`)
      .pipe(map((response) => response.data));
  }

  public createTool(payload: CreateToolPayload) {
    return this.http
      .post<{ data: Tool }>(`${this.apiUrl}/tools`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public updateTool(toolId: string, payload: UpdateToolPayload) {
    return this.http
      .put<{ data: Tool }>(`${this.apiUrl}/tools/${toolId}`, payload, { withCredentials: true })
      .pipe(map((response) => response.data));
  }

  public deleteTool(toolId: string) {
    return this.http
      .delete<{ data: Tool }>(`${this.apiUrl}/tools/${toolId}`, { withCredentials: true })
      .pipe(map((response) => response.data));
  }
}
