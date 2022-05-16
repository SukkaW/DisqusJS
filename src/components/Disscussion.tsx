import type { DisqusJSConfig, DisqusJsSortType } from '../types';
import { memo, useCallback, useEffect, useRef } from 'react';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useStore } from '../state';
import { useRandomApiKey } from '../lib/hooks';

const DisqusJSSortTypeRadio = (props: {
  checked: boolean;
  sortType: string;
  title: string;
  label: string;
  onChange: () => void;
}) => {
  return <>
    <input
      className="dsqjs-order-radio"
      id={`dsqjs-order-${props.sortType}`}
      type="radio"
      name="comment-order"
      value={props.sortType}
      onChange={props.onChange}
      checked={props.checked}
    />
    <label className="dsqjs-order-label" htmlFor={`dsqjs-order-${props.sortType}`} title={props.title}>{props.label}</label>
  </>;
};

const DisqusJSSortTypeRadioGroup = memo(() => {
  const sortType = useStore(state => state.sortType);
  const setSortType = useStore(state => state.setSortType);

  const onChangeHandler = useCallback((value: DisqusJsSortType) => () => setSortType(value), [setSortType]);

  return (
    <div className="dsqjs-order">
      <DisqusJSSortTypeRadio
        checked={sortType === 'desc' || sortType === null}
        sortType="desc"
        title="按从新到旧"
        label="最新"
        onChange={onChangeHandler('desc')}
      />
      <DisqusJSSortTypeRadio
        checked={sortType === 'asc'}
        sortType="asc"
        title="按从旧到新"
        label="最早"
        onChange={onChangeHandler('asc')}
      />
      <DisqusJSSortTypeRadio
        checked={sortType === 'popular'}
        sortType="popular"
        title="按评分从高到低"
        label="最佳"
        onChange={onChangeHandler('popular')}
      />
    </div>
  );
});

if (process.env.NODE_ENV !== 'production') {
  DisqusJSSortTypeRadioGroup.displayName = 'DisqusJSSortTypeRadio';
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
      <DisqusJSSortTypeRadioGroup />
    </nav>
  </header>
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSHeader.displayName = 'DisqusJSHeader';
}

const DisqusJSPosts = (props: DisqusJSConfig & { id: string }) => {
  const apiKeys = useRandomApiKey(props.apikey);

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

  if (posts.length > 0) {
    return (
      <>
        <DisqusJSCommentsList comments={posts.filter(Boolean).map(i => i.response).flat()} admin={props.admin} adminLabel={props.adminLabel} />
        {
          posts.at(-1)?.cursor.hasNext && (
            <DisqusJSLoadMoreCommentsButton
              isLoading={isLoadingMorePosts}
              isError={errorWhenLoadMorePosts}
              onClick={isLoadingMorePosts ? undefined : fetchNextPageOfPosts}
            />
          )
        }
      </>
    );
  }

  return null;
};

export const DisqusJSThread = (props: DisqusJSConfig) => {
  const apiKeys = useRandomApiKey(props.apikey);

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
