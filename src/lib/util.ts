export function randomInt(min: number, max: number): number {
  // eslint-disable-next-line no-bitwise
  return (Math.random() * (max - min + 1) + min) | 0;
}

export const isBrowser = typeof window !== 'undefined';

export const disqusJsApiFetcher = <T>(apiKey: string, url: string): Promise<T> => {
  const Url = new URL(url);
  Url.searchParams.set('api_key', apiKey);
  return fetch(Url.toString()).then(res => res.json());
};

export const getTimeStampFromString = (dateString: string) => new Date(dateString).getTime();

let domParser: DOMParser | null = null;

export const processCommentMessage = (str: string) => {
  const rawHtml = str
    .replace(/a\.disquscdn\.com/g, 'c.disquscdn.com')
    .replace(/https?:\/\/disq.us\/url\?url=(.+)%3A[\w-]+&amp;cuid=\d+/gm, (_, $1) => decodeURIComponent($1));

  domParser ||= new DOMParser();
  const doc = domParser.parseFromString(rawHtml, 'text/html');
  // Very basic, but it will do.
  // Any attempt to bypass XSS limitation will be blocked by Disqus' WAF.
  doc.querySelectorAll('script').forEach(script => script.remove());
  doc.querySelectorAll('a').forEach(a => {
    a.target = '_blank';
    a.rel = 'external noopener nofollow noreferrer';
  });
  return doc.body.innerHTML;
};

const timezoneOffset = new Date().getTimezoneOffset();
const numberPadstart = (num: number) => String(num).padStart(2, '0');
export const formatDate = (str: string) => {
  const utcTimestamp = getTimeStampFromString(str);
  const date = new Date(utcTimestamp - timezoneOffset * 60 * 1000);
  return `${date.getFullYear()}-${numberPadstart(date.getMonth() + 1)}-${numberPadstart(date.getDate())} ${numberPadstart(date.getHours())}:${numberPadstart(date.getMinutes())}`;
};

export const checkDomainAccessiblity = (domain: string) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();

    const clear = () => {
      img.onload = null;
      img.onerror = null;
      img.remove();
    };

    const timeout = setTimeout(() => {
      clear();
      reject();
    }, 3000);

    img.onerror = () => {
      clearTimeout(timeout);
      clear();
      reject();
    };

    img.onload = () => {
      clearTimeout(timeout);
      clear();
      resolve();
    };

    img.src = `https://${domain}/favicon.ico?${+(new Date())}=${+(new Date())}`;
  });
};
