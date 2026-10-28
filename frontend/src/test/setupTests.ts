import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw/server';

beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
    window.scrollTo = vi.fn();
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    window.ResizeObserver = class ResizeObserver {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;

    // Soporte para carga de imágenes de Radix UI Avatar en jsdom
    Object.defineProperty(window.Image.prototype, 'naturalWidth', {
        configurable: true,
        get: () => 100,
    });
    Object.defineProperty(window.Image.prototype, 'complete', {
        configurable: true,
        get: () => true,
    });
    Object.defineProperty(window.Image.prototype, 'src', {
        configurable: true,
        set(src: string) {
            if (src) {
                setTimeout(() => {
                    if (typeof this.onload === 'function') {
                        this.onload(new Event('load'));
                    }
                }, 0);
            }
        },
    });

    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

afterAll(() => {
    server.close();
});
