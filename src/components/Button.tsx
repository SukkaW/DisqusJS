import { memo, useMemo } from 'react';

import { useSetMode } from '../context/mode';
import { useSetHasError } from '../context/error';

export const DisqusJSLoadMoreCommentsButton = memo(function DisqusJSLoadMoreCommentsButton({ isError, isLoading, key, ...restProps }: React.ComponentProps<'a'> & { isError?: boolean, isLoading: boolean }) {
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
    <a {...restProps} id="dsqjs-load-more" className={`dsqjs-load-more${isError ? ' is-error' : ''}`} role="button">
      {text}
    </a>
  );
});

export const DisqusJSForceDisqusModeButton = memo(function DisqusJSForceDisqusModeButton({ children }: React.PropsWithChildren) {
  const setDisqusJsMode = useSetMode();
  return (
    <a id="dsqjs-force-disqus" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode('disqus')}>{children}</a>
  );
});

export const DisqusJSReTestModeButton = memo(function DisqusJSReTestModeButton({ children }: React.PropsWithChildren) {
  const setDisqusJsMode = useSetMode();
  return (
    <a id="dsqjs-test-disqus" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode(null)} role="button">{children}</a>
  );
});

export const DisqusJSForceDisqusJsModeButton = memo(function DisqusJSForceDisqusJsModeButton({ children }: React.PropsWithChildren) {
  const setDisqusJsMode = useSetMode();
  return (
    <a id="dsqjs-force-dsqjs" className="dsqjs-msg-btn" onClick={() => setDisqusJsMode('dsqjs')} role="button">{children}</a>
  );
});

export const DisqusJSRetryButton = memo(function DisqusJSRetryButton({ children }: React.PropsWithChildren) {
  const setDisqusJsHasError = useSetHasError();
  return (
    <a id="dsqjs-reload-dsqjs" className="dsqjs-msg-btn" onClick={() => setDisqusJsHasError(false)} role="button">{children}</a>
  );
});
