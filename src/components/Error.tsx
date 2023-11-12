import { memo } from 'react';
import { DisqusJSForceDisqusModeButton, DisqusJSReTestModeButton, DisqusJSRetryButton } from './Button';

export const DisqusJSError = memo(() => (
  <div id="dsqjs-msg">
    评论基础模式加载失败，请
    {' '}
    <DisqusJSRetryButton>重载</DisqusJSRetryButton>
    {' '}
    或
    {' '}
    <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton>
  </div>
));

export const DisqusJSCreateThread = memo(() => (
  <div id="dsqjs-msg">
    当前 Thread 尚未创建。是否切换至
    {' '}
    <DisqusJSForceDisqusModeButton>完整 Disqus 模式</DisqusJSForceDisqusModeButton>
    ？
  </div>
));

export const DisqusJSNoComment = memo(({ text }: { text: string }) => (
  <p className="dsqjs-no-comment">{text}</p>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSError.displayName = 'DisqusJSError';
  DisqusJSCreateThread.displayName = 'DisqusJSCreateThread';
  DisqusJSNoComment.displayName = 'DisqusJSNoComment';
}
