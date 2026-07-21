import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Update } from './core/services/update';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  update = inject(Update);

}
