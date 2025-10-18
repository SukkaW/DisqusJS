import { useMemo } from 'react';
import { formatDate, getTimeStampFromString, processCommentMessage, replaceDisqusCdn } from '../lib/util';
import type { DisqusAPI } from '../types';
import { DisqusJSForceDisqusModeButton } from './Button';
import { useConfig } from '../context/config';
import { identity } from 'foxts/identity';

interface DisqusJSCommentASTItem {
  comment: DisqusAPI.Post,
  children: DisqusJSCommentASTItem[] | null,
  nesting?: number
}

function DisqusJSPostItem({ comment, children, nesting }: DisqusJSCommentASTItem) {
  const { admin, adminLabel, disqusJsModeAssetsUrlTransformer = identity } = useConfig();
  const profileUrl = comment.author.profileUrl;
  const avatarUrl = disqusJsModeAssetsUrlTransformer(replaceDisqusCdn(comment.author.avatar.cache));

  const imgEl = <img alt={comment.author.username} src={avatarUrl} />;

  return (
    <li id={`comment-${comment.id}`}>
      <div className="dsqjs-post-item dsqjs-clearfix">
        <div className="dsqjs-post-avatar">
          {profileUrl
            ? (
              <a href={profileUrl} target="_blank" rel="noreferrer noopenner nofollow external">
                {imgEl}
              </a>
            )
            : imgEl}
        </div>
        <div className="dsqjs-post-body">
          <div className="dsqjs-post-header">
            {
              profileUrl
                ? (
                  <span className="dsqjs-post-author">
                    <a href={profileUrl} target="_blank" rel="noreferrer noopenner nofollow external">{comment.author.name}</a>
                  </span>
                )
                : <span className="dsqjs-post-author">{comment.author.name}</span>
            }
            {
              // authorEl admin label
              admin === comment.author.username && (
                <span className="dsqjs-admin-badge">{adminLabel}</span>
              )
            }
            {' '}
            <span className="dsqjs-bullet" />
            {' '}
            {
              comment.createdAt && (
                <span className="dsqjs-meta">
                  <time>{formatDate(comment.createdAt)}</time>
                </span>
              )
            }
          </div>
          {
            comment.isDeleted
              ? <div className="dsqjs-post-content"><small>此评论已被删除</small></div>
              : <div className="dsqjs-post-content" dangerouslySetInnerHTML={{ __html: processCommentMessage(comment.message) }} />
          }
        </div>
      </div>
      <DisqusJSChildrenPostItems nesting={nesting}>{children}</DisqusJSChildrenPostItems>
      {comment.hasMore && <p className="dsqjs-has-more">切换至 <DisqusJSForceDisqusModeButton>完整 Disqus 模式</DisqusJSForceDisqusModeButton> 显示更多回复</p>}
    </li>
  );
}

function DisqusJSChildrenPostItems({ children, nesting: currentNesting = 1 }: { children: DisqusJSCommentASTItem[] | null, nesting?: number }) {
  const { nesting: nestingSetting = 4 } = useConfig();

  if (!children || children.length === 0) return null;

  return (
    <ul className={`dsqjs-post-list ${currentNesting < nestingSetting ? 'dsqjs-children' : ''}`}>
      {children.map(comment => (
        <DisqusJSPostItem key={comment.comment.id} {...comment} />
      ))}
    </ul>
  );
}

function createDisqusJSCommentASTItem(comment: DisqusAPI.Post, allChildrenComments: DisqusAPI.Post[], nesting: number): DisqusJSCommentASTItem {
  return {
    comment,
    children: findChildrenFromComments(allChildrenComments, Number(comment.id), nesting + 1),
    nesting: nesting + 1
  };
}

function findChildrenFromComments(allChildrenComments: DisqusAPI.Post[], parentId: number, nesting: number): DisqusJSCommentASTItem[] | null {
  if (allChildrenComments.length === 0) return null;

  const list: DisqusJSCommentASTItem[] = [];
  allChildrenComments.forEach(comment => {
    if (comment.parent === parentId) {
      list.unshift(createDisqusJSCommentASTItem(comment, allChildrenComments, nesting));
    }
  });

  return list;
}

export function DisqusJSCommentsList({ comments }: { comments: DisqusAPI.Post[] }) {
  const processedComments = useMemo(() => {
    const topLevelComments: DisqusAPI.Post[] = [];
    const childComments: DisqusAPI.Post[] = [];

    comments.map((comment, i) => ({ i, p: comment.parent, d: getTimeStampFromString(comment.createdAt) }))
      .sort((a, b) => (a.p && b.p ? a.d - b.d : 0))
      .forEach(({ i }) => {
        (comments[i].parent ? childComments : topLevelComments).push(comments[i]);
      });

    return topLevelComments.map(comment => createDisqusJSCommentASTItem(comment, childComments, 0));
  }, [comments]);

  return (
    <ul className="dsqjs-post-list" id="dsqjs-post-container">
      {processedComments.map(comment => (
        <DisqusJSPostItem
          key={comment.comment.id}
          {...comment}
        />
      ))}
    </ul>
  );
}
