import { memo } from 'react';

export const DisqusJSFooter = memo(() => (
  <footer className="dsqjs-footer-container">
    <p className="dsqjs-footer">
      {'Powered by '}
      <a className="dsqjs-disqus-logo" href="https://disqus.com" target="_blank" rel="external nofollow noopener noreferrer" />
      {' '}
      &amp;
      {' '}
      <a className="dsqjs-dsqjs-logo" href="https://disqusjs.skk.moe" target="_blank" rel="noreferrer noopener">DisqusJS</a>
    </p>
  </footer>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSFooter.displayName = 'DisqusJSFooter';
}
