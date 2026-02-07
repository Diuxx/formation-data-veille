import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

// components
import { Header } from "../components/header/header.component";
import { Footer } from "../components/footer/footer.component";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayout {

}