import { useMemo } from 'react';
import { formatDate, getTimeStampFromString, processCommentMessage, processCommentMessage as replaceDisqusCdn } from '../lib/util';
import type { DisqusAPI } from '../types';
import { DisqusJSForceDisqusModeButton } from './Button';

interface DisqusJSCommentASTItem {
  comment: DisqusAPI.Post,
  children: DisqusJSCommentASTItem[] | null,
  nesting?: number
}

interface PassedDownDisqusJSConfig {
  admin?: string,
  adminLabel?: string,
  nestingSetting?: number
}

function DisqusJSPostItem(props: DisqusJSCommentASTItem & PassedDownDisqusJSConfig) {
  const profileUrl = props.comment.author.profileUrl;
  const avatarUrl = replaceDisqusCdn(props.comment.author.avatar.cache);

  return (
    <li id={`comment-${props.comment.id}`}>
      <div className="dsqjs-post-item dsqjs-clearfix">
        <div className="dsqjs-post-avatar">
          {profileUrl
            ? (
              <a href={profileUrl} target="_blank" rel="noreferrer noopenner nofollow external">
                <img alt={props.comment.author.username} src={avatarUrl} />
              </a>
            )
            : <img alt={props.comment.author.username} src={avatarUrl} />}
        </div>
        <div className="dsqjs-post-body">
          <div className="dsqjs-post-header">
            {
              profileUrl
                ? (
                  <span className="dsqjs-post-author">
                    <a href={profileUrl} target="_blank" rel="noreferrer noopenner nofollow external">{props.comment.author.name}</a>
                  </span>
                )
                : <span className="dsqjs-post-author">{props.comment.author.name}</span>
            }
            {
              // authorEl admin label
              props.admin === props.comment.author.username && (
                <span className="dsqjs-admin-badge">{props.adminLabel}</span>
              )
            }
            {' '}
            <span className="dsqjs-bullet"></span>
            {' '}
            {
              props.comment.createdAt && (
                <span className="dsqjs-meta">
                  <time>{formatDate(props.comment.createdAt)}</time>
                </span>
              )
            }
          </div>
          {
            props.comment.isDeleted
              ? <div className="dsqjs-post-content"><small>此评论已被删除</small></div>
              : <div className="dsqjs-post-content" dangerouslySetInnerHTML={{ __html: processCommentMessage(props.comment.message) }} />
          }
        </div>
      </div>
      <DisqusJSChildrenPostItems {...props} currentNesting={props.nesting} />
      {props.comment.hasMore && <p className="dsqjs-has-more">切换至 <DisqusJSForceDisqusModeButton>完整 Disqus 模式</DisqusJSForceDisqusModeButton> 显示更多回复</p>}
    </li>
  );
}

function DisqusJSChildrenPostItems(props: { children: DisqusJSCommentASTItem[] | null } & { currentNesting?: number } & PassedDownDisqusJSConfig) {
  if (!props.children || props.children.length === 0) return null;

  return (
    <ul className={`dsqjs-post-list ${(props.currentNesting ?? 1) < (props.nestingSetting ?? 4) ? 'dsqjs-children' : ''}`}>
      {props.children.map(comment => (
        <DisqusJSPostItem {...comment} admin={props.admin} adminLabel={props.adminLabel} key={comment.comment.id} />
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

export const DisqusJSCommentsList = ({ comments, admin, adminLabel }: { comments: DisqusAPI.Post[] } & PassedDownDisqusJSConfig) => {
  const processedComments = useMemo(() => {
    const topLevelComments: DisqusAPI.Post[] = [];
    const childComments: DisqusAPI.Post[] = [];

    const rawComments = comments.slice();
    rawComments.map((comment, i) => ({ i, p: comment.parent, d: getTimeStampFromString(comment.createdAt) }))
      .sort((a, b) => (a.p && b.p ? a.d - b.d : 0))
      .map(({ i }) => rawComments[i])
      .forEach(comment => (comment.parent ? childComments : topLevelComments).push(comment));

    return topLevelComments.map(comment => createDisqusJSCommentASTItem(comment, childComments, 0));
  }, [comments]);

  return (
    <ul className="dsqjs-post-list" id="dsqjs-post-container">
      {processedComments.map(comment => (
        <DisqusJSPostItem
          {...comment}
          key={comment.comment.id}
          admin={admin}
          adminLabel={adminLabel}
        />
      ))}
    </ul>
  );
};
