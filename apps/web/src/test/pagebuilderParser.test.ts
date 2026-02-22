import { describe, it, expect } from 'vitest';
import { parsePageBuilderHtml } from '../lib/pagebuilderParser';

// Helper: wrap content in a data-content-type element
function pb(contentType: string, attrs: string, inner = '') {
  return `<div data-content-type="${contentType}" ${attrs}>${inner}</div>`;
}

// ─── Guard: returns null for non-pagebuilder content ───────────────────────

describe('parsePageBuilderHtml — guard clauses', () => {
  it('returns null for empty string', () => {
    expect(parsePageBuilderHtml('')).toBeNull();
  });

  it('returns null for null-like falsy value', () => {
    expect(parsePageBuilderHtml(null as any)).toBeNull();
  });

  it('returns null when no data-content-type present', () => {
    expect(parsePageBuilderHtml('<div class="foo">hello</div>')).toBeNull();
  });

  it('returns null for malformed HTML with no content types', () => {
    expect(parsePageBuilderHtml('<<<<not html>>>>')).toBeNull();
  });
});

// ─── row ───────────────────────────────────────────────────────────────────

describe('row', () => {
  it('parses a basic row', () => {
    const html = pb('row', 'data-appearance="contained"');
    const result = parsePageBuilderHtml(html);
    expect(result).not.toBeNull();
    expect(result![0].contentType).toBe('row');
    expect(result![0].appearance).toBe('contained');
  });

  it('extracts box props from style', () => {
    const html = pb('row', 'style="margin-top:10px;padding-bottom:20px;"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].marginTop).toBe('10px');
    expect(result[0].paddingBottom).toBe('20px');
  });

  it('filters pagebuilder- css classes', () => {
    const html = pb('row', 'class="pagebuilder-mobile-hidden my-class"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].cssClasses).toContain('my-class');
    expect(result[0].cssClasses).not.toContain('pagebuilder-mobile-hidden');
  });

  it('parses nested column children', () => {
    const inner = pb('column', 'data-appearance="full-height" style="width:50%;"');
    const html = pb('row', '', inner);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].contentType).toBe('column');
  });
});

// ─── column ────────────────────────────────────────────────────────────────

describe('column', () => {
  it('parses width from style', () => {
    const html = pb('column', 'style="width:33.3333%;"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('column');
    expect(result[0].width).toBe('33.3333%');
  });

  it('parses appearance', () => {
    const html = pb('column', 'data-appearance="align-top"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].appearance).toBe('align-top');
  });
});

// ─── banner ────────────────────────────────────────────────────────────────

describe('banner', () => {
  it('parses desktop/mobile images from data-background-images', () => {
    const bgImages = JSON.stringify({
      desktop_image: 'https://cdn.example.com/desktop.jpg',
      mobile_image: 'https://cdn.example.com/mobile.jpg',
    })
      .replace(/"/g, '&quot;');
    const html = pb('banner', `data-appearance="collage-left" data-background-images="${bgImages}"`);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('banner');
    expect(result[0].desktopImage).toBe('https://cdn.example.com/desktop.jpg');
    expect(result[0].mobileImage).toBe('https://cdn.example.com/mobile.jpg');
  });

  it('parses link and openInNewTab', () => {
    const inner = `<a data-element="link" href="/promo" target="_blank">click</a>`;
    const html = pb('banner', 'data-appearance="poster"', inner);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].link).toBe('/promo');
    expect(result[0].openInNewTab).toBe(true);
  });

  it('parses button text', () => {
    const inner = `<span data-element="button">Shop Now</span>`;
    const html = pb('banner', 'data-show-button="always"', inner);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].showButton).toBe('always');
    expect(result[0].buttonText).toBe('Shop Now');
  });

  it('parses overlay color', () => {
    const inner = `<div data-element="overlay" style="background-color:rgba(0,0,0,0.5);"></div>`;
    const html = pb('banner', 'data-show-overlay="hover"', inner);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].showOverlay).toBe('hover');
    expect(result[0].overlayColor).toBe('rgba(0,0,0,0.5)');
  });

  it('defaults showOverlay to "never" when attribute absent', () => {
    const html = pb('banner', '');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].showOverlay).toBe('never');
  });

  it('handles malformed data-background-images gracefully', () => {
    const html = pb('banner', 'data-background-images="not-valid-json"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('banner');
    expect(result[0].desktopImage).toBeUndefined();
  });
});

// ─── slider ────────────────────────────────────────────────────────────────

describe('slider', () => {
  it('parses autoplay and speed', () => {
    const html = pb('slider', 'data-autoplay="true" data-autoplay-speed="3000"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('slider');
    expect(result[0].autoplay).toBe(true);
    expect(result[0].autoplaySpeed).toBe(3000);
  });

  it('defaults autoplay to false', () => {
    const html = pb('slider', '');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].autoplay).toBe(false);
  });

  it('defaults infinite to true when attribute absent', () => {
    const html = pb('slider', '');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].infinite).toBe(true);
  });

  it('sets infinite=false when data-infinite-loop="false"', () => {
    const html = pb('slider', 'data-infinite-loop="false"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].infinite).toBe(false);
  });

  it('parses fade attribute', () => {
    const html = pb('slider', 'data-fade="true"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].fade).toBe(true);
  });

  it('parses slide children', () => {
    const slide = pb('slide', 'data-appearance="collage-right"');
    const html = pb('slider', '', slide);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].contentType).toBe('slide');
  });
});

// ─── html ──────────────────────────────────────────────────────────────────

describe('html content type', () => {
  it('decodes HTML entities in inner content', () => {
    // PageBuilder stores HTML-encoded content inside html blocks
    const encoded = '&lt;p&gt;Hello &amp; World&lt;/p&gt;';
    const html = pb('html', '', encoded);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('html');
    expect(result[0].html).toContain('<p>Hello & World</p>');
  });

  it('decodes &quot; entities', () => {
    const encoded = '&lt;a href=&quot;/test&quot;&gt;link&lt;/a&gt;';
    const html = pb('html', '', encoded);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].html).toContain('href="/test"');
  });

  it('handles empty html block', () => {
    const html = pb('html', '');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].html).toBe('');
  });
});

// ─── heading ───────────────────────────────────────────────────────────────

describe('heading', () => {
  it('parses h1 tag', () => {
    const html = pb('heading', '', '<h1>Main Title</h1>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('heading');
    expect(result[0].headingType).toBe('h1');
    expect(result[0].text).toBe('Main Title');
  });

  it('parses h3 tag', () => {
    const html = pb('heading', '', '<h3>Sub Title</h3>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].headingType).toBe('h3');
  });

  it('defaults to h2 when no heading tag found', () => {
    const html = pb('heading', '', 'plain text');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].headingType).toBe('h2');
  });
});

// ─── buttons ───────────────────────────────────────────────────────────────

describe('buttons', () => {
  it('parses buttons container', () => {
    const html = pb('buttons', 'data-appearance="inline"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('buttons');
    expect(result[0].isSameWidth).toBe(false);
  });

  it('sets isSameWidth=true for stacked appearance', () => {
    const html = pb('buttons', 'data-appearance="stacked"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].isSameWidth).toBe(true);
  });

  it('parses button-item children', () => {
    const item = pb('button-item', '', '<a href="/sale" class="pagebuilder-button-primary">Sale</a>');
    const html = pb('buttons', '', item);
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].contentType).toBe('button-item');
    expect(result[0].children![0].text).toBe('Sale');
  });
});

// ─── button-item ───────────────────────────────────────────────────────────

describe('button-item', () => {
  it('parses link and text', () => {
    const html = pb('button-item', '', '<a href="/promo">Buy Now</a>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].text).toBe('Buy Now');
  });

  it('detects primary button type from class', () => {
    const html = pb('button-item', '', '<a href="/" class="pagebuilder-button-primary">Go</a>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].buttonType).toBe('primary');
  });

  it('detects secondary button type from class', () => {
    const html = pb('button-item', '', '<a href="/" class="pagebuilder-button-secondary">Go</a>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].buttonType).toBe('secondary');
  });

  it('uses data-button-type attribute when present', () => {
    const html = pb('button-item', 'data-button-type="primary"', '<a href="/">Go</a>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].buttonType).toBe('primary');
  });

  it('parses openInNewTab', () => {
    const html = pb('button-item', '', '<a href="/x" target="_blank">X</a>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].openInNewTab).toBe(true);
  });
});

// ─── divider ───────────────────────────────────────────────────────────────

describe('divider', () => {
  it('parses hr width and color', () => {
    const html = pb('divider', '', '<hr style="width:80%;border-color:#ff0000;border-width:2px;" />');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('divider');
    expect(result[0].width).toBe('80%');
    expect(result[0].color).toBe('#ff0000');
    expect(result[0].thickness).toBe('2px');
  });

  it('defaults width to 100% when no hr style', () => {
    const html = pb('divider', '', '<hr />');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].width).toBe('100%');
  });

  it('defaults color to #ccc when no border-color', () => {
    const html = pb('divider', '', '<hr />');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].color).toBe('#ccc');
  });
});

// ─── block ─────────────────────────────────────────────────────────────────

describe('block', () => {
  it('parses block-id from data attribute', () => {
    const html = pb('block', 'data-block-id="42"');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('block');
    expect(result[0].blockId).toBe('42');
  });

  it('finds block-id on nested element', () => {
    const html = pb('block', '', '<div data-block-id="99"></div>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].blockId).toBe('99');
  });

  it('returns empty string blockId when absent', () => {
    const html = pb('block', '');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].blockId).toBe('');
  });
});

// ─── unknown content type → html fallback ──────────────────────────────────

describe('unknown content type fallback', () => {
  it('falls back to html contentType with outerHTML', () => {
    const html = pb('custom-widget', 'data-foo="bar"', '<span>custom</span>');
    const result = parsePageBuilderHtml(html)!;
    expect(result[0].contentType).toBe('html');
    expect(result[0].html).toContain('data-content-type="custom-widget"');
  });
});

// ─── widget shortcode parsing (mirrors Html.tsx logic) ─────────────────────

describe('___widget_flashsale shortcode parsing', () => {
  // These tests mirror the regex logic in Html.tsx directly
  function parseFlashsale(shortcode: string) {
    const trimmed = shortcode.trim();
    const pageSizeMatch = trimmed.match(/__pageSize\((\d+)\)/);
    const urlMatch = trimmed.match(/__url\("([^"]+)"\)/);
    const titleMatch = trimmed.match(/__title\("([^"]+)"\)/);
    return {
      pageSize: pageSizeMatch?.[1] ? parseInt(pageSizeMatch[1], 10) : 10,
      url: urlMatch?.[1] || '/flash-sale',
      title: titleMatch?.[1],
    };
  }

  it('parses pageSize, url, and title', () => {
    const shortcode = '___widget_flashsale __pageSize(20) __url("/deals") __title("Flash Sale")';
    const result = parseFlashsale(shortcode);
    expect(result.pageSize).toBe(20);
    expect(result.url).toBe('/deals');
    expect(result.title).toBe('Flash Sale');
  });

  it('defaults pageSize to 10 when absent', () => {
    const shortcode = '___widget_flashsale __url("/deals")';
    const result = parseFlashsale(shortcode);
    expect(result.pageSize).toBe(10);
  });

  it('defaults url to /flash-sale when absent', () => {
    const shortcode = '___widget_flashsale __pageSize(5)';
    const result = parseFlashsale(shortcode);
    expect(result.url).toBe('/flash-sale');
  });

  it('title is undefined when absent', () => {
    const shortcode = '___widget_flashsale __pageSize(5)';
    const result = parseFlashsale(shortcode);
    expect(result.title).toBeUndefined();
  });

  it('detects flashsale shortcode prefix', () => {
    const trimmed = '___widget_flashsale __pageSize(10)';
    expect(trimmed.startsWith('___widget_flashsale')).toBe(true);
  });
});

describe('___widget_product_recommendation shortcode parsing', () => {
  function parseProductRec(shortcode: string) {
    const trimmed = shortcode.trim();
    const idMatch = trimmed.match(/__id\("([^"]+)"\)/);
    const limitMatch = trimmed.match(/__limit\((\d+)\)/);
    const colorMatch = trimmed.match(/__color\("([^"]+)"\)/);
    const imageMatch = trimmed.match(/__image\("([^"]+)"\)/);
    const imageMobileMatch = trimmed.match(/__image-mobile\("([^"]+)"\)/);
    return {
      asmJourneyId: idMatch?.[1] || '',
      pageSize: limitMatch?.[1] ? parseInt(limitMatch[1], 10) : 12,
      color: colorMatch?.[1],
      image: imageMatch?.[1],
      imageMobile: imageMobileMatch?.[1],
    };
  }

  it('parses id, limit, color, image, imageMobile', () => {
    const shortcode = '___widget_product_recommendation __id("journey-123") __limit(8) __color("#ff0000") __image("/img/banner.jpg") __image-mobile("/img/banner-m.jpg")';
    const result = parseProductRec(shortcode);
    expect(result.asmJourneyId).toBe('journey-123');
    expect(result.pageSize).toBe(8);
    expect(result.color).toBe('#ff0000');
    expect(result.image).toBe('/img/banner.jpg');
    expect(result.imageMobile).toBe('/img/banner-m.jpg');
  });

  it('defaults pageSize to 12 when limit absent', () => {
    const shortcode = '___widget_product_recommendation __id("abc")';
    const result = parseProductRec(shortcode);
    expect(result.pageSize).toBe(12);
  });

  it('defaults asmJourneyId to empty string when id absent', () => {
    const shortcode = '___widget_product_recommendation __limit(5)';
    const result = parseProductRec(shortcode);
    expect(result.asmJourneyId).toBe('');
  });

  it('color/image/imageMobile are undefined when absent', () => {
    const shortcode = '___widget_product_recommendation __id("x")';
    const result = parseProductRec(shortcode);
    expect(result.color).toBeUndefined();
    expect(result.image).toBeUndefined();
    expect(result.imageMobile).toBeUndefined();
  });

  it('detects product_recommendation shortcode prefix', () => {
    const trimmed = '___widget_product_recommendation __id("x")';
    expect(trimmed.startsWith('___widget_product_recommendation')).toBe(true);
  });
});

// ─── multiple top-level blocks ─────────────────────────────────────────────

describe('multiple top-level content types', () => {
  it('returns array with all top-level blocks', () => {
    const html = [
      pb('row', 'data-appearance="full-width"'),
      pb('row', 'data-appearance="contained"'),
      pb('html', '', '&lt;p&gt;test&lt;/p&gt;'),
    ].join('');
    const result = parsePageBuilderHtml(html)!;
    expect(result).toHaveLength(3);
    expect(result[0].contentType).toBe('row');
    expect(result[1].contentType).toBe('row');
    expect(result[2].contentType).toBe('html');
  });
});
