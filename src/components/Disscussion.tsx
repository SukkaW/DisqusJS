import type { DisqusJSConfig, DisqusJsSortType } from '../types';
import { useDisqusPosts, useDisqusThread } from '../hooks/useDisqusApi';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useAtom, useSetAtom } from 'jotai';
import { disqusjsHasErrorAtom, disqusjsMessageAtom, disqusjsSortTypeAtom } from '../state';

const DisqusJSSortTypeRadio = memo(() => {
  const [sortType, setSortType] = useAtom(disqusjsSortTypeAtom);

  const onChangeHandler = useCallback((value: DisqusJsSortType) => () => {
    setSortType(value);
  }, [setSortType]);

  return (
    <div className="dsqjs-order">
      <input
        className="dsqjs-order-radio"
        id="dsqjs-order-desc"
        type="radio"
        name="comment-order"
        value="desc"
        onChange={onChangeHandler('desc')}
        checked={sortType === 'desc' || sortType === null}
      />
      <label className="dsqjs-order-label" htmlFor="dsqjs-order-desc" title="按从新到旧">最新</label>
      <input
        className="dsqjs-order-radio"
        id="dsqjs-order-asc"
        type="radio"
        name="comment-order"
        value="asc"
        onChange={onChangeHandler('asc')}
        checked={sortType === 'asc'}
      />
      <label className="dsqjs-order-label" htmlFor="dsqjs-order-asc" title="按从旧到新">最早</label>
      <input
        className="dsqjs-order-radio"
        id="dsqjs-order-popular"
        type="radio"
        name="comment-order"
        value="popular"
        onChange={onChangeHandler('popular')}
        checked={sortType === 'popular'}
      />
      <label className="dsqjs-order-label" htmlFor="dsqjs-order-popular" title="按评分从高到低">最佳</label>
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSSortTypeRadio.displayName = 'DisqusJSSortTypeRadio';
}

const DisqusJSHeader = memo((props: { totalComments: number, siteName: string }) => (
  <header className="dsqjs-header" id="dsqjs-header">
    <nav className="dsqjs-nav dsqjs-clearfix">
      <ul>
        <li className="dsqjs-nav-tab dsqjs-tab-active">
          <span>{props.totalComments} Comments</span>
        </li>
        <li className="dsqjs-nav-tab">{props.siteName}</li>
      </ul>
      <DisqusJSSortTypeRadio />
    </nav>
  </header>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSHeader.displayName = 'DisqusJSHeader';
}

const DisqusJSPosts = (props: DisqusJSConfig & { id: string, isNexted?: boolean }) => {
  const apiKeys = useMemo(() => (
    Array.isArray(props.apikey) ? props.apikey : [props.apikey]
  ), [props.apikey]);

  const { data, error, setSize, size } = useDisqusPosts(props.shortname, props.id, apiKeys, props.api);

  const loadMoreCommentsButtonClickHandler = useCallback(() => {
    setSize(size => size + 1);
  }, [setSize]);

  const setDisqusJsHasError = useSetAtom(disqusjsHasErrorAtom);
  useEffect(() => {
    if (size < 1) {
      if (error || (data && data.some(i => i.code !== 0))) {
        setDisqusJsHasError(true);
      }
    }
  }, [setDisqusJsHasError, error, data, size]);

  if (data) {
    return (
      <>
        <DisqusJSCommentsList comments={data.filter(Boolean).map(i => i.response).flat()} admin={props.admin} adminLabel={props.adminLabel} />
        {
          data[data.length - 1].cursor.hasNext && <DisqusJSLoadMoreCommentsButton isError={error && size >= 1} onClick={loadMoreCommentsButtonClickHandler} />
        }
      </>
    );
  }

  return null;
};

export const DisqusJSThread = (props: DisqusJSConfig) => {
  const apiKeys = useMemo(() => (
    Array.isArray(props.apikey) ? props.apikey : [props.apikey]
  ), [props.apikey]);

  const { data, error } = useDisqusThread(props.shortname, props.identifier, apiKeys);
  const setDisqusJsHasError = useSetAtom(disqusjsHasErrorAtom);
  const setDisqusJsMessage = useSetAtom(disqusjsMessageAtom);

  useEffect(() => {
    if (error || (data && data.code !== 0)) {
      return setDisqusJsHasError(true);
    }
    if (!data && !error) {
      setDisqusJsMessage(
        <>
          评论基础模式加载中... 如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
    }
    if (data) {
      setDisqusJsMessage(
        <>
          你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
    }
  }, [setDisqusJsHasError, setDisqusJsMessage, error, data]);

  if (error || (data && data.code !== 0)) {
    return null;
  }

  if (data) {
    if (data.response.length === 1) {
      if (data.response[0].posts === 0) {
        return (
          <>
            <DisqusJSHeader totalComments={0} siteName={props.siteName ?? ''} />
            <DisqusJSNoComment text={props.nocomment ?? '这里空荡荡的，一个人都没有'} />
          </>
        );
      }

      return (
        <>
          <DisqusJSHeader totalComments={data.response[0].posts} siteName={props.siteName ?? ''} />
          <DisqusJSPosts {...props} id={data.response[0].id} />
        </>
      );
    }

    return <DisqusJSCreateThread />;
  }

  return null;
};
