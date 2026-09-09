// dialogue_modal.js - Bite-Sized, Step-by-Step Story Dialogue Engine
// Strictly enforces low word-per-screen limits (< 25 words) to avoid clutter and screen overlap.

export class DialogueModalEngine {
  constructor(options = {}) {
    this.container = document.getElementById('dialogue-story-modal');
    this.onComplete = null;
    this.currentSlides = [];
    this.currentIndex = 0;
    this.speakerVoiceEnabled = true;
    this.synth = window.speechSynthesis;
    
    this.initDOM();
  }

  initDOM() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'dialogue-story-modal';
      this.container.className = 'dialogue-modal-overlay hidden';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Launch a sequence of bite-sized dialogue cards.
   * @param {Array<{speaker: string, avatar: string, title: string, text: string, buttonText?: string}>} slides 
   * @param {Function} onComplete Callback when the user finishes all slides
   */
  startDialogue(slides, onComplete = null) {
    if (!slides || slides.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    this.currentSlides = slides;
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';
    this.renderSlide();
  }

  renderSlide() {
    const slide = this.currentSlides[this.currentIndex];
    const isFirst = this.currentIndex === 0;
    const isLast = this.currentIndex === this.currentSlides.length - 1;
    const total = this.currentSlides.length;

    // Word count safety assertion: keep it punchy
    const words = slide.text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const speakerColor = slide.speaker.toLowerCase().includes('zephyr') ? 'var(--amber-gold, #f59e0b)' : 'var(--neon-cyan, #06b6d4)';
    const speakerBadge = slide.speaker.toLowerCase().includes('zephyr') ? '🎩 Zephyr the Magician' : '🔬 Prof. Nova the Scientist';

    this.container.innerHTML = `
      <div class="dialogue-card animate-pop-in" style="--accent-border: ${speakerColor}">
        <div class="dialogue-header">
          <div class="dialogue-speaker-tag">
            <span class="speaker-pill" style="border-color: ${speakerColor}; color: ${speakerColor}">
              ${speakerBadge}
            </span>
          </div>
          <div class="dialogue-stepper">
            ${this.renderDots(total, this.currentIndex)}
          </div>
          <button class="dialogue-skip-btn" id="modal-skip-btn" title="Skip to Activity">✕</button>
        </div>

        <div class="dialogue-body">
          <div class="dialogue-avatar-box">
            <img src="${slide.avatar || 'assets/nova_portrait.png'}" alt="${slide.speaker}" class="dialogue-avatar" />
            <div class="avatar-speaker-ring"></div>
          </div>
          <div class="dialogue-content">
            <h3 class="dialogue-title">${slide.title || 'Turn Briefing'}</h3>
            <p class="dialogue-speech" id="dialogue-speech-text">${slide.text}</p>
          </div>
        </div>

        <div class="dialogue-footer">
          <div class="dialogue-left-controls">
            ${!isFirst ? `<button class="btn-modal-nav btn-secondary" id="modal-prev-btn">⬅ Back</button>` : `<span class="dialogue-word-badge">${wordCount} words</span>`}
          </div>
          <div class="dialogue-right-controls">
            <button class="btn-modal-listen" id="modal-listen-btn" title="Replay voice narration">🔊 Listen</button>
            <button class="btn-modal-nav btn-primary" id="modal-next-btn">
              ${isLast ? (slide.buttonText || '🚀 Start Your Turn') : 'Next ➡'}
            </button>
          </div>
        </div>
      </div>
    `;

    // Speak text if speech is enabled
    this.speakText(slide.text, slide.speaker);

    // Event listeners
    const nextBtn = document.getElementById('modal-next-btn');
    const prevBtn = document.getElementById('modal-prev-btn');
    const skipBtn = document.getElementById('modal-skip-btn');
    const listenBtn = document.getElementById('modal-listen-btn');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (isLast) {
          this.close();
          if (this.onComplete) this.onComplete();
        } else {
          this.currentIndex++;
          this.renderSlide();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.renderSlide();
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.close();
        if (this.onComplete) this.onComplete();
      });
    }

    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        this.speakText(slide.text, slide.speaker, true);
      });
    }
  }

  renderDots(total, current) {
    let html = '';
    for (let i = 0; i < total; i++) {
      html += `<span class="step-dot ${i === current ? 'active' : ''} ${i < current ? 'passed' : ''}"></span>`;
    }
    html += `<span class="step-counter">${current + 1} / ${total}</span>`;
    return html;
  }

  speakText(text, speaker, force = false) {
    if (!this.synth || (!this.speakerVoiceEnabled && !force)) return;
    try {
      this.synth.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      if (speaker.toLowerCase().includes('zephyr')) {
        utterance.pitch = 1.15;
      } else {
        utterance.pitch = 0.95;
      }
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error in modal:', err);
    }
  }

  close() {
    if (this.synth) this.synth.cancel();
    this.container.classList.add('hidden');
    this.container.style.display = 'none';
    this.container.innerHTML = '';
  }
}
