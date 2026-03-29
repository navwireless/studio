// src/tools/report-generator/pdfLayoutEngine.ts
import { PDFDocument, StandardFonts, PageSizes, rgb, degrees } from 'pdf-lib';
import type { PDFPage, PDFFont } from 'pdf-lib';
import {
    PAGE_WIDTH,
    PAGE_HEIGHT,
    MARGIN,
    COLORS,
    FONT_SIZES,
    BRANDING,
    drawBrandedFooter,
    sanitize,
} from './pdfStyles';

const BOTTOM_LIMIT = 58;
const ACCENT_TOP_H = 4;
const ACCENT_BOT_H = 3;

export interface LayoutEngineOptions {
    onNewPage?: (page: PDFPage, pageIndex: number) => void;
}

export class PDFLayoutEngine {
    readonly doc: PDFDocument;
    fontRegular!: PDFFont;
    fontBold!: PDFFont;
    private pages: PDFPage[] = [];
    private _currentPage!: PDFPage;
    private _y: number = PAGE_HEIGHT - MARGIN;
    private opts: LayoutEngineOptions;

    private constructor(doc: PDFDocument, opts: LayoutEngineOptions) {
        this.doc = doc;
        this.opts = opts;
    }

    static async create(opts: LayoutEngineOptions = {}): Promise<PDFLayoutEngine> {
        const doc = await PDFDocument.create();
        const engine = new PDFLayoutEngine(doc, opts);
        engine.fontRegular = await doc.embedFont(StandardFonts.Helvetica);
        engine.fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
        return engine;
    }

    get page(): PDFPage {
        return this._currentPage;
    }

    get y(): number {
        return this._y;
    }

    set y(val: number) {
        this._y = val;
    }

    get fonts(): { regular: PDFFont; bold: PDFFont } {
        return { regular: this.fontRegular, bold: this.fontBold };
    }

    get totalPages(): number {
        return this.pages.length;
    }

    get allPages(): PDFPage[] {
        return this.pages;
    }

    get availableSpace(): number {
        return this._y - BOTTOM_LIMIT;
    }

    addPage(): PDFPage {
        const page = this.doc.addPage(PageSizes.A4);
        this.pages.push(page);
        this._currentPage = page;
        this.drawPageChrome(page);
        this._y = PAGE_HEIGHT - MARGIN;
        if (this.opts.onNewPage) {
            this.opts.onNewPage(page, this.pages.length - 1);
        }
        return page;
    }

    registerExternalPage(page: PDFPage): void {
        this.pages.push(page);
        this._currentPage = page;
    }

    ensureSpace(needed: number): boolean {
        if (this.availableSpace < needed) {
            this.addPage();
            return true;
        }
        return false;
    }

    advance(amount: number): void {
        this._y -= amount;
    }

    private drawPageChrome(page: PDFPage): void {
        page.drawRectangle({
            x: 0, y: PAGE_HEIGHT - ACCENT_TOP_H,
            width: PAGE_WIDTH, height: ACCENT_TOP_H,
            color: COLORS.brandBlue,
        });
        page.drawRectangle({
            x: 0, y: 0,
            width: PAGE_WIDTH, height: ACCENT_BOT_H,
            color: COLORS.brandBlue,
        });
        const wmText = BRANDING.domain.toUpperCase();
        const wmSize = FONT_SIZES.watermark;
        const wmW = this.fontRegular.widthOfTextAtSize(wmText, wmSize);
        page.drawText(wmText, {
            x: (PAGE_WIDTH - wmW) / 2,
            y: PAGE_HEIGHT / 2 - 10,
            font: this.fontRegular,
            size: wmSize,
            color: rgb(0.92, 0.92, 0.94),
            opacity: 0.07,
            rotate: degrees(-35),
        });
    }

    drawContinuationHeader(title: string): void {
        const page = this._currentPage;
        page.drawText(sanitize(BRANDING.companyName), {
            x: MARGIN, y: this._y - 9,
            font: this.fontRegular, size: 7,
            color: COLORS.textMuted,
        });
        const tw = this.fontBold.widthOfTextAtSize(sanitize(title), 9);
        page.drawText(sanitize(title), {
            x: PAGE_WIDTH - MARGIN - tw, y: this._y - 9,
            font: this.fontBold, size: 9,
            color: COLORS.textDark,
        });
        this._y -= 14;
        page.drawLine({
            start: { x: MARGIN, y: this._y },
            end: { x: PAGE_WIDTH - MARGIN, y: this._y },
            thickness: 0.4, color: COLORS.borderLight,
        });
        this._y -= 8;
    }

    finalize(): void {
        const total = this.pages.length;
        for (let i = 0; i < total; i++) {
            drawBrandedFooter(this.pages[i], this.fontRegular, i + 1, total);
        }
    }

    async save(): Promise<Uint8Array> {
        this.finalize();
        return this.doc.save();
    }
}

export function truncateText(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number,
): string {
    const s = sanitize(text);
    if (font.widthOfTextAtSize(s, fontSize) <= maxWidth) return s;
    for (let i = s.length - 1; i > 0; i--) {
        const t = s.substring(0, i) + '...';
        if (font.widthOfTextAtSize(t, fontSize) <= maxWidth) return t;
    }
    return '...';
}