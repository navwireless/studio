// src/components/map/tools/map-screenshot.ts
// Phase 11B — Export current map view as PNG
// Uses html2canvas approach on the map container div

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';

export function createMapScreenshotHandler(): ToolHandler {
    async function captureMap(options: ToolActivateOptions) {
        options.onProcessingChange(true);
        options.onStatusChange('Capturing map…');

        try {
            // Dynamically import html2canvas to avoid bundle bloat
            // If not available, fall back to the static map tile approach
            let canvas: HTMLCanvasElement | null = null;

            const mapDiv = options.map.getDiv();
            if (!mapDiv) {
                throw new Error('Map container not found');
            }

            try {
                const html2canvas = (await import('html2canvas')).default;
                canvas = await html2canvas(mapDiv as HTMLElement, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#0A0F18',
                    scale: 2, // Retina quality
                    logging: false,
                    // Ignore UI overlays on the map
                    ignoreElements: (el) => {
                        const tag = el.tagName?.toLowerCase();
                        // Skip Google Maps UI controls we don't want in screenshot
                        if (el.classList?.contains('gm-style-cc')) return true;
                        if (el.classList?.contains('gmnoprint') && !el.querySelector('canvas')) return true;
                        if (tag === 'button') return true;
                        return false;
                    },
                });
            } catch {
                // html2canvas not installed — use static map API fallback
                canvas = await captureViaStaticMap(options);
            }

            if (!canvas) {
                throw new Error('Failed to capture map image');
            }

            // Convert to blob and trigger download
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        options.onStatusChange('Screenshot failed — could not generate image.');
                        options.onProcessingChange(false);
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `findlos-map-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    const sizeKb = (blob.size / 1024).toFixed(0);

                    options.onResult({
                        toolId: 'map-screenshot',
                        timestamp: Date.now(),
                        data: {
                            width: canvas!.width,
                            height: canvas!.height,
                            sizeKb: `${sizeKb} KB`,
                            format: 'PNG',
                        },
                        overlays: [],
                    });

                    options.onStatusChange(`Screenshot saved (${sizeKb} KB)`);
                    options.onProcessingChange(false);
                },
                'image/png',
                1.0
            );
        } catch (err) {
            console.error('Map screenshot failed:', err);
            options.onStatusChange(
                `Screenshot failed: ${err instanceof Error ? err.message : 'Unknown error'}`
            );
            options.onProcessingChange(false);
        }
    }

    async function captureViaStaticMap(
        options: ToolActivateOptions
    ): Promise<HTMLCanvasElement | null> {
        // Fallback: use Google Static Maps API
        const center = options.map.getCenter();
        const zoom = options.map.getZoom();
        if (!center || zoom === undefined) return null;

        const mapDiv = options.map.getDiv() as HTMLElement;
        const width = Math.min(mapDiv.offsetWidth, 640);
        const height = Math.min(mapDiv.offsetHeight, 640);

        const url =
            `https://maps.googleapis.com/maps/api/staticmap` +
            `?center=${center.lat()},${center.lng()}` +
            `&zoom=${zoom}` +
            `&size=${width}x${height}` +
            `&maptype=hybrid` +
            `&scale=2` +
            `&key=${((window as unknown) as Record<string, unknown>).__GMAPS_KEY__ || ''}`;

        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas);
                } else {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    return {
        activate(options) {
            // Instant action — no clicks needed
            captureMap(options);
        },

        deactivate() { },

        handleClick() {
            // No-op — screenshot is instant
        },

        getCursor() {
            return 'default';
        },
    };
}