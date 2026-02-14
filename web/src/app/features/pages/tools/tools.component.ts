import { Component, computed, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { ToolArticle } from '@shared/models/tool-article.model';


@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss'],
  imports: [MatIconModule]
})
export class Tools {
  public readonly categories = [
    'Dernières infos',
    'Films',
    'Musique',
    'Maquettes',
    'Sites utiles',
    'Base de données',
    'IDE'
  ];

  public readonly selectedCategory = signal<string>('Sites utiles');

  public readonly articles = signal<ToolArticle[]>([
    {
      id: 1,
      title: 'Stack Overflow, MDN et DevDocs : le trio rapide pour débloquer un bug front',
      description: 'Trois sources complémentaires pour trouver des réponses vite, vérifier les APIs et valider les exemples.',
      age: 'il y a 2 jours',
      author: 'Simon Bento',
      image: 'https://picsum.photos/seed/dev-tools-1/420/220',
      link: 'https://developer.mozilla.org',
      category: 'Sites utiles'
    },
    {
      id: 2,
      title: 'Prisma Studio + migrations : garder la base propre sans ralentir l’équipe',
      description: 'Visualiser les données, versionner les schémas, et réduire les surprises en production.',
      age: 'il y a 4 jours',
      author: 'Camille Durand',
      image: 'https://picsum.photos/seed/dev-tools-2/420/220',
      link: 'https://www.prisma.io/docs',
      category: 'Base de données'
    },
    {
      id: 3,
      title: 'VS Code : extensions essentielles pour un workflow propre en Angular et Node',
      description: 'Lint, format, snippets et debug intégrés pour coder plus vite sans sacrifier la qualité.',
      age: 'il y a 4 heures',
      author: 'Hayet Kechit',
      image: 'https://picsum.photos/seed/dev-tools-3/420/220',
      link: 'https://code.visualstudio.com/docs',
      category: 'IDE'
    },
    {
      id: 4,
      title: 'Design tokens + handoff Figma : livrer des maquettes plus actionnables pour les devs',
      description: 'Nommage clair, composants robustes et exports cohérents pour limiter les allers-retours.',
      age: 'il y a 1 jour',
      author: 'Julie Martin',
      image: 'https://picsum.photos/seed/dev-tools-4/420/220',
      link: 'https://www.figma.com/community',
      category: 'Maquettes'
    }
  ]);

  public readonly filteredArticles = computed(() => {
    const category = this.selectedCategory();
    const items = this.articles();

    if (category === 'Dernières infos') {
      return items;
    }

    return items.filter((item) => item.category === category);
  });

  public selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

}