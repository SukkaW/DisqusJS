export interface DisqusJSConfig {
  shortname: string,
  siteName?: string,
  identifier?: string,
  url: string,
  title?: string,
  api?: string,
  apikey: string | string[],
  nesting?: number,
  nocomment?: string,
  admin?: string,
  adminLabel?: string
}

export interface DisqusConfig {
  shortname: string,
  identifier?: string,
  url: string
  title?: string
}

export type DisqusJsMode = 'dsqjs' | 'disqus' | null;
export type DisqusJsSortType = 'popular' | 'asc' | 'desc' | null;

export namespace DisqusAPI {
  export interface Cursor {
    prev: null | string,
    hasNext: boolean,
    next: null | string
    total: null | number,
    id: string,
    more: boolean
  }

  export interface Response {
    code: number,
    cursor: Cursor
  }

  export interface Thread extends Response {
    response: {
      id: string,
      isClosed: boolean,
      posts: number,
      likes: number
    }[]
  }

  export interface Post {
    author: {
      name: string,
      avatar: {
        cache: string
        permalink: string
      },
      profileUrl: string,
      username: string
    },
    id: string,
    parent: number | null,
    createdAt: string, // UTC
    depth: number,
    hasMore: boolean,
    isDeleted: boolean,
    isEdited: boolean,
    message: string,
    thread: number
  }

  export interface Posts extends Response {
    response: Post[]
  }
}
