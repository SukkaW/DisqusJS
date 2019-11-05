/*
 * The variable used in DisqusJS
 *
 * DisqusJS Mode
 * @param {string} disqusjs.mode = dsqjs | disqus - Set which mode to use, should store and get in localStorage
 * @param {string} disqusjs.sortType = popular | asc(oldest first) | desc(latest first) - Set which sort type to use, should store and get in localStorage
 *
 * DisqusJS Config
 * @param {string} disqusjs.config.shortname - The disqus shortname
 * @param {string} disqusjs.config.siteName - The Forum Name
 * @param {string} disqusjs.config.identifier - The identifier of the page
 * @param {string} disqusjs.config.title - The title of the page
 * @param {string} disqusjs.config.url - The url of the page
 * @param {string} disqusjs.config.api - Where to get data
 * @param {string} disqusjs.config.apikey - The apikey used to request Disqus API
 * @param {string} disqusjs.config.admin - The disqus forum admin username
 * @param {string} disqusjs.config.adminLabel - The disqus moderator badge text
 *
 * DisqusJS Info
 * @param {string} disqusjs.page.id = The thread id, used at next API call
 * @param {string} disqusjs.page.next = The cursor of next page of list
 * @param {boolean} disqusjs.page.isClosed - Whether the comment is closed
 * @param {number} disqusjs.page.length - How many comment in the thread
 */


function DisqusJS(config) {
    // 封装一下基于 Object.asign 的方法
    function _extends(...args) {
        _extends = Object.assign || function (target) {
            for (const source of arguments) {
                for (const key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
            return target;
        }
        return _extends.apply(this, args);
    }

    // Array.isArray 的 Polyfill
    if (!Array.isArray) {
        Array.isArray = (arg) => Object.prototype.toString.call(arg) === '[object Array]';
    }

    ((window, document, localStorage, fetch) => {
        const $$ = (elementID) => document.getElementById(elementID);
        /**
         * msg - 提示信息
         *
         * @param {string} url
         */
        const msg = (str) => {
            const msgEl = $$('dsqjs-msg');
            if (msgEl) msgEl.innerHTML = str;
        }

        /**
         * htmlTpl - DisqusJS 的 HTML 模板片段
         *
         * msg: DisqusJS 提示信息模板
         * footer: 尾部信息模板
         */
        const htmlTpl = {
            msg: `<div id="dsqjs-msg"></div>`,
            /*
            <footer>
                <p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank"></a>&nbsp;&amp;&nbsp;<a href="https://disqusjs.skk.moe" target="_blank">DisqusJS</a>
                </p>
            </footer>
             */
            footer: `<footer><p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank"></a>&nbsp;&amp;&nbsp;<a href="https://disqusjs.skk.moe" target="_blank">DisqusJS</a></p></footer>`,
            /*
            <header class="dsqjs-header" id="dsqjs-header">
                <nav class="dsqjs-nav dsqjs-clearfix">
                    <ul>
                        <li class="dsqjs-nav-tab dsqjs-tab-active"><span>${num} Comments</span></li>
                        <li class="dsqjs-nav-tab">${title}</li>
                    </ul>
                    <div class="dsqjs-order">
                        <input class="dsqjs-order-radio" id="dsqjs-order-desc" type="radio" name="comment-order" value="desc" checked="true">
                        <label class="dsqjs-order-label" for="dsqjs-order-desc" title="按从新到旧">最新</label>
                        <input class="dsqjs-order-radio" id="dsqjs-order-asc" type="radio" name="comment-order" value="asc">
                        <label class="dsqjs-order-label" for="dsqjs-order-asc" title="按从旧到新">最早</label>
                        <input class="dsqjs-order-radio" id="dsqjs-order-popular" type="radio" name="comment-order" value="popular">
                        <label class="dsqjs-order-label" for="dsqjs-order-popular" title="按评分从高到低">最佳</label></div>
                    </nav>
            </header>
            */
            header: (num, title) => `<header class="dsqjs-header" id="dsqjs-header"><nav class="dsqjs-nav dsqjs-clearfix"><ul><li class="dsqjs-nav-tab dsqjs-tab-active"><span>${num} Comments</span></li><li class="dsqjs-nav-tab">${title}</li></ul><div class="dsqjs-order"><input class="dsqjs-order-radio" id="dsqjs-order-desc" type="radio" name="comment-order" value="desc" checked="true"><label class="dsqjs-order-label" for="dsqjs-order-desc" title="按从新到旧">最新</label><input class="dsqjs-order-radio" id="dsqjs-order-asc" type="radio" name="comment-order" value="asc"><label class="dsqjs-order-label" for="dsqjs-order-asc" title="按从旧到新">最早</label><input class="dsqjs-order-radio" id="dsqjs-order-popular" type="radio" name="comment-order" value="popular"><label class="dsqjs-order-label" for="dsqjs-order-popular" title="按评分从高到低">最佳</label></div></nav></header>`,
            /*
            <div class="dsqjs-post-item dsqjs-clearfix">
                <div class="dsqjs-post-avatar">
                    ${s.avatarEl}
                </div>
                <div class="dsqjs-post-body">
                    <div class="dsqjs-post-header">
                        ${authorEl}
                        <span class="dsqjs-meta"><time>${formatDate(s.createdAt)}</time></span>
                    </div>
                    <div class="dsqjs-post-content">
                        ${message}
                    </div>
                </div>
            </div>
            */
            comment: ({ avatarEl, createdAt }, authorEl, message) => `<div class="dsqjs-post-item dsqjs-clearfix"><div class="dsqjs-post-avatar">${avatarEl}</div><div class="dsqjs-post-body"><div class="dsqjs-post-header">${authorEl}<span class="dsqjs-meta"><time>${formatDate(createdAt)}</time></span></div><div class="dsqjs-post-content">${message}</div></div></div>`,
            /*
            如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>
            */
            askForFull: '如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>'
        }

        /**
         * _get(url) - 对 Fetch 的一个封装
         *
         * @param {string} url
         * @return {Object} - 一个 Promise 对象，返回请求结果
         */

        const _get = (url) => fetch(url, { method: 'GET' })
            .then(resp => Promise.all([resp.ok, resp.status, resp.json(), resp.headers])).then(([ok, status, data, headers]) => {
                if (ok) {
                    return {
                        ok,
                        status,
                        data,
                        headers
                    };
                } else {
                    throw new Error;
                }
            }).catch(error => {
                throw error;
            });

        // localstorage 操作类
        // 用于持久化某些数据（如 newComment 的评论者的相关信息）

        /**
         * setLS(kwy, value) - 设置 localStorage
         *
         * @param {string} key
         * @param {string} value
         */
        const setLS = (key, value) => {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
            }
        }

        /**
         * formatDate(date) - 解析 date 为 yyyy-MM-dd hh:mm:ss
         *
         * @param {string} date - 传入评论创建日期（XML 格式）
         * @return {string} - 格式化后的日期
         */
        const formatDate = (date) => {
            // 不足两位补 0
            const x = (input) => (input < 10) ? `0${input}` : input;
            // 将传入的 date 转化为时间戳
            date = Date.parse(new Date(date));

            // Disqus API 返回的是 UTC 时间，所以在时间戳上加 28800000 毫秒补上 8 小时时差
            date = new Date(date + 8 * 60 * 60 * 1000);
            const y = date.getFullYear();
            const m = x(date.getMonth() + 1);
            const d = x(date.getDate());
            const h = x(date.getHours());
            const minute = x(date.getMinutes());
            return `${y}-${m}-${d} ${h}:${minute}`;
        }

        /*
         * loadDisqus() - 加载 Disqus
         */
        function loadDisqus() {
            if (window.DISQUS) {
                window.DISQUS.reset({
                    reload: true,
                    config() {
                        this.page.identifier = disqusjs.config.identifier;
                        this.page.url = disqusjs.config.url;
                        this.page.title = disqusjs.config.title;
                    }
                });
            } else {
                const s = document.createElement('script');

                // 显示提示信息
                // Disqus 加载成功以后会把 #disqus_thread 内的内容全部覆盖
                $$('disqus_thread').innerHTML = `<div id="dsqjs"><section><div id="dsqjs-msg">评论完整模式加载中...如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或切换至 <a id="dsqjs-force-dsqjs" class="dsqjs-msg-btn">评论基础模式</a></div></section>${htmlTpl.footer}</div>`
                $$('dsqjs-force-dsqjs').addEventListener('click', useDsqjs);

                s.src = `https://${disqusjs.config.shortname}.disqus.com/embed.js`;
                s.setAttribute('data-timestamp', +new Date());
                (document.head || document.body).appendChild(s);
            }
        }

        function checkDisqus() {
            $$('disqus_thread').innerHTML = `<div id="dsqjs"><section><div id="dsqjs-msg">正在检查 Disqus 能否访问...</div></section>${htmlTpl.footer}</div>`;

            // 测试 Disqus 的域名
            // *.disquscdn.com 没有被墙所以不做检查
            const domain = ['disqus.com', `${disqusjs.config.shortname}.disqus.com`];

            let test = 0;
            let success = 0;

            const checker = () => {
                // 测试域名数量 ==== 测试次数 === 成功次数
                // 如果 truw 则认定可以 Disqus 可以连通
                if (domain.length === test && test === success) {
                    useDsqjs()
                    // 否则认为 Disqus 无法连通
                } else if (domain.length === test) {
                    useDsqjs()
                }
                // 如果测试域名数量不等于测试次数则说明测试还没有完成，不执行任何操作
            }

            const runcheck = (domain) => {
                const img = new Image;
                // 处理加载超时
                const timeout = setTimeout(() => {
                    img.onerror = img.onload = null;
                    test++;
                    checker()
                }, 3000);

                img.onerror = () => {
                    clearTimeout(timeout);
                    test++;
                    checker()
                }

                img.onload = () => {
                    clearTimeout(timeout);
                    test++;
                    success++;
                    checker()
                }

                img.src = `https://${domain}/favicon.ico?${+(new Date)}`
            }

            for (const i of domain) {
                runcheck(i);
            }
        }

        function loadDsqjs() {
            (() => {
                // DisqusJS 加载中信息
                msg(`评论基础模式加载中。${htmlTpl.askForFull}`)
                $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);

                /*
                 * 获取 Thread 信息
                 * Disqus API 只支持通过 Thread ID 获取评论列表，所以必须先通过 identifier 获取当前页面 Thread ID
                 *
                 * API Docs: https://disqus.com/api/docs/threads/list/
                 * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
                 */
                const url = `${disqusjs.config.api}3.0/threads/list.json?forum=${disqusjs.config.shortname}&thread=ident:${disqusjs.config.identifier}&api_key=${apikey()}`;

                _get(url).then(({ data }) => {
                    if (data.code === 0 && data.response.length === 1) {
                        const resp = data.response[0];
                        disqusjs.page = {
                            id: resp.id,
                            title: resp.title,
                            isClosed: resp.isClosed,
                            length: resp.posts,
                            comment: []
                        };

                        // 在 #disqus_thread 中填充 DisqusJS Container
                        $$('disqus_thread').innerHTML = `<div id="dsqjs"><div id="dsqjs-msg">评论基础模式加载中。${htmlTpl.askForFull}</div>${htmlTpl.header(resp.posts, disqusjs.config.siteName)}<section class="dsqjs-post-container"><ul class="dsqjs-post-list" id="dsqjs-post-container"><p class="dsqjs-no-comment">评论列表加载中...</p></ul><a id="dsqjs-load-more" class="dsqjs-load-more dsqjs-hide">加载更多评论</a></section>${htmlTpl.footer}</div>`;

                        $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                        $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);

                        $$(`dsqjs-order-${disqusjs.sortType}`).setAttribute('checked', 'true');

                        // 获取评论列表
                        getComment()
                    } else if (code === 0 && response.length !== 1) {
                        // 当前页面可能还未初始化（需要创建 thread）
                        // Disqus API 的 threads/create 需要在服务端发起请求，不支持 AJAX Call
                        msg('该 Thread 并没有初始化，是否切换至 <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">完整 Disqus 模式</a> 进行初始化？')
                        $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);
                    } else {
                        throw new Error;
                    }
                }).catch(loadError)

            })()

            /*
             * getComment(cursor) - 获取评论列表
             *
             * @param {string} cursor - 传入 cursor 用于加载下一页的评论
             */
            const getComment = (cursor = '') => {
                const $loadMoreBtn = $$('dsqjs-load-more');
                const $orderRadio = document.getElementsByClassName('dsqjs-order-radio');
                const $loadHideCommentInDisqus = document.getElementsByClassName('dsqjs-has-more-btn');

                const unregisterListener = () => {
                    // 为按钮们取消事件，避免重复绑定
                    // 重新 getComment() 时会重新绑定
                    for (const i of $orderRadio) {
                        i.removeEventListener('change', switchSortType);
                    };
                    $loadMoreBtn.removeEventListener('click', getMoreComment);
                    for (const i of $loadHideCommentInDisqus) {
                        i.removeEventListener('click', checkDisqus);
                    };
                }

                const getMoreComment = () => {
                    unregisterListener();
                    // 加载下一页评论
                    getComment(disqusjs.page.next);
                }

                const getCommentError = () => {
                    if (cursor === '') {
                        loadError();
                    } else {
                        $loadMoreBtn.classList.remove('dsqjs-disabled');
                        // 在按钮上显示提示信息
                        $loadMoreBtn.innerHTML = '加载更多评论失败，点击重试';
                        // 重新在按钮上绑定 加载更多按钮
                        $loadMoreBtn.addEventListener('click', getMoreComment);
                    }
                };

                // 切换排序方式
                const switchSortType = ({ target }) => {
                    // 通过 event.target 获取被选中的按钮
                    disqusjs.sortType = target.getAttribute('value');
                    // 将结果在 localStorage 中持久化
                    setLS('dsqjs_sort', disqusjs.sortType);
                    unregisterListener();

                    // 清空评论列表和其它参数
                    disqusjs.page.comment = [];
                    disqusjs.page.next = ''; // 不然切换排序方式以后以后加载更多评论就会重复加载

                    // 显示加载中提示信息
                    // 反正只有评论基础模式已经加载成功了才会看到排序选项，所以无所谓再提示一次 Disqus 不可访问了
                    $$('dsqjs-post-container').innerHTML = '<p class="dsqjs-no-comment">正在切换排序方式...</p>';
                    // 把 加载更多评论 隐藏起来
                    $loadMoreBtn.classList.add('dsqjs-hide');
                    getComment();
                }

                // 处理传入的 cursor
                const cursorParam = (cursor === '') ? '' : `&cursor=${cursor}`;

                // 在发起请求前禁用 加载更多评论 按钮防止重复调用
                $loadMoreBtn.classList.add('dsqjs-disabled')
                /*
                 * 获取评论列表
                 *
                 * API Docs: https://disqus.com/api/docs/posts/list/
                 * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
                 *
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

                const sortComment = {
                    parseDate: ({ createdAt }) => Date.parse(new Date(createdAt)),
                    parentAsc: (a, b) => {
                        if (a.parent && b.parent) {
                            return sortComment.parseDate(a) - sortComment.parseDate(b);
                        } else {
                            return 0;
                        }
                    }
                };

                const url = `${disqusjs.config.api}3.0/threads/listPostsThreaded?forum=${disqusjs.config.shortname}&thread=${disqusjs.page.id}${cursorParam}&api_key=${apikey()}&order=${disqusjs.sortType}`;

                _get(url).then(({ data }) => {
                    if (data.code === 0 && data.response.length > 0) {
                        // 解禁 加载更多评论
                        $loadMoreBtn.classList.remove('dsqjs-disabled');

                        // 将获得的评论数据和当前页面已有的评论数据合并
                        disqusjs.page.comment.push(...data.response)

                        // 将所有的子评论进行降序排列
                        disqusjs.page.comment.sort(sortComment.parentAsc);

                        // 用当前页面的所有评论数据进行渲染
                        renderComment(disqusjs.page.comment);

                        // 为排序按钮们委托事件
                        for (const i of $orderRadio) {
                            i.addEventListener('change', switchSortType);
                        }

                        for (const i of $loadHideCommentInDisqus) {
                            i.addEventListener('click', checkDisqus);
                        };

                        if (data.cursor.hasNext) {
                            // 将 cursor.next 存入 disqusjs 变量中供不能传参的不匿名函数使用
                            disqusjs.page.next = data.cursor.next;
                            // 确保 加载更多评论按钮 文字正常
                            $loadMoreBtn.innerHTML = '加载更多评论'
                            // 显示 加载更多评论 按钮
                            $loadMoreBtn.classList.remove('dsqjs-hide');
                            $loadMoreBtn.addEventListener('click', getMoreComment);
                        } else {
                            // 没有更多评论了，确保按钮隐藏
                            $loadMoreBtn.classList.add('dsqjs-hide');
                        }
                    } else if (data.code === 0 && data.response.length === 0) {
                        // 当前没有评论，显示提示信息
                        msg(`你可能无法访问 Disqus，已启用评论基础模式。${htmlTpl.askForFull}`)
                        $$('dsqjs-post-container').innerHTML = '<p class="dsqjs-no-comment" >这里冷冷清清的，一条评论都没有</p>'
                        $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                        $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);
                    } else {
                        throw new Error;
                    }
                }).catch(getCommentError)
            }

            /*
             * parseCommentData(data) - 解析评论列表
             *
             * @param {Array} data - 评论列表 JSON
             * @return {Array} - 解析后的评论列表数据
             */
            const parseCommentData = (data) => {
                let topLevelComments = [];
                let childComments = [];

                let commentJSON = (comment) => ({
                    comment,
                    author: comment.author.name,

                    // 如果不设置 admin 会返回 undefined，所以需要嘴一个判断
                    isPrimary: (disqusjs.config.admin ? (comment.author.username === disqusjs.config.admin) : false),

                    children: getChildren(+comment.id),

                    /*
                     * Disqus 改变了 Private API 的行为
                     * https://github.com/fooleap/disqus-php-api/issues/44
                     * 默认隐藏更多的评论，通过 hasMore 字段判断
                     */
                    // 将 hasMore 字段提升到上层字段中
                    hasMore: comment.hasMore
                });

                const getChildren = (id) => {
                    // 如果没有子评论，就不需要解析子评论了
                    if (childComments.length === 0) {
                        return null;
                    }

                    const list = [];
                    for (const comment of childComments) {
                        if (comment.parent === id) {
                            list.unshift(commentJSON(comment));
                        }
                    }

                    return (list.length) ? list : null
                }

                data.forEach((comment) => {
                    // 如果没有 comment.parent 说明是第一级评论
                    const c = comment.parent ? childComments : topLevelComments;
                    c.push(comment);
                });
                return topLevelComments.map(comment => commentJSON(comment));
            }

            /*
             * renderCommentData(data) - 渲染评论列表
             *
             * @param {Array} data - 从 getComment() 获取到的 JSON
             */
            const renderComment = (data) => {
                /*
                 * processData(data) - 处理评论列表
                 *
                 * @param {Array} data - 解析后的评论列表 JSON
                 */
                const processData = (data) => {
                    // 处理 Disqus Profile URL
                    if (data.comment.author.profileUrl) {
                        /*
                        Avatar Element
                        <a href="${data.comment.author.profileUrl}">
                            <img src="${data.comment.author.avatar.cache}">
                        </a>
                        Author Element
                        <span class="dsqjs-post-author">
                            <a href="${data.comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">${data.comment.author.name}</a>
                        </span>
                        */
                        data.comment.avatarEl = `<a href="${data.comment.author.profileUrl}"><img src="${data.comment.author.avatar.cache}"></a>`
                        data.comment.authorEl = `<span class="dsqjs-post-author"><a href="${data.comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">${data.comment.author.name}</a></span>`
                    } else {
                        data.comment.avatarEl = `<img src="${data.comment.author.avatar.cache}">`
                        data.comment.authorEl = `<span class="dsqjs-post-author">${data.comment.author.name}</span>`
                    }

                    // 处理 Admin Label
                    // 需要同时设置 isPrimary 和 adminLabel；admin 已经在 processData() 中做过判断了
                    if (disqusjs.config.adminLabel && data.isPrimary) {
                        data.comment.authorEl += `<span class="dsqjs-admin-badge">${disqusjs.config.adminLabel}</span>`;
                    }

                    return data;
                }

                /*
                 * removeDisqUs(msg) - 将 comment 中的短链接 disq.us 去除
                 * @param {string} msg - 评论信息
                 * @return {string} msg - 经过处理的评论信息
                 */
                const removeDisqUs = (msg) => {
                    const el = document.createElement('div');
                    el.innerHTML = msg;
                    const aTag = div.getElementsByTagName('a');
                    for (const i of aTag) {
                        const link = decodeURIComponent(a.href.replace(/https:\/\/disq.us\/url\?url=/g, '')).replace(/(.*):.+cuid=.*/, '$1');

                        i.href = link;
                        i.innerHTML = link;
                        i.rel = 'external noopener nofollow noreferrer';
                        i.target = '_blank';
                    }

                    return el.innerHTML;
                }

                const renderPostItem = (s) => {
                    let authorEl = '';
                    let message = '';
                    if (s.isDeleted) {
                        message = `<small>此评论已被删除</small>`;
                    } else {
                        authorEl = `${s.authorEl}<span class="dsqjs-bullet"></span>`;
                        message = removeDisqUs(s.message);
                    }

                    return htmlTpl.comment(s, authorEl, message)
                }

                const childrenComments = (data) => {
                    const nesting = data.nesting;
                    const children = (data.children || []);

                    if (!children) {
                        return;
                    }

                    let html = '';
                    // 如果当前评论嵌套数大于 4 则不再右移
                    if (nesting < disqusjs.config.nesting) {
                        html = '<ul class="dsqjs-post-list dsqjs-children">';
                    } else {
                        html = '<ul class="dsqjs-post-list">';
                    }


                    children.map((comment) => {
                        comment = processData(comment);
                        comment.nesting = nesting + 1;

                        // 处理可能存在的隐藏回复
                        let hasMoreEl = '';
                        if (comment.hasMore) {
                            hasMoreEl = `<p class="dsqjs-has-more">切换至 <a class="dsqjs-has-more-btn" id="load-more-${comment.comment.id}" data-more-id="comment-${comment.comment.id}">完整 Disqus 模式</a> 显示更多回复</p>`
                        }

                        html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(comment.comment)}${childrenComments(comment)}${hasMoreEl}</li>`;
                    });

                    html += '</ul>';

                    if (html.length !== 0) {
                        return html;
                    } else {
                        return;
                    }
                }

                let html = '';

                parseCommentData(data).map((comment) => {
                    // 如果有子评论，设置当前评论前套数为 1
                    if (comment.children) {
                        comment.nesting = 1;
                    }
                    comment = processData(comment);

                    // 处理可能存在的隐藏回复
                    let hasMoreEl = '';
                    if (comment.hasMore) {
                        hasMoreEl = `<p class="dsqjs-has-more">切换至 <a id="load-more-${comment.comment.id}">完整 Disqus 模式</a> 显示更多回复</p>`
                    }

                    html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(comment.comment)}${childrenComments(comment)}${hasMoreEl}</li>`;
                });


                // 增加提示信息
                msg(`你可能无法访问 Disqus，已启用评论基础模式。${htmlTpl.askForFull}`)

                $$('dsqjs-post-container').innerHTML = html;

                // 为 checkDisqus 和 useDsqjs 按钮添加事件
                $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);
            }
        }

        /*
         * loadError() - 评论基础模式加载出现错误
         */
        function loadError() {
            msg('评论基础模式加载失败，是否 <a id="dsqjs-reload-dsqjs" class="dsqjs-msg-btn">重载</a> 或 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> ？')
            $$('dsqjs-reload-dsqjs').addEventListener('click', loadDsqjs);
            $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
        }

        /*
         * useDsqjs() - 强制使用 DisqusJS
         * useDsqjs() - 强制使用 Disqus
         */
        function useDsqjs() {
            setLS('dsqjs_mode', 'dsqjs')
            loadDsqjs()
        }

        function useDsqjs() {
            setLS('dsqjs_mode', 'disqus')
            loadDisqus()
        }

        let disqusjs = {};

        disqusjs.config = _extends({
            api: 'https://disqus.skk.moe/disqus/',
            identifier: document.location.origin + document.location.pathname + document.location.search,
            url: document.location.origin + document.location.pathname + document.location.search,
            title: document.title,
            siteName: '',
            nesting: parseInt(config.nesting) || 4
        }, config);

        // 定义 disqusjs.page，之后会填充 thread id、title 等数据
        disqusjs.page = [];

        // 通过 用户配置的 apikey 来判断是否需要使用随机取值
        const apikey = () => (Array.isArray(disqusjs.config.apikey)) ? disqusjs.config.apikey[Math.floor(Math.random() * disqusjs.config.apikey.length)] : disqusjs.config.apikey;

        /*
         * window.disqus_config - 从 disqusjs.config 获取 Disqus 所需的配置
         */
        window.disqus_config = function () {
            this.page.url = disqusjs.config.url;
            this.page.identifier = disqusjs.config.identifier;
            this.page.title = disqusjs.config.title;
        };

        // 填充 DisqusJS 的 Container
        $$('disqus_thread').innerHTML = `<div id="dsqjs">${htmlTpl.msg}${htmlTpl.footer}</div>`

        function initDsqjs() {
            disqusjs.mode = localStorage.getItem('dsqjs_mode');
            disqusjs.sortType = localStorage.getItem('dsqjs_sort') || localStorage.getItem('disqus.sort');

            if (!disqusjs.sortType) {
                setLS('dsqjs_sort', 'desc');
                disqusjs.sortType = 'desc';
            }
            if (disqusjs.mode === 'disqus') {
                loadDisqus();
            } else if (disqusjs.mode === 'dsqjs') {
                loadDsqjs();
            } else {
                // 没有在 localStorage 中找到 disqusjs_mode 相关内容，开始检查访客的 Disqus 可用性
                // 也作为不支持 localStorage 的浏览器的 fallback
                checkDisqus();
            }
        }

        // 引入 Fetch 以后，一堆浏览器将不再被支持，所以加个判断，劝退一些浏览器
        if (!fetch || !localStorage) {
            msg(`你的浏览器版本过低，不兼容评论基础模式。${htmlTpl.askForFull}`);

            $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
            $$('dsqjs-force-disqus').addEventListener('click', useDsqjs);
        } else {
            initDsqjs();
        }
    })(window, document, localStorage, fetch);
}

// CommonJS 模块
try { module.exports = DisqusJS; } catch (e) { }
