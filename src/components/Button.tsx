import { memo, useMemo } from 'react';
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
  return (
    <a id="dsqjs-force-disqus" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode('disqus')}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusModeButton.displayName = 'DisqusJSForceDisqusModeButton';
}

export const DisqusJSReTestModeButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsMode = useSetMode();
  return (
    <a id="dsqjs-test-disqus" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode(null)}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSReTestModeButton.displayName = 'DisqusJSRetestModeButton';
}

export const DisqusJSForceDisqusJsModeButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsMode = useSetMode();
  return (
    <a id="dsqjs-force-dsqjs" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode('dsqjs')}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSForceDisqusJsModeButton.displayName = 'DisqusJSForceDisqusJsModeButton';
}

export const DisqusJSRetryButton = memo(({ children }: React.PropsWithChildren) => {
  const setDisqusJsHasError = useSetHasError();
  return (
    <a id="dsqjs-reload-dsqjs" className="dsqjs-msg-btn" onClick={() => setDisqusJsHasError(false)}>{children}</a>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSRetryButton.displayName = 'DisqusJSRetryButton';
}
