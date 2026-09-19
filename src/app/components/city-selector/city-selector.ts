import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockService } from '../../services/clock';

@Component({
  selector: 'app-city-selector',
  imports: [FormsModule],
  templateUrl: './city-selector.html',
  styleUrl: './city-selector.css'
})
export class CitySelector {
  clock = inject(ClockService);
}
