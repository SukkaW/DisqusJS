import type { DisqusAPI, DisqusJSConfig, DisqusJsSortType } from '../types';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { DisqusJSCreateThread, DisqusJSNoComment } from './Error';
import { DisqusJSCommentsList } from './CommentList';
import { DisqusJSForceDisqusModeButton, DisqusJSLoadMoreCommentsButton, DisqusJSReTestModeButton } from './Button';
import { useRandomApiKey } from '../lib/hooks';
import { useSetMessage } from '../context/message';
import { useSortType, useSetSortType } from '../context/sort-type';
import { useSetHasError } from '../context/error';
import { disqusJsApiFetcher } from '../lib/util';

interface DisqusJSSortTypeRadioProps {
  checked: boolean;
  sortType: string;
  title: string;
  label: string;
  onChange: () => void;
}

const DisqusJSSortTypeRadio = ({
  sortType,
  onChange,
  checked,
  title,
  label
}: DisqusJSSortTypeRadioProps) => {
  return <>
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
  </>;
};

const DisqusJSSortTypeRadioGroup = memo(() => {
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

if (process.env.NODE_ENV !== 'production') {
  DisqusJSSortTypeRadioGroup.displayName = 'DisqusJSSortTypeRadio';
}

interface HeaderProps {
  totalComments: number;
  siteName: string;
}

const DisqusJSHeader = memo(({ totalComments, siteName }: HeaderProps) => (
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
));

if (process.env.NODE_ENV !== 'production') {
  DisqusJSHeader.displayName = 'DisqusJSHeader';
}

const DisqusJSPosts = ({
  apikey,
  shortname,
  id,
  api,
  admin,
  adminLabel
}: DisqusJSConfig & { id: string }) => {
  const apiKey = useRef(useRandomApiKey(apikey));

  const [posts, setPosts] = useState<DisqusAPI.Posts[]>([]);
  const setError = useSetHasError();

  const sortType = useSortType();
  const prevSortType = useRef(sortType);

  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [errorWhenLoadMorePosts, setErrorWhenLoadingMorePosts] = useState(false);

  const fetchMorePosts = useCallback(async (reset = false, sortType: DisqusJsSortType = 'desc') => {
    if (!id) return;

    setIsLoadingMorePosts(true);
    setErrorWhenLoadingMorePosts(false);

    const lastPost = reset ? null : posts[posts.length - 1];
    if (lastPost && !lastPost.cursor.hasNext) return;

    const url = `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}&order=${sortType ?? 'desc'}${posts.length !== 0 && lastPost?.cursor.next ? `&cursor=${encodeURIComponent(lastPost.cursor.next)}` : ''}`;

    const handleError = () => {
      if (reset) {
        setError(true);
        setIsLoadingMorePosts(false);
      } else {
        setErrorWhenLoadingMorePosts(true);
        setIsLoadingMorePosts(false);
      }
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
  }, [api, id, posts, shortname, setError, setErrorWhenLoadingMorePosts, setIsLoadingMorePosts, setPosts]);

  const fetchFirstPageRef = useRef<string | null>(null);

  const resetAndFetchFirstPageOfPosts = useCallback(
    () => fetchMorePosts(true, sortType),
    [fetchMorePosts, sortType]
  );
  const fetchNextPageOfPosts = useCallback(
    () => fetchMorePosts(false, sortType),
    [fetchMorePosts, sortType]
  );

  useEffect(() => {
    // When there is no posts at all, load the first pagination of posts.
    if (fetchFirstPageRef.current !== id) {
      fetchFirstPageRef.current = id;
      resetAndFetchFirstPageOfPosts();
    } else if (prevSortType.current !== sortType) {
      prevSortType.current = sortType;
      fetchFirstPageRef.current = id;
      resetAndFetchFirstPageOfPosts();
    }
  }, [posts, resetAndFetchFirstPageOfPosts, id, isLoadingMorePosts, sortType]);

  if (posts.length > 0) {
    return (
      <>
        <DisqusJSCommentsList comments={posts.filter(Boolean).map(i => i.response).flat()} admin={admin} adminLabel={adminLabel} />
        {
          posts[posts.length - 1]?.cursor.hasNext && (
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
  const apiKey = useRef(useRandomApiKey(props.apikey));

  const { shortname, api } = props;

  const [thread, setThread] = useState<DisqusAPI.Thread | null>(null);
  const setError = useSetHasError();

  const identifier = props.identifier ?? document.location.origin + document.location.pathname + document.location.search;

  const fetchThread = useCallback(async () => {
    try {
      const thread = await disqusJsApiFetcher<DisqusAPI.Thread>(apiKey.current, `${api}3.0/threads/list.json?forum=${encodeURIComponent(shortname)}&thread=${encodeURIComponent(`ident:${identifier}`)}`);
      if (thread.code === 0) {
        setThread(thread);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, [api, apiKey, identifier, setError, setThread, shortname]);

  const setMsg = useSetMessage();

  const fetchThreadRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchThreadRef.current !== identifier) {
      setMsg(
        <>
          评论基础模式加载中... 如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并
          {' '}
          <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
      fetchThreadRef.current = identifier;
      fetchThread();
    } else {
      setMsg(
        <>
          你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并
          {' '}
          <DisqusJSReTestModeButton>尝试完整 Disqus 模式</DisqusJSReTestModeButton> | <DisqusJSForceDisqusModeButton>强制完整 Disqus 模式</DisqusJSForceDisqusModeButton>
        </>
      );
    }
  }, [thread, fetchThread, identifier, setMsg, shortname, props.api]);

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
