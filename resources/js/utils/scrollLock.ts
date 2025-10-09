// Utilitário para bloquear/desbloquear o scroll do body sem causar deslocamento horizontal
// Compensa a largura da barra de rolagem adicionando padding-right enquanto o lock estiver ativo.

let isLocked = false;
let originalInlinePaddingRight: string | null = null;
let basePaddingRightPx = 0;
let currentScrollbarWidth = 0;

function getScrollbarWidth(): number {
	// largura da scrollbar do viewport
	return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export function lockScroll(): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	const body = document.body as HTMLBodyElement;

	// Base sempre a partir do computed style, mas restauramos o inline original no unlock
	const computedPaddingRight = window.getComputedStyle(body).paddingRight;
	const basePx = parseFloat(computedPaddingRight) || 0;
	const scrollbarWidth = getScrollbarWidth();

	if (!isLocked) {
		originalInlinePaddingRight = body.style.paddingRight || '';
		basePaddingRightPx = basePx;
		currentScrollbarWidth = scrollbarWidth;
		if (scrollbarWidth > 0) {
			body.style.paddingRight = `${basePaddingRightPx + scrollbarWidth}px`;
		}
		body.style.overflow = 'hidden';
		isLocked = true;
	} else {
		// Já bloqueado: apenas atualiza compensação se a largura da scrollbar mudou
		if (scrollbarWidth !== currentScrollbarWidth) {
			currentScrollbarWidth = scrollbarWidth;
			if (scrollbarWidth > 0) {
				body.style.paddingRight = `${basePaddingRightPx + scrollbarWidth}px`;
			} else {
				body.style.paddingRight = `${basePaddingRightPx}px`;
			}
		}
	}
}

export function unlockScroll(): void {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	if (!isLocked) return;

	const body = document.body as HTMLBodyElement;
	body.style.overflow = '';
	body.style.paddingRight = originalInlinePaddingRight ?? '';
	originalInlinePaddingRight = null;
	basePaddingRightPx = 0;
	currentScrollbarWidth = 0;
	isLocked = false;
}

// Sugestão: opcionalmente expor um helper React no futuro (useScrollLock)
