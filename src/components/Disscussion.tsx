import type { DisqusAPI } from '../types';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useEffect } from 'foxact/use-abortable-effect';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useRandomApiKey } from '../lib/hooks';
import { useSortType, useSetSortType } from '../context/sort-type';
import { useSetHasError } from '../context/error';
import { disqusJsApiFetcher } from '../lib/util';
import { useConfig } from '../context/config';
import { useComponentWillReceiveUpdate } from 'foxact/use-component-will-receive-update';
import { useSingleton } from 'foxact/use-singleton';

interface DisqusJSSortTypeRadioProps {
  checked: boolean,
  sortType: string,
  title: string,
  label: string,
  onChange: () => void
}

function DisqusJSSortTypeRadio({
  sortType,
  onChange,
  checked,
  title,
  label
}: DisqusJSSortTypeRadioProps) {
  return (
    <>
      <input
        className="dsqjs-order-radio"
        id={`dsqjs-order-${sortType}`}
        type="radio"
        name="comment-order"
        value={sortType}
        onChange={onChange}
        checked={checked}
      />
      <label className="dsqjs-order-label" htmlFor={`dsqjs-order-${sortType}`} title={title}>{label}</label>
    </>
  );
}

const DisqusJSSortTypeRadioGroup = memo(function DisqusJSSortTypeRadioGroup() {
  const sortType = useSortType();
  const setSortType = useSetSortType();

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

interface HeaderProps {
  totalComments: number,
  siteName: string
}

const DisqusJSHeader = memo(function DisqusJSHeader({ totalComments, siteName }: HeaderProps) {
  return (
    <header className="dsqjs-header" id="dsqjs-header">
      <nav className="dsqjs-nav dsqjs-clearfix">
        <ul>
          <li className="dsqjs-nav-tab dsqjs-tab-active">
            <span>{totalComments} Comments</span>
          </li>
          <li className="dsqjs-nav-tab">{siteName}</li>
        </ul>
        <DisqusJSSortTypeRadioGroup />
      </nav>
    </header>
  );
});

function DisqusJSPosts({ id }: { id: string }) {
  const { apikey, shortname, api } = useConfig();

  const apiKey = useRef(useRandomApiKey(apikey));

  const [posts, setPosts] = useState<DisqusAPI.Posts[]>([]);
  const setError = useSetHasError();

  const sortType = useSortType();

  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [errorWhenLoadingMorePosts, setErrorWhenLoadingMorePosts] = useState(false);

  const fetchMorePosts = useCallback(async (reset = false) => {
    if (!id) return;

    setIsLoadingMorePosts(true);
    setErrorWhenLoadingMorePosts(false);

    const lastPost = reset ? null : posts[posts.length - 1];
    if (lastPost && !lastPost.cursor.hasNext) return;

    const url = `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}&order=${sortType ?? 'desc'}${posts.length !== 0 && lastPost?.cursor.next ? `&cursor=${encodeURIComponent(lastPost.cursor.next)}` : ''}`;

    const handleError = () => {
      if (reset) {
        setError(true);
      } else {
        setErrorWhenLoadingMorePosts(true);
      }
      setIsLoadingMorePosts(false);
    };

    try {
      const newPosts = await disqusJsApiFetcher<DisqusAPI.Posts>(apiKey.current, url);

      if (newPosts.code === 0) {
        setPosts(prevPosts => (reset ? [] : prevPosts).concat(newPosts));
        setIsLoadingMorePosts(false);
      } else {
        handleError();
      }
    } catch {
      handleError();
    }
  }, [id, posts, api, shortname, sortType, setError]);

  const resetAndFetchFirstPageOfPosts = useCallback(
    () => fetchMorePosts(true),
    [fetchMorePosts]
  );
  const fetchNextPageOfPosts = useCallback(
    () => fetchMorePosts(false),
    [fetchMorePosts]
  );

  useComponentWillReceiveUpdate(resetAndFetchFirstPageOfPosts, [id, sortType]);
  useSingleton(resetAndFetchFirstPageOfPosts);

  const comments = useMemo(() => posts.filter(Boolean).flatMap(i => i.response), [posts]);

  if (posts.length > 0) {
    return (
      <>
        <DisqusJSCommentsList comments={comments} />
        {
          posts[posts.length - 1]?.cursor.hasNext && (
            <DisqusJSLoadMoreCommentsButton
              isLoading={isLoadingMorePosts}
              isError={errorWhenLoadingMorePosts}
              onClick={isLoadingMorePosts ? undefined : fetchNextPageOfPosts}
            />
          )
        }
      </>
    );
  }

  return null;
}

export function DisqusJSThread() {
  const { apikey: $apikey, identifier: $identifier, shortname, api, siteName, nocomment } = useConfig();

  const apiKey = useRef(useRandomApiKey($apikey));

  const [threadResult, setThreadResult] = useState<{
    requestUrl: string,
    thread: DisqusAPI.Thread
  } | null>(null);
  const setError = useSetHasError();

  const identifier = typeof window === 'undefined'

    ? $identifier ?? null
    : ($identifier ?? document.location.origin + document.location.pathname + document.location.search);

  const requestUrl = `${api}3.0/threads/list.json?forum=${encodeURIComponent(shortname)}&thread=${encodeURIComponent(`ident:${identifier}`)}`;

  const fetchThreadRef = useRef<{
    requestUrl: string,
    promise: Promise<DisqusAPI.Thread>
  } | null>(null);

  useEffect(signal => {
    let request = fetchThreadRef.current;

    if (request?.requestUrl !== requestUrl) {
      request = {
        requestUrl,
        promise: disqusJsApiFetcher<DisqusAPI.Thread>(apiKey.current, requestUrl)
      };
      fetchThreadRef.current = request;
    }

    request.promise.then(thread => {
      if (signal.aborted) {
        return;
      }

      if (thread.code === 0) {
        setThreadResult({ requestUrl, thread });
      } else {
        setError(true);
      }
    }).catch(() => {
      if (!signal.aborted) {
        setError(true);
      }
    });
  }, [requestUrl, setError]);

  const thread = threadResult?.requestUrl === requestUrl
    ? threadResult.thread
    : null;

  const message = (
    <div id="dsqjs-msg">
      {thread === null
        ? '评论基础模式加载中...'
        : '你可能无法访问 Disqus，已启用评论基础模式。'}
      {' '}
      如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并
      {' '}
      <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
    </div>
  );

  if (!thread) {
    return message;
  }

  if (thread.response.length !== 1) {
    return <DisqusJSCreateThread />;
  }

  const matchedThread = thread.response[0];
  const totalComments = matchedThread.posts;

  return (
    <>
      {message}
      <DisqusJSHeader totalComments={totalComments} siteName={siteName ?? ''} />
      {totalComments === 0
        ? <DisqusJSNoComment text={nocomment ?? '这里空荡荡的，一个人都没有'} />
        : <DisqusJSPosts id={matchedThread.id} />}
    </>
  );
}
