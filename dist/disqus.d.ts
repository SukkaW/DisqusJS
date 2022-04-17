export default DisqusJS;
export type DisqusJSMode = {
    /**
     * - Set which mode to use, should store and get in localStorage
     */
    mode: 'dsqjs' | 'disqus';
    /**
     * - Set which sort type to use, should store and get in localStorage
     */
    sortType: 'popular' | 'asc' | 'desc';
};
export type DisqusJSConfig = {
    /**
     * - The disqus shortname
     */
    shortname: string;
    /**
     * - The Forum Name
     */
    siteName: string;
    /**
     * - The identifier of the page
     */
    identifier: string;
    /**
     * - The title of the page
     */
    title: string;
    /**
     * - The url of the page
     */
    url: string;
    /**
     * - Where to get data
     */
    api: string;
    /**
     * - The apikey used to request Disqus API
     */
    apikey: string;
    /**
     * - The max nesting level of Disqus comment
     */
    nesting: number;
    /**
     * - The msg when there is no comment
     */
    nocomment: string;
    /**
     * - The disqus forum admin username
     */
    admin: string;
    /**
     * - The disqus moderator badge text
     */
    adminLabel: string;
};
export type DisqusJSInfo = {
    /**
     * = The thread id, used at next API call
     */
    id: string;
    /**
     * = The cursor of next page of list
     */
    next: string;
    /**
     * - Whether the comment is closed
     */
    isClosed: boolean;
    /**
     * - How many comment in the thread
     */
    length: number;
    /**
     * - The title of the thread
     */
    title: string;
    /**
     * - The list of comment
     */
    comment: DisqusComment[];
};
export type DisqusComment = {
    createdAt: string;
    parent: any;
};
/**
 * @class DisqusJS
 * @implements {DisqusJSMode}
 */
declare class DisqusJS implements DisqusJSMode {
    /**
     * @param {Partial<DisqusJSConfig>} config
     */
    constructor(config: Partial<DisqusJSConfig>);
    config: {
        api: string;
        identifier: string;
        url: string;
        title: string;
        siteName: string;
        nesting: number;
        nocomment: string;
    } & Partial<DisqusJSConfig>;
    /** @type {Partial<DisqusJSInfo>} */
    page: Partial<DisqusJSInfo>;
    /**
     * @param {string} str
     */
    msg(str: string): void;
    /**
     * @param {RequestInfo} url
     */
    _get(url: RequestInfo): Promise<{
        ok: true;
        status: number;
        data: any;
        headers: Headers;
    }>;
    loadDisqus(): void;
    checkDisqus(): Promise<void>;
    useDsqjs(): void;
    /**
     * useDsqjs() - 强制使用 Disqus
     */
    useDisqus(): void;
    assignClickEventForAskForFulButton(): void;
    loadDsqjs(): void;
    sortType: any;
    /**
     * loadError() - 评论基础模式加载出现错误
     */
    loadError(err: any): void;
    apikey(): any;
    initDsqjs(): void;
    mode: "dsqjs" | "disqus";
}
