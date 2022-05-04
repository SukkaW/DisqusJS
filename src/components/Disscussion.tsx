import type { DisqusJSConfig, DisqusJsSortType } from '../types';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useStore } from '../state';

const DisqusJSSortTypeRadio = memo(() => {
  const sortType = useStore(state => state.sortType);
  const setSortType = useStore(state => state.setSortType);

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

const DisqusJSPosts = (props: DisqusJSConfig & { id: string }) => {
  const apiKeys = useMemo(() => (
    Array.isArray(props.apikey) ? props.apikey : [props.apikey]
  ), [props.apikey]);

  const posts = useStore(state => state.posts);
  const resetPosts = useStore(state => state.resetPosts);
  const errorWhenLoadMorePosts = useStore(state => state.morePostsError);
  const isLoadingMorePosts = useStore(state => state.loadingPosts);
  const fetchMorePosts = useStore(state => state.fetchMorePosts);

  const fetchFirstPageRef = useRef<string | null>(null);

  const fetchNextPageOfPosts = useCallback(
    () => fetchMorePosts(props.shortname, props.id, apiKeys, props.api),
    [apiKeys, fetchMorePosts, props.api, props.id, props.shortname]
  );

  useEffect(() => {
    // When there is no posts at all, load the first pagination of posts.
    if (fetchFirstPageRef.current !== props.id) {
      resetPosts();
      fetchFirstPageRef.current = props.id;
      fetchNextPageOfPosts();
    }
  }, [posts, fetchNextPageOfPosts, props.id, resetPosts]);

  const loadMoreCommentsButtonClickHandler = useCallback(() => {
    fetchNextPageOfPosts();
  }, [fetchNextPageOfPosts]);

  if (posts.length > 0) {
    return (
      <>
        <DisqusJSCommentsList comments={posts.filter(Boolean).map(i => i.response).flat()} admin={props.admin} adminLabel={props.adminLabel} />
        {
          posts.at(-1)?.cursor.hasNext && (
            <DisqusJSLoadMoreCommentsButton
              isLoading={isLoadingMorePosts}
              isError={errorWhenLoadMorePosts}
              onClick={isLoadingMorePosts ? undefined : loadMoreCommentsButtonClickHandler}
            />
          )
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

  const thread = useStore(state => state.thread);
  const fetchThread = useStore(state => state.fetchThread);
  const setDisqusJsMessage = useStore(state => state.setMsg);

  const fetchThreadRef = useRef<string | null>(null);

  const identifier = props.identifier ?? document.location.origin + document.location.pathname + document.location.search;

  useEffect(() => {
    if (fetchThreadRef.current !== identifier) {
      setDisqusJsMessage(
        <>
          评论基础模式加载中... 如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
      fetchThreadRef.current = identifier;
      fetchThread(props.shortname, identifier, apiKeys, props.api);
    } else {
      setDisqusJsMessage(
        <>
          你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
    }
  }, [thread, fetchThread, identifier, setDisqusJsMessage, props.shortname, props.api, apiKeys]);

  if (!thread) {
    return null;
  }

  if (thread.response.length === 1) {
    if (thread.response[0].posts === 0) {
      return (
        <>
          <DisqusJSHeader totalComments={0} siteName={props.siteName ?? ''} />
          <DisqusJSNoComment text={props.nocomment ?? '这里空荡荡的，一个人都没有'} />
        </>
      );
    }

    return (
      <>
        <DisqusJSHeader totalComments={thread.response[0].posts} siteName={props.siteName ?? ''} />
        <DisqusJSPosts {...props} id={thread.response[0].id} />
      </>
    );
  }

  return <DisqusJSCreateThread />;
};
