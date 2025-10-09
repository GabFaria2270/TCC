import { lockScroll, unlockScroll } from './scrollLock';

let initialized = false;
let observer: MutationObserver | null = null;

function anyModalOpen(): boolean {
  // Considera modais Bootstrap-like com classe 'modal show' ou display:block
  return (
    !!document.querySelector('.modal.show') ||
    !!document.querySelector('.modal[style*="display: block"]') ||
    !!document.querySelector('.modal-backdrop.show')
  );
}

function evaluate(): void {
  if (anyModalOpen()) {
    lockScroll();
  } else {
    unlockScroll();
  }
}

export function initializeScrollLockObserver(): void {
  if (initialized || typeof window === 'undefined' || typeof document === 'undefined') return;
  initialized = true;

  // Observa mudanças no body para detectar abertura/fechamento de modais
  observer = new MutationObserver(() => {
    evaluate();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  // Avalia no início e também ao redimensionar (mudança de scrollbar width)
  evaluate();
  window.addEventListener('resize', evaluate);

  // Fallback: ao mudar visibilidade da aba
  document.addEventListener('visibilitychange', evaluate);

  // Garantir unlock ao unload
  window.addEventListener('beforeunload', () => {
    unlockScroll();
  });
}

export function disposeScrollLockObserver(): void {
  if (!initialized) return;
  initialized = false;
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  unlockScroll();
}
