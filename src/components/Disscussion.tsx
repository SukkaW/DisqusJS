import type { DisqusAPI, DisqusJSConfig, DisqusJsSortType } from '../types';
import { memo, useCallback, useEffect, useRef } from 'react';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useRandomApiKey } from '../lib/hooks';
import { useSetDisqusJsMessage } from '../context/disqusjs-msg';
import { useDisqusJsSortType, useSetDisqusJsSortType } from '../context/disqusjs-sort-type';
import { useDisqusJSLoadingMorePostsError, useSetDisqusJsLoadingMorePostsError } from '../context/disqusjs-error-when-loading-more-posts';
import { useDisqusJSPosts, useSetDisqusJSPosts } from '../context/disqusjs-posts';
import { useDisqusJSLoadingPosts, useSetDisqusJsLoadingPosts } from '../context/disqusjs-loading-posts';
import { useSetDisqusJsHasError } from '../context/disqusjs-error';
import { disqusJsApiFetcher } from '../lib/util';
import { useDisqusJsThread, useSetDisqusJsThread } from '../context/disqusjs-thread';

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
  const sortType = useDisqusJsSortType();
  const setSortType = useSetDisqusJsSortType();

  return (
    <div className="dsqjs-order">
      <DisqusJSSortTypeRadio
        checked={sortType === 'desc' || sortType === null}
        sortType="desc"
        title="按从新到旧"
        label="最新"
        onChange={useCallback(() => setSortType('desc'), [setSortType])}
      />
      <DisqusJSSortTypeRadio
        checked={sortType === 'asc'}
        sortType="asc"
        title="按从旧到新"
        label="最早"
        onChange={useCallback(() => setSortType('asc'), [setSortType])}
      />
      <DisqusJSSortTypeRadio
        checked={sortType === 'popular'}
        sortType="popular"
        title="按评分从高到低"
        label="最佳"
        onChange={useCallback(() => setSortType('popular'), [setSortType])}
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

const useFetchMorePosts = (shortname: string, id: string | null, apiKey: string, api = 'https://disqus.skk.moe/disqus/') => {
  const posts = useDisqusJSPosts();
  const setPosts = useSetDisqusJSPosts();
  const setLoadingPosts = useSetDisqusJsLoadingPosts();
  const setError = useSetDisqusJsHasError();
  const setErrorWhenLoadingMorePosts = useSetDisqusJsLoadingMorePostsError();

  return useCallback(async (reset = false, sortType: DisqusJsSortType = 'desc') => {
    if (!id) return;

    setLoadingPosts(true);
    setErrorWhenLoadingMorePosts(false);

    const lastPost = reset ? null : posts[posts.length - 1];
    if (lastPost && !lastPost.cursor.hasNext) return;

    const url = `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}&order=${sortType ?? 'desc'}${posts.length !== 0 && lastPost?.cursor.next ? `&cursor=${encodeURIComponent(lastPost.cursor.next)}` : ''}`;

    const handleError = () => {
      if (reset) {
        setError(true);
        setLoadingPosts(false);
      } else {
        setErrorWhenLoadingMorePosts(true);
        setLoadingPosts(false);
      }
    };

    try {
      const newPosts = await disqusJsApiFetcher<DisqusAPI.Posts>(apiKey, url);

      if (newPosts.code === 0) {
        setPosts(prevPosts => (reset ? [] : prevPosts).concat(newPosts));
        setLoadingPosts(false);
      } else {
        handleError();
      }
    } catch {
      handleError();
    }
  }, [api, apiKey, id, posts, setError, setErrorWhenLoadingMorePosts, setLoadingPosts, setPosts, shortname]);
};

const DisqusJSPosts = (props: DisqusJSConfig & { id: string }) => {
  const apiKey = useRef(useRandomApiKey(props.apikey));

  const posts = useDisqusJSPosts();

  const sortType = useDisqusJsSortType();
  const prevSortType = useRef(sortType);

  const errorWhenLoadMorePosts = useDisqusJSLoadingMorePostsError();
  const isLoadingMorePosts = useDisqusJSLoadingPosts();

  const fetchMorePosts = useFetchMorePosts(props.shortname, props.id, apiKey.current, props.api);

  const fetchFirstPageRef = useRef<string | null>(null);

  const resetAndFetchFirstPageOfPosts = useCallback(
    () => fetchMorePosts(true),
    [fetchMorePosts]
  );
  const fetchNextPageOfPosts = useCallback(
    () => fetchMorePosts(false),
    [fetchMorePosts]
  );

  useEffect(() => {
    // When there is no posts at all, load the first pagination of posts.
    if (fetchFirstPageRef.current !== props.id) {
      fetchFirstPageRef.current = props.id;
      resetAndFetchFirstPageOfPosts();
    } else if (prevSortType.current !== sortType) {
      prevSortType.current = sortType;
      fetchFirstPageRef.current = props.id;
      resetAndFetchFirstPageOfPosts();
    }
  }, [posts, resetAndFetchFirstPageOfPosts, props.id, isLoadingMorePosts, sortType]);

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

const useFetchThread = (shortname: string, identifier: string, apiKey: string, api = 'https://disqus.skk.moe/disqus/') => {
  const setThread = useSetDisqusJsThread();
  const setError = useSetDisqusJsHasError();

  return useCallback(async () => {
    try {
      const thread = await disqusJsApiFetcher<DisqusAPI.Thread>(apiKey, `${api}3.0/threads/list.json?forum=${encodeURIComponent(shortname)}&thread=${encodeURIComponent(`ident:${identifier}`)}`);
      if (thread.code === 0) {
        setThread(thread);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, [api, apiKey, identifier, setError, setThread, shortname]);
};

export const DisqusJSThread = (props: DisqusJSConfig) => {
  const apiKey = useRef(useRandomApiKey(props.apikey));

  const thread = useDisqusJsThread();
  const identifier = props.identifier ?? document.location.origin + document.location.pathname + document.location.search;

  const fetchThread = useFetchThread(props.shortname, identifier, apiKey.current, props.api);
  const setDisqusJsMessage = useSetDisqusJsMessage();

  const fetchThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchThreadRef.current !== identifier) {
      setDisqusJsMessage(
        <>
          评论基础模式加载中... 如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
      fetchThreadRef.current = identifier;
      fetchThread();
    } else {
      setDisqusJsMessage(
        <>
          你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
    }
  }, [thread, fetchThread, identifier, setDisqusJsMessage, props.shortname, props.api]);

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
