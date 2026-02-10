import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";

type Article = { id: number, title: string, content: string, image?: string }

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [DatePipe]
})
export class Home {

  public today: Date = new Date();
  public articles: Article[] = [
    { id: 1, title: "Ceci est un article", content: "blablabla", },
    { id: 2,  title: "Ceci est un article", content: "blablabla", },
    { id: 3, title: "Ceci est un article", content: "blablabla", },
    { id: 4, title: "Ceci est un article", content: "blablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablablabla", }
  ];


}