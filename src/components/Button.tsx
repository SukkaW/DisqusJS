import { memo, useCallback, useMemo } from 'react';
import { useSetMode } from '../context/mode';
import { useSetHasError } from '../context/error';

export const DisqusJSLoadMoreCommentsButton = memo(({ isError, isLoading, ...restProps }: JSX.IntrinsicElements['a'] & { isError?: boolean, isLoading: boolean }) => {
  const text = useMemo(() => {
    if (isError) {
      return '加载失败，请重试';
    }
    if (isLoading) {
      return '正在加载...';
    }
    return '加载更多评论';
  }, [isError, isLoading]);

  return (
    <a {...restProps} id="dsqjs-load-more" className={`dsqjs-load-more ${isError ? 'is-error' : ''}`} role="button">
      {text}
    </a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSLoadMoreCommentsButton.displayName = 'DisqusJSLoadMoreCommentsButton';
}

export const DisqusJSForceDisqusModeButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsMode = useSetMode();
  const onClickHandler = useCallback(() => setDisqusJsMode('disqus'), [setDisqusJsMode]);

  return (
    <a id="dsqjs-force-disqus" className="dsqjs-msg-btn" onClick={onClickHandler}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusModeButton.displayName = 'DisqusJSForceDisqusModeButton';
}

export const DisqusJSReTestModeButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsMode = useSetMode();
  const onClickHandler = useCallback(() => setDisqusJsMode(null), [setDisqusJsMode]);

  return (
    <a id="dsqjs-test-disqus" className="dsqjs-msg-btn" onClick={onClickHandler}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSReTestModeButton.displayName = 'DisqusJSRetestModeButton';
}

export const DisqusJSForceDisqusJsModeButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsMode = useSetMode();
  const onClickHandler = useCallback(() => setDisqusJsMode('dsqjs'), [setDisqusJsMode]);

  return (
    <a id="dsqjs-force-dsqjs" className="dsqjs-msg-btn" onClick={onClickHandler}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusJsModeButton.displayName = 'DisqusJSForceDisqusJsModeButton';
}

export const DisqusJSRetryButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsHasError = useSetHasError();
  const handleClick = useCallback(() => {
    setDisqusJsHasError(false);
  }, [setDisqusJsHasError]);
  return (
    <a id="dsqjs-reload-dsqjs" className="dsqjs-msg-btn" onClick={handleClick}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSRetryButton.displayName = 'DisqusJSRetryButton';
}
