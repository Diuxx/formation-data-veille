import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

// components
import { Header } from "../components/header/header.component";
import { Footer } from "../components/footer/footer.component";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayout {

}