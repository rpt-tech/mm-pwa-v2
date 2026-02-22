/**
 * PageBuilder HTML → structured data parser
 *
 * Parses Magento PageBuilder HTML (data-content-type attributes) into
 * a tree of ContentTypeData objects that ContentTypeFactory can render.
 *
 * Falls back to raw HTML rendering for unknown/complex types.
 */

export interface ContentTypeData {
  contentType: string;
  children?: ContentTypeData[];
  [key: string]: any;
}

/** Decode HTML entities in a string */
function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'");
}

/** Parse inline style string → object */
function parseStyle(styleStr: string | null): Record<string, string> {
  if (!styleStr) return {};
  const result: Record<string, string> = {};
  styleStr.split(';').forEach(part => {
    const [k, ...rest] = part.split(':');
    if (k && rest.length) {
      const key = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      result[key] = rest.join(':').trim();
    }
  });
  return result;
}

/** Extract background images from data-background-images attribute */
function extractBackgroundImages(el: Element): { desktopImage?: string; mobileImage?: string } {
  const raw = el.getAttribute('data-background-images');
  if (!raw) return {};
  try {
    const decoded = decodeEntities(raw);
    const obj = JSON.parse(decoded);
    return {
      desktopImage: obj.desktop_image || undefined,
      mobileImage: obj.mobile_image || undefined,
    };
  } catch {
    return {};
  }
}

/** Extract common spacing/border props from an element's style */
function extractBoxProps(el: Element) {
  const style = parseStyle(el.getAttribute('style'));
  return {
    marginTop: style.marginTop,
    marginRight: style.marginRight,
    marginBottom: style.marginBottom,
    marginLeft: style.marginLeft,
    paddingTop: style.paddingTop,
    paddingRight: style.paddingRight,
    paddingBottom: style.paddingBottom,
    paddingLeft: style.paddingLeft,
    border: style.border,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
    borderRadius: style.borderRadius,
    textAlign: style.textAlign,
    minHeight: style.minHeight,
    backgroundColor: style.backgroundColor,
  };
}

/** Parse a single PageBuilder element into ContentTypeData */
function parseElement(el: Element): ContentTypeData | null {
  const contentType = el.getAttribute('data-content-type');
  if (!contentType) return null;

  const appearance = el.getAttribute('data-appearance') || undefined;
  const cssClasses = (el.getAttribute('class') || '')
    .split(' ')
    .filter(c => c && !c.startsWith('pagebuilder-') && c !== 'data-content-type');

  const boxProps = extractBoxProps(el);

  switch (contentType) {
    case 'row': {
      return {
        contentType: 'row',
        appearance,
        cssClasses,
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'column-group': {
      return {
        contentType: 'column-group',
        cssClasses,
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'column-line': {
      return {
        contentType: 'column-line',
        cssClasses,
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'column': {
      const style = parseStyle(el.getAttribute('style'));
      return {
        contentType: 'column',
        appearance,
        cssClasses,
        width: style.width,
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'banner':
    case 'slide': {
      const { desktopImage, mobileImage } = extractBackgroundImages(el);
      const wrapperEl = el.querySelector('[data-element="wrapper"]') || el;
      const wrapperStyle = parseStyle(wrapperEl.getAttribute('style'));
      const overlayEl = el.querySelector('[data-element="overlay"]');
      const contentEl = el.querySelector('[data-element="content"]');
      const buttonEl = el.querySelector('[data-element="button"]');
      const linkEl = el.querySelector('a[data-element="link"]') || el.querySelector('a');

      // Background image may be on wrapper element
      const bgImages = extractBackgroundImages(wrapperEl);

      return {
        contentType,
        appearance,
        cssClasses,
        desktopImage: desktopImage || bgImages.desktopImage || wrapperStyle.backgroundImage?.replace(/url\(['"]?|['"]?\)/g, ''),
        mobileImage: mobileImage || bgImages.mobileImage,
        backgroundSize: wrapperStyle.backgroundSize || 'cover',
        backgroundPosition: wrapperStyle.backgroundPosition || 'center',
        backgroundRepeat: wrapperStyle.backgroundRepeat || 'no-repeat',
        link: linkEl?.getAttribute('href') || undefined,
        openInNewTab: linkEl?.getAttribute('target') === '_blank',
        showOverlay: el.getAttribute('data-show-overlay') || 'never',
        overlayColor: overlayEl ? parseStyle(overlayEl.getAttribute('style')).backgroundColor : undefined,
        showButton: el.getAttribute('data-show-button') || 'never',
        buttonText: buttonEl?.textContent?.trim() || undefined,
        content: contentEl?.innerHTML || '',
        // boxProps last so wrapper-specific values take precedence
        ...boxProps,
        backgroundColor: wrapperStyle.backgroundColor || boxProps.backgroundColor,
        minHeight: wrapperStyle.minHeight || boxProps.minHeight,
      };
    }

    case 'slider': {
      return {
        contentType: 'slider',
        appearance,
        cssClasses,
        autoplay: el.getAttribute('data-autoplay') === 'true',
        autoplaySpeed: parseInt(el.getAttribute('data-autoplay-speed') || '4000', 10),
        fade: el.getAttribute('data-fade') === 'true',
        infinite: el.getAttribute('data-infinite-loop') !== 'false',
        showArrows: el.getAttribute('data-show-arrows') !== 'false',
        showDots: el.getAttribute('data-show-dots') !== 'false',
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'image': {
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');
      return {
        contentType: 'image',
        appearance,
        cssClasses,
        src: imgEl?.getAttribute('src') || '',
        alt: imgEl?.getAttribute('alt') || '',
        title: imgEl?.getAttribute('title') || '',
        link: linkEl?.getAttribute('href') || undefined,
        openInNewTab: linkEl?.getAttribute('target') === '_blank',
        ...boxProps,
      };
    }

    case 'text': {
      return {
        contentType: 'text',
        appearance,
        cssClasses,
        content: el.innerHTML,
        ...boxProps,
      };
    }

    case 'html': {
      // Entity-encoded HTML inside — decode it
      const inner = el.innerHTML
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
      return {
        contentType: 'html',
        appearance,
        cssClasses,
        html: inner,
        ...boxProps,
      };
    }

    case 'heading': {
      const headingTag = el.querySelector('h1,h2,h3,h4,h5,h6');
      return {
        contentType: 'heading',
        appearance,
        cssClasses,
        headingType: headingTag?.tagName?.toLowerCase() || 'h2',
        text: headingTag?.innerHTML || el.innerHTML,
        ...boxProps,
      };
    }

    case 'buttons': {
      return {
        contentType: 'buttons',
        appearance,
        cssClasses,
        isSameWidth: appearance === 'stacked',
        ...boxProps,
        children: parseChildren(el),
      };
    }

    case 'button-item': {
      const linkEl = el.querySelector('a') || el.querySelector('button');
      const buttonType = el.getAttribute('data-button-type') ||
        (linkEl?.className?.includes('primary') ? 'primary' :
         linkEl?.className?.includes('secondary') ? 'secondary' : 'link');
      return {
        contentType: 'button-item',
        appearance,
        cssClasses,
        text: linkEl?.textContent?.trim() || '',
        link: (linkEl as HTMLAnchorElement)?.href || linkEl?.getAttribute('href') || undefined,
        openInNewTab: linkEl?.getAttribute('target') === '_blank',
        buttonType,
        ...boxProps,
      };
    }

    case 'divider': {
      const hrEl = el.querySelector('hr');
      const hrStyle = parseStyle(hrEl?.getAttribute('style') || null);
      return {
        contentType: 'divider',
        appearance,
        cssClasses,
        width: hrStyle.width || '100%',
        color: hrStyle.borderColor || hrStyle.backgroundColor || '#ccc',
        thickness: hrStyle.borderWidth || '1px',
        ...boxProps,
      };
    }

    case 'block': {
      const blockId = el.getAttribute('data-block-id') ||
        el.querySelector('[data-block-id]')?.getAttribute('data-block-id') || '';
      return {
        contentType: 'block',
        blockId,
        cssClasses,
        ...boxProps,
      };
    }

    case 'products': {
      // PageBuilder products widget — extract SKUs/url_keys from data attributes
      const skus = el.getAttribute('data-skus')?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const pathNames = el.getAttribute('data-path-names')?.split(',').map(s => s.trim()).filter(Boolean) || [];
      const conditionsEncoded = el.getAttribute('data-conditions-encoded') || '';
      return {
        contentType: 'products',
        appearance: appearance || 'carousel',
        cssClasses,
        skus,
        pathNames,
        conditionsEncoded,
        slidesToShow: parseInt(el.getAttribute('data-slides-to-show') || '6', 10),
        autoplay: el.getAttribute('data-autoplay') === 'true',
        autoplaySpeed: parseInt(el.getAttribute('data-autoplay-speed') || '4000', 10),
        infinite: el.getAttribute('data-infinite-loop') !== 'false',
        arrows: el.getAttribute('data-show-arrows') !== 'false',
        dots: el.getAttribute('data-show-dots') === 'true',
        ...boxProps,
      };
    }

    default:
      // Unknown type — render as raw HTML
      return {
        contentType: 'html',
        html: el.outerHTML,
      };
  }
}

/** Recursively parse child elements with data-content-type */
function parseChildren(el: Element): ContentTypeData[] {
  const children: ContentTypeData[] = [];
  el.childNodes.forEach(node => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as Element;
    if (child.hasAttribute('data-content-type')) {
      const parsed = parseElement(child);
      if (parsed) children.push(parsed);
    } else {
      // Recurse into non-content-type wrappers (e.g. slick track divs)
      const nested = parseChildren(child);
      children.push(...nested);
    }
  });
  return children;
}

/**
 * Parse Magento PageBuilder HTML string into ContentTypeData tree.
 * Returns null if the HTML doesn't contain PageBuilder content.
 */
export function parsePageBuilderHtml(html: string): ContentTypeData[] | null {
  if (!html || !html.includes('data-content-type')) return null;

  // Use DOMParser in browser, or return null in SSR
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="pb-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('pb-root');
  if (!root) return null;

  const blocks = parseChildren(root);
  return blocks.length > 0 ? blocks : null;
}
