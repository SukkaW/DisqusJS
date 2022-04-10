import { useSetAtom } from 'jotai';
import { memo, useCallback } from 'react';
import { disqusjsHasErrorAtom, disqusjsModeAtom } from '../state';

export const DisqusJSLoadMoreCommentsButton = memo((props: JSX.IntrinsicElements['a']) => (
  <a {...props} id="dsqjs-load-more" className="dsqjs-load-more" role="button">
    加载更多评论
  </a>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSLoadMoreCommentsButton.displayName = 'DisqusJSLoadMoreCommentsButton';
}

export const DisqusJSForceDisqusModeButton = memo((props: { children: React.ReactChild }) => {
  const setDisqusJsMode = useSetAtom(disqusjsModeAtom);
  const onClickHandler = useCallback(() => {
    setDisqusJsMode('disqus');
    localStorage.setItem('dsqjs_mode', 'disqus');
  }, [setDisqusJsMode]);

  return (
    <a id="dsqjs-force-disqus" className="dsqjs-msg-btn" onClick={onClickHandler}>{props.children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusModeButton.displayName = 'DisqusJSForceDisqusModeButton';
}

export const DisqusJSReTestModeButton = memo((props: { children: React.ReactChild }) => {
  const setDisqusJsMode = useSetAtom(disqusjsModeAtom);
  const onClickHandler = useCallback(() => {
    setDisqusJsMode(null);
    localStorage.removeItem('dsqjs_mode');
  }, [setDisqusJsMode]);

  return (
    <a id="dsqjs-test-disqus" className="dsqjs-msg-btn" onClick={onClickHandler}>{props.children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSReTestModeButton.displayName = 'DisqusJSRetestModeButton';
}

export const DisqusJSForceDisqusJsModeButton = memo((props: { children: React.ReactChild }) => {
  const setDisqusJsMode = useSetAtom(disqusjsModeAtom);
  const onClickHandler = useCallback(() => {
    setDisqusJsMode('dsqjs');
    localStorage.setItem('dsqjs_mode', 'dsqjs');
  }, [setDisqusJsMode]);

  return (
    <a id="dsqjs-force-dsqjs" className="dsqjs-msg-btn" onClick={onClickHandler}>{props.children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusJsModeButton.displayName = 'DisqusJSForceDisqusJsModeButton';
}

export const DisqusJSRetryButton = memo((props: { children: React.ReactChild }) => {
  const setDisqusJsHasError = useSetAtom(disqusjsHasErrorAtom);
  const handleClick = useCallback(() => {
    setDisqusJsHasError(false);
  }, [setDisqusJsHasError]);
  return (
    <a id="dsqjs-reload-dsqjs" className="dsqjs-msg-btn" onClick={handleClick}>{props.children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSRetryButton.displayName = 'DisqusJSRetryButton';
}
