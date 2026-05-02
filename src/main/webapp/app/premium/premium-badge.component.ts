import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable visual badge indicating a feature is planned for Premium.
 * This badge is purely decorative – it does NOT enforce any access restriction.
 */
@Component({
  selector: 'jhi-premium-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="premium-planned-badge">⭐ Premium planned</span>`,
  styles: [
    `
      .premium-planned-badge {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        padding: 2px 8px;
        border-radius: 999px;
        background: linear-gradient(135deg, #e0f0ff 0%, #f0e8ff 100%);
        color: #4f46e5;
        border: 1px solid #c7d2fe;
        vertical-align: middle;
      }
    `,
  ],
})
export class PremiumBadgeComponent {}

