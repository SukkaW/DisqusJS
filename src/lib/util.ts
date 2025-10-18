export function disqusJsApiFetcher<T>(apiKey: string, url: string): Promise<T> {
  const Url = new URL(url);
  Url.searchParams.set('api_key', apiKey);
  return fetch(Url.href).then(res => res.json());
}

export const getTimeStampFromString = (dateString: string) => new Date(dateString).getTime();

let domParser: DOMParser | null = null;

export function replaceDisqusCdn(str: string) {
  return str.replaceAll('a.disquscdn.com', 'c.disquscdn.com');
}

export function processCommentMessage(str: string) {
  const rawHtml = replaceDisqusCdn(str)
    .replaceAll(/https?:\/\/disq.us\/url\?url=(.+)%3A[\w-]+&amp;cuid=\d+/g, (_, $1: string) => decodeURIComponent($1));

  domParser ||= new DOMParser();
  const doc = domParser.parseFromString(rawHtml, 'text/html');
  // Very basic, but it will do.
  // Any attempt to bypass XSS limitation will be blocked by Disqus' WAF.
  doc.querySelectorAll('script, iframe, object, embed, form, input, meta').forEach(e => e.remove());
  doc.querySelectorAll('a').forEach(a => {
    // Sanitize href to prevent javascript: or data: URLs
    if (a.href.startsWith('javascript:') || a.href.startsWith('data:')) {
      a.remove();
    } else {
      a.target = '_blank';
      a.rel = 'external noopener nofollow noreferrer';
    }
  });

  // Remove event handler attributes (e.g., onclick, onload)
  doc.querySelectorAll('*').forEach(el => {
    for (let i = 0, len = el.attributes.length; i < len; i++) {
      const attr = el.attributes[i];

      // Remove event handler attributes (e.g., onclick, onload)
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }

    // Remove inline styles (optional, to prevent potential javascript: in styles)
    if (el.hasAttribute('style')) {
      el.removeAttribute('style');
    }
  });

  return doc.body.innerHTML;
}

const timezoneOffset = new Date().getTimezoneOffset();
const numberPadstart = (num: number) => String(num).padStart(2, '0');
export function formatDate(str: string) {
  const utcTimestamp = getTimeStampFromString(str);
  const date = new Date(utcTimestamp - timezoneOffset * 60 * 1000);
  return `${date.getFullYear()}-${numberPadstart(date.getMonth() + 1)}-${numberPadstart(date.getDate())} ${numberPadstart(date.getHours())}:${numberPadstart(date.getMinutes())}`;
}

export function checkDomainAccessibility(domain: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();

    const timeout = setTimeout(() => {
      clear();
      reject();
    }, 3000);

    function handleLoad() {
      clearTimeout(timeout);
      clear();
      resolve();
    }

    function handleError() {
      clearTimeout(timeout);
      clear();
      reject();
    }

    function clear() {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
      img.remove();
    }

    img.addEventListener('error', handleError);
    img.addEventListener('load', handleLoad);

    img.src = `https://${domain}/favicon.ico?${Date.now()}=${Date.now()}`;
  });
}
