import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormService } from '../../../../services/form.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.component.html'
})
export class FormComponent {

  formData = {
    mood_score: '',
    sleep_hours: '',
    energy_level: '',
    stress_level: '',
    notes: ''
  };

  constructor(private formService: FormService) {}

  submitForm() {
    console.log("SENDING:", this.formData);

    this.formService.createForm(this.formData).subscribe({
      next: (res) => {
        console.log("SUCCESS:", res);
        alert("✅ Form saved");

        // reset form
        this.formData = {
          mood_score: '',
          sleep_hours: '',
          energy_level: '',
          stress_level: '',
          notes: ''
        };
      },
      error: (err) => {
        console.log("ERROR:", err);
        alert("❌ Error saving form");
      }
    });
  }
}
