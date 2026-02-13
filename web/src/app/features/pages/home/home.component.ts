import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";

type Article = { id: number, title: string, description: string, image: string, link: string }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [DatePipe]
})
export class Home {

  public today: Date = new Date();
  public articles: Article[] = [
    {
      id: 1,
      title: "Angular",
      description: "Framework front-end moderne pour créer des interfaces web robustes.",
      image: "https://picsum.photos/seed/angular/600/360",
      link: "https://angular.dev"
    },
    {
      id: 2,
      title: "Prisma",
      description: "ORM TypeScript pour simplifier la gestion de base de données.",
      image: "https://picsum.photos/seed/prisma/600/360",
      link: "https://www.prisma.io"
    },
    {
      id: 3,
      title: "Postman",
      description: "Plateforme de test et documentation d'API pour accélérer le dev.",
      image: "https://picsum.photos/seed/postman/600/360",
      link: "https://www.postman.com"
    },
    {
      id: 4,
      title: "Docker",
      description: "Outil de conteneurisation pour des environnements reproductibles.",
      image: "https://picsum.photos/seed/docker/600/360",
      link: "https://www.docker.com"
    }
  ];


}