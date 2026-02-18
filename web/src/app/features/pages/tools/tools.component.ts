import { Component, computed, signal, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ToolsApiService } from '@shared/services/tools-api.service';
import { Tool, ToolType } from '@shared/models/tool.model';


@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss'],
  imports: [MatIconModule]
})
export class Tools {
  private readonly api = inject(ToolsApiService);

  public readonly toolTypes = signal<ToolType[]>([]);
  public readonly tools = signal<Tool[]>([]);
  public readonly selectedTypeId = signal<string | null>(null);

  public readonly categories = computed(() => this.toolTypes().map(t => t.name));

  public readonly filteredTools = computed(() => {
    const typeId = this.selectedTypeId();
    const items = this.tools();

    if (!typeId) {
      return items;
    }

    return items.filter((item) => item.toolTypeId === typeId);
  });

  constructor() {
    this.api.listTypes().subscribe(types => {
      this.toolTypes.set(types);
      // Select first type by default
      if (types.length) {
        this.selectedTypeId.set(types[0].id);
      }
    });

    this.api.listTools().subscribe(items => {
      this.tools.set(items);
    });
  }

  public selectCategory(category: string): void {
    const type = this.toolTypes().find(t => t.name === category);
    this.selectedTypeId.set(type?.id ?? null);
  }

}