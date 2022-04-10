import { memo } from 'react';

export const DisqusJSFooter = memo(() => (
  <footer>
    <p className="dsqjs-footer">
      Powered by
      {' '}
      <a className="dsqjs-disqus-logo" href="https://disqus.com" target="_blank" rel="external nofollow noopener noreferrer" />
      {' '}&amp;{' '}
      <a href="https://disqusjs.skk.moe" target="_blank" rel="noreferrer">DisqusJS</a>
    </p>
  </footer>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSFooter.displayName = 'DisqusJSFooter';
}
