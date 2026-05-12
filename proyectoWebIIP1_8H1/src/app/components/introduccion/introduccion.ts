import { Component } from '@angular/core';

@Component({
  selector: 'app-introduccion',
  standalone: true,
  template: `
    <div class="introduccion-container">
      <h1>Bienvenido a GymStar</h1>
      <p>Te ofrecemos productos de alta calidad para tu casa o gimnasio .</p>
      <div class="detalles">
        <h2>Sobre Nosotros</h2>
        <p>Somos un equipo del grupo de 8H en el CETI Colomos.</p>
      </div>
    </div>
  `,
  styles: [`
    .introduccion-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: 'Roboto', sans-serif;
      color: #333;
    }
    h1 {
      color: #007bff;
      margin-bottom: 1rem;
    }
    h2 {
      color: #555;
      margin-top: 1.5rem;
    }
    p {
      line-height: 1.6;
    }
  `]
})
export class IntroduccionComponent {}
