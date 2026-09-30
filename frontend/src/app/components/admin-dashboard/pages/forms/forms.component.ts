import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAssessmentService } from '../../../../services/ai-assessment.service';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {
  forms: any[] = [];
  search = '';
  loading = false;
  selected: any = null;

  constructor(private aiService: AiAssessmentService) {}

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading = true;
    this.aiService.getAll().subscribe({
      next: (data: any[]) => {
        this.forms = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('AI Forms error:', err);
        this.loading = false;
      }
    });
  }

  get filteredForms(): any[] {
    const q = this.search.toLowerCase();
    if (!q) return this.forms;
    return this.forms.filter(f => JSON.stringify(f).toLowerCase().includes(q));
  }

  get pendingForms(): number {
    return this.forms.filter(f => f.status !== 'reviewed').length;
  }

  get reviewedForms(): number {
    return this.forms.filter(f => f.status === 'reviewed').length;
  }

  get highRiskForms(): number {
    return this.forms.filter(f => f.formRiskLevel === 'eleve').length;
  }

  openForm(form: any): void {
    this.selected = form;
  }

  createReport(form: any): void {
    const id = form.id || form._id;
    if (!id) return;

    this.aiService.generateReport(id).subscribe({
      next: (res: any) => {
        this.selected = res.assessment;
        this.loadForms();
      },
      error: (err: any) => console.error('Generate report error:', err)
    });
  }

  printReport(form: any): void {
    const content = form?.reportText || 'Rapport vide';
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<pre style="font-family:Arial;white-space:pre-wrap;padding:24px">${content}</pre>`);
    win.document.close();
    win.print();
  }
}
