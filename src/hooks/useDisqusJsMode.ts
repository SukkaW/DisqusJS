import { useEffect } from 'react';
import { isBrowser } from '../lib/util';

import type { DisqusJsMode } from '../types';
import { disqusjsModeAtom, disqusjsMessageAtom } from '../state';
import { useSetAtom } from 'jotai';

const checkDomainAccessiblity = (domain: string) => {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();

    const timeout = setTimeout(() => {
      img.onerror = null;
      img.onload = null;
      reject();
    }, 3000);

    img.onerror = () => {
      clearTimeout(timeout);
      reject();
    };

    img.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    img.src = `https://${domain}/favicon.ico?${+(new Date())}=${+(new Date())}`;
  });
};

export const useDisqusJsMode = (initialValue: DisqusJsMode, shortname: string) => {
  const setDisqusjsMode = useSetAtom(disqusjsModeAtom);
  const setDisqusJsMessage = useSetAtom(disqusjsMessageAtom);

  useEffect(() => {
    if (isBrowser) {
      if (initialValue === null) {
        setDisqusJsMessage('正在检查 Disqus 能否访问...');

        Promise.all((['disqus.com', `${shortname}.disqus.com`]).map(checkDomainAccessiblity))
          .then(() => {
            setDisqusjsMode('disqus');
            localStorage.setItem('dsqjs_mode', 'disqus');
          }, () => {
            setDisqusjsMode('dsqjs');
            localStorage.setItem('dsqjs_mode', 'dsqjs');
          });
      }
    }
  }, [setDisqusJsMessage, initialValue, shortname, setDisqusjsMode]);
};
