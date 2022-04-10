import { useAtomValue } from 'jotai';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite';
import { disqusJsApiFetcher } from '../lib/util';
import { disqusjsSortTypeAtom } from '../state';
import type { DisqusAPI } from '../types';

export const useDisqusThread = (shortname: string, identifier: string, apiKeys: string[], api = 'https://disqus.com/api/') => {
  /*
   * 获取 Thread 信息
   * Disqus API 只支持通过 Thread ID 获取评论列表，所以必须先通过 identifier 获取当前页面 Thread ID
   *
   * API Docs: https://disqus.com/api/docs/threads/list/
   * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
   */
  return useSWRImmutable<DisqusAPI.Thread>(`${api}3.0/threads/list.json?forum=${encodeURIComponent(shortname)}&thread=${encodeURIComponent(`ident:${identifier}`)}`, disqusJsApiFetcher(apiKeys));
};

export const useDisqusPosts = (shortname: string, id: string | null, apiKeys: string[], api = 'https://disqus.com/api/') => {
  const sortType = useAtomValue(disqusjsSortTypeAtom);

  const getKey: SWRInfiniteKeyLoader = (pageIndex: number, previousData) => {
    if (!id) return null;
    if (previousData && !previousData.cursor.hasNext) return null;
    if (pageIndex === 0) return `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}&order=${sortType ?? 'desc'}`;
    return `${api}3.0/threads/listPostsThreaded?forum=${shortname}&thread=${id}${previousData.cursor.next ? `&cursor=${previousData.cursor.next}` : ''}&order=${sortType ?? 'desc'}`;
  };
  /*
   * 获取评论列表
   *
   * API Docs: https://disqus.com/api/docs/posts/list/
   *
   * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
   * https://github.com/SukkaW/DisqusJS/issues/6
   * 可以使用 include=deleted 来获得已被删除评论列表
   *
   * https://blog.fooleap.org/disqus-api-comments-order-by-desc.html
   * 处理评论嵌套问题，使用了一个隐藏 API /threads/listPostsThreaded
   * 用法和 /threads/listPosts 相似，和 /threads/post 的区别也只有 include 字段不同
   * 这个能够返回已删除评论，所以也不需要 include=deleted 了
   * sort 字段提供三个取值：
   *   - desc   （降序）
   *   - asc    （升序）
   *   - popular（最热）
   * 这个 API 的问题在于被嵌套的评论总是降序，看起来很不习惯
   *
   * 每次加载翻页评论的时候合并数据并进行重排序
   * 用户切换排序方式的时候直接取出进行重新渲染
   */
  return useSWRInfinite<DisqusAPI.Posts>(
    getKey,
    disqusJsApiFetcher(apiKeys),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
};
