import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";

type MetricCard = { id: number, label: string, delta: string, value: string }

type NewsItem = {
  id: number,
  source: string,
  title: string,
  description: string,
  image: string,
  link: string,
  tags: string[],
  published: string,
  author: string,
  metrics?: MetricCard[]
}

type NewsColumn = { id: number, title: string, items: NewsItem[] }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [DatePipe]
})
export class Home {

  public today: Date = new Date();

  public columns: NewsColumn[] = [
    {
      id: 1,
      title: "Angular",
      items: [
        {
          id: 1,
          source: "Angular Weekly",
          title: "Angular v18.x (démo) : signals + SSR plus fluide, DX plus clean",
          description: "Nouveautés côté réactivité, rendu serveur, et tooling. Le feeling : moins de friction, plus de flow.",
          image: "https://picsum.photos/seed/angular-feed/120/120",
          link: "https://angular.dev",
          tags: ["Version v18.x", "Signals", "SSR/Hydration", "Builder rapide"],
          published: "il y a 5 heures",
          author: "Béatrice Madeline"
        },
        {
          id: 2,
          source: "Le Figaro Tech",
          title: "Migration Angular : pourquoi “zéro drama” devient enfin réaliste",
          description: "Stratégies de migration incrémentale, standalone APIs, et patterns pour éviter le grand saut.",
          image: "https://picsum.photos/seed/angular-migration/120/120",
          link: "https://angular.dev/reference/migrations",
          tags: ["Version v17→v18", "Standalone", "Control Flow", "Zoneless (preview)"],
          published: "il y a 20 heures",
          author: "Alexandre Devecchio"
        },
        {
          id: 3,
          source: "Sports.fr (lol)",
          title: "Perf front : le relais gagnant c’est souvent... le cache + lazy load",
          description: "Optimiser, c’est courir avec moins de poids. Bundle splitting, images, et priorités réseau.",
          image: "https://picsum.photos/seed/angular-perf/120/120",
          link: "https://web.dev/learn/performance/",
          tags: ["Version Perf", "Lazy load", "Cache", "Core Web Vitals"],
          published: "il y a 3 heures",
          author: "François Kulawik"
        }
      ]
    },
    {
      id: 2,
      title: "Vue",
      items: [
        {
          id: 1,
          source: "Sciencepost",
          title: "Vue v3.x (démo) : réactivité plus fine, Suspense plus stable",
          description: "Améliorations côté rendu async, composants, et tooling — pour une UI plus propre.",
          image: "https://picsum.photos/seed/vue-reactivity/120/120",
          link: "https://vuejs.org",
          tags: ["Version v3.x", "Reactivity", "Suspense", "Devtools"],
          published: "il y a 19 heures",
          author: "Brice Louvet"
        },
        {
          id: 2,
          source: "Le Figaro Éco",
          title: "Monorepo Vue : comment garder la vitesse quand le projet grandit",
          description: "Workspaces, CI, conventions, et découpage : une équipe qui ship sans se perdre.",
          image: "https://picsum.photos/seed/vue-eco/120/120",
          link: "https://vuejs.org/guide/scaling-up/tooling.html",
          tags: ["Version Tooling", "Vite", "Workspaces", "CI cache"],
          published: "il y a 7 heures",
          author: "Rédaction",
          metrics: [
            { id: 1, label: "CAC", delta: "+0,08 %", value: "8244,45" },
            { id: 2, label: "SBF", delta: "+0,05 %", value: "6239,12" },
            { id: 3, label: "CAC Large", delta: "+0,09 %", value: "8887,32" }
          ]
        }
      ]
    },
    {
      id: 3,
      title: "React",
      items: [
        {
          id: 1,
          source: "boursorama.com",
          title: "React v19 (démo) : actions, transitions, et rendu qui se cale au besoin",
          description: "Des patterns plus simples pour gérer le state async — et moins de code qui crie.",
          image: "https://picsum.photos/seed/react-news/120/120",
          link: "https://react.dev",
          tags: ["Version v19", "Actions", "useOptimistic", "Transitions"],
          published: "il y a 3 heures",
          author: "Rédaction"
        },
        {
          id: 2,
          source: "Le Monde.fr",
          title: "Design system : quand les composants deviennent un langage d’équipe",
          description: "Tokens, accessibilité, et variantes. Une grammaire UI qui évite les malentendus.",
          image: "https://picsum.photos/seed/react-design/120/120",
          link: "https://react.dev/learn",
          tags: ["Version UI", "Tokens", "A11y", "Variants"],
          published: "il y a 8 heures",
          author: "Michaël Moreau"
        },
        {
          id: 3,
          source: "jeanmarcmorandini.com",
          title: "TypeScript (démo) : patterns modernes pour calmer la complexité",
          description: "Narrowing, utilitaires, types lisibles : quand le code devient plus fiable sans perdre la vitesse.",
          image: "https://picsum.photos/seed/react-typescript/120/120",
          link: "https://www.typescriptlang.org/docs/",
          tags: ["Version TS 5.x", "satisfies", "narrowing", "type utils"],
          published: "il y a 7 heures",
          author: "Jean-Marc Morandini"
        }
      ]
    }
  ];

  public openExternal(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  public preventCardOpen(event: Event): void {
    event.stopPropagation();
  }

}