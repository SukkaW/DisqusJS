/*
 * The variable used in DisqusJS
 *
 * DisqusJS Mode
 * @param {string} disqusjs.mode = dsqjs | disqus - Set which mode to use, should store and get in localStorage
 *
 * DisqusJS Config
 * @param {string} disqusjs.config.shortname - The disqus shortname
 * @param {string} disqusjs.config.siteName - The Forum Name
 * @param {string} disqusjs.config.identifier - The identifier of the page
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


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define('DisqusJS', [], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root as window)
        root.DisqusJS = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function DisqusJS(config) {

        const d = document,
            $$ = (elementID) => d.getElementById(elementID);

        /**
         * get - 封装 XHR GET
         *
         * @param {string} url
         * @param {string} timeout
         * @param {boolean} async
         * @param {function} success
         * @param {function} error
         *
         * Example:
            get({
                'http://localhost:3000/getData',
                4000,
                true,
                (res) => {
                    console.log(res)
                },
                () => {}
            })
         */
        const get = (url, success, error) => {
            let xhr = new XMLHttpRequest()
            xhr.open('GET', encodeURI(url), true);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    let res = JSON.parse(xhr.responseText)
                    success(res)
                } else {
                    loadError();
                }
            }
            xhr.timeout = 4500;
            xhr.ontimeout = (e) => {
                error(e);
            };
            xhr.onerror = (e) => {
                error(e);
            };
            xhr.send();
        }

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
            // 将传入的 date 转化为时间戳
            date = Date.parse(new Date(date));

            // Disqus API 返回的是 UTC 时间，所以在时间戳上加 28800000 毫秒补上 8 小时时差
            date = new Date(date + 8 * 60 * 60 * 1000);
            let y = date.getFullYear();
            let m = date.getMonth() + 1;
            // 如果不足两位则补 0
            m = m < 10 ? `0${m}` : m;
            let d = date.getDate();
            d = d < 10 ? `0${d}` : d;
            let h = date.getHours();
            h = h < 10 ? `0${h}` : h;
            let minute = date.getMinutes();
            minute = minute < 10 ? (`0${minute}`) : minute;

            return `${y}-${m}-${d} ${h}:${minute}`;
        }

        // 封装一个 Array.isArray 方法以兼容老旧浏览器
        // 应该不会有人重写了 Array.isArray 方法的，也不会有人改变 Object 的原型链上的 toString 方法
        // 如果有的话，还是直接劝退吧
        if (!Array.isArray) {
            Array.isArray = (arg) => Object.prototype.toString.call(arg) === '[object Array]';
        }

        /*
         * loadDisqus() - 加载 Disqus
         */
        function loadDisqus() {
            let s = d.createElement('script');

            // 显示提示信息
            // Disqus 加载成功以后会把 #disqus_thread 内的内容全部覆盖
            $$('disqus_thread').innerHTML = '<div id="dsqjs"><section><div id="dsqjs-msg">评论完整模式加载中...如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或使用 <a id="dsqjs-force-dsqjs" class="dsqjs-msg-btn">评论基础模式</a></div></section><footer><p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank"></a>&nbsp;&amp;&nbsp;<a href="https://github.com/SukkaW/DisqusJS" target="_blank">DisqusJS</a></p></footer>'
            $$('dsqjs-force-dsqjs').addEventListener('click', forceDsqjs);

            s.src = `https://${disqusjs.config.shortname}.disqus.com/embed.js`;
            s.setAttribute('data-timestamp', + new Date());
            (d.head || d.body).appendChild(s);
        }

        function checkDisqus() {
            $$('disqus_thread').innerHTML = `<div id="dsqjs"><section><div id="dsqjs-msg">正在检查 Disqus 能否访问...</div></section><footer><p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank"></a>&nbsp;&amp;&nbsp;<a href="https://github.com/SukkaW/DisqusJS" target="_blank">DisqusJS</a></p></footer></div>`;

            // 测试 Disqus 的域名
            // *.disquscdn.com 没有被墙所以不做检查
            let domain = ['disqus.com', `${disqusjs.config.shortname}.disqus.com`],
                test = 0,
                success = 0;

            let checker = () => {
                // 测试域名数量 ==== 测试次数 === 成功次数
                // 如果 truw 则认定可以 Disqus 可以连通
                if (domain.length === test && test === success) {
                    forceDisqus()
                    // 否则认为 Disqus 无法连通
                } else if (domain.length === test) {
                    forceDsqjs()
                }
                // 如果测试域名数量不等于测试次数则说明测试还没有完成，不执行任何操作
            }

            let runcheck = (domain) => {
                let img = new Image;
                // 处理加载超时
                let timeout = setTimeout(() => {
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

            for (let i of domain) {
                runcheck(i);
            }
        }

        function loadDsqjs() {
            (() => {
                // 在 #disqus_thread 中填充 DisqusJS Container

                $$('disqus_thread').innerHTML = `
            <div id="dsqjs">
                <section>
                     <div id="dsqjs-msg"></div>
                </section>
                <header class="dsqjs-header dsqjs-hide" id="dsqjs-header">
                    <nav class="dsqjs-nav dsqjs-clearfix">
                        <ul>
                            <li class="dsqjs-nav-tab dsqjs-tab-active">
                                <span><span id="dsqjs-comment-num"></span> Comments</span>
                            </li>
                            <li class="dsqjs-nav-tab">
                                <span id="dsqjs-site-name"></span>
                            </li>
                        </ul>
                        <div class="dsqjs-order">
                        <input class="dsqjs-order-radio" id="dsqjs-order-popular" type="radio" name="comment-order" value="popular">
                        <label class="dsqjs-order-label" for="dsqjs-order-popular" title="按评分高低排序">最佳</label>
                        <input class="dsqjs-order-radio" id="dsqjs-order-desc" type="radio" name="comment-order" value="desc">
                        <label class="dsqjs-order-label" for="dsqjs-order-desc" title="按从新到旧排序">最新</label>
                        <input class="dsqjs-order-radio" id="dsqjs-order-asc" type="radio" name="comment-order" value="asc">
                        <label class="dsqjs-order-label" for="dsqjs-order-asc" title="按从旧到新排序">最早</label>
                    </div>
                    </nav>
                </header>
                <section class="dsqjs-post-container">
                    <ul class="dsqjs-post-list" id="dsqjs-post-container"></ul>
                    <a id="dsqjs-load-more" class="dsqjs-load-more dsqjs-hide">加载更多评论</a>
                </section>
                <footer>
                    <p class="dsqjs-footer">
                        Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank"></a>&nbsp;&amp;&nbsp;<a href="https://github.com/SukkaW/DisqusJS" target="_blank">DisqusJS</a>
                    </p>
                </footer>
                </div>`;
                // DisqusJS 加载中信息
                $$('dsqjs-msg').innerHTML = `评论基础模式加载中。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>。`
                $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                $$('dsqjs-force-disqus').addEventListener('click', forceDisqus);

                /*
                 * 获取 Thread 信息
                 * Disqus API 只支持通过 Thread ID 获取评论列表，所以必须先通过 identifier 获取当前页面 Thread ID
                 *
                 * API Docs: https://disqus.com/api/docs/threads/list/
                 * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
                 */
                let url = `${disqusjs.config.api}3.0/threads/list.json?forum=${disqusjs.config.shortname}&thread=ident:${disqusjs.config.identifier}&api_key=${apikey()}`;

                get(url, (res) => {

                    // 如果只返回一条则找到了对应 thread，否则是当前 identifier 不能找到唯一的 thread
                    // 如果 thread 不唯一则需要进行初始化
                    if (res.code === 0 && res.response.length === 1) {
                        let resp = res.response[0];
                        disqusjs.page = {
                            id: resp.id,
                            title: resp.title,
                            isClosed: resp.isClosed,
                            length: resp.posts,
                            comment: []
                        };

                        // 填充站点名称和评论数目
                        $$('dsqjs-comment-num').innerHTML = disqusjs.page.length

                        if (disqusjs.config.siteName) {
                            $$('dsqjs-site-name').innerHTML = disqusjs.config.siteName
                        }

                        // 获取评论列表
                        getComment()
                    } else if (res.code === 0 && res.response.length !== 1) {
                        // 当前页面可能还未初始化（需要创建 thread）
                        // Disqus API 的 threads/create 需要在服务端发起请求，不支持 AJAX Call
                        $$('dsqjs-msg').innerHTML = `该 Thread 并没有初始化，是否 <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">切换到完整 Disqus 模式</a> 进行初始化？`
                        $$('dsqjs-force-disqus').addEventListener('click', forceDisqus);
                    } else {
                        // 评论列表加载错误
                        loadError()
                    }
                }, (e) => {
                    // 评论列表加载错误
                    loadError()
                })
            })()

            /*
             * getComment(cursor) - 获取评论列表
             *
             * @param {string} cursor - 传入 cursor 用于加载下一页的评论
             */
            let getComment = (cursor) => {
                let $loadMoreBtn = $$('dsqjs-load-more');

                let getMoreComment = () => {
                    // 执行完以后去除当前监听器避免重复调用
                    $loadMoreBtn.removeEventListener('click', getMoreComment);
                    // 加载下一页评论
                    getComment(disqusjs.page.next);
                }

                let getCommentError = () => {
                    if (!cursor) {
                        loadError();
                    } else {
                        $loadMoreBtn.classList.remove('dsqjs-disabled');
                        // 在按钮上显示提示信息
                        $loadMoreBtn.innerHTML = '加载更多评论失败，点击重试';
                        // 重新在按钮上绑定 加载更多按钮
                        $loadMoreBtn.addEventListener('click', getMoreComment);
                    }
                };

                // 处理传入的 cursor
                cursor = (!cursor) ? '' : `&cursor=${cursor}`;

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
                 *   - desc   （升序）
                 *   - asc    （降序）
                 *   - popular（最热）
                 * 这个 API 的问题在于被嵌套的评论总是降序，看起来很不习惯
                 *
                 * 只获取一次使用 popular 排序的评论，之后在本地进行排序：
                 *   1. 将存在 parent 的使用 createdAt 进行升序并存放在 disqusjs.comment.popular
                 *   2. 将全部评论再进行升序排序，存放在 disqusjs.comment.desc
                 *   3. 将没有 parent 的条目进行升序排列存放在 disqusjs.comment.asc
                 * 每次加载翻页评论的时候 concat 并进行重排序
                 * 用户切换排序方式的时候直接取出进行重新渲染
                 */

                let sortComment = {
                    parseDate: (item) => Date.parse(new Date(item.createdAt)),
                    descHelper: (a, b) => sortComment.parseDate(b) - sortComment.parseDate(a),
                    ascHelper: (a, b) => sortComment.parseDate(a) - sortComment.parseDate(b),

                    popular: (comment) => {
                        let sortParentAsc = (a, b) => {
                            if (a.parent && b.parent) {
                                return sortComment.descHelper(a, b)
                            } else {
                                return null;
                            }
                        }

                        return comment.sort(sortParentAsc);
                    }
                };

                let url = `${disqusjs.config.api}3.0/threads/listPostsThreaded?forum=${disqusjs.config.shortname}&thread=${disqusjs.page.id}${cursor}&api_key=${apikey()}&order=popular`;
                get(url, (res) => {
                    if (res.code === 0 && res.response.length > 0) {
                        // 解禁 加载更多评论
                        $loadMoreBtn.classList.remove('dsqjs-disabled');

                        // 将获得的评论数据和当前页面已有的评论数据合并
                        disqusjs.page.comment = disqusjs.page.comment.concat(res.response);

                        console.log(sortComment.popular(disqusjs.page.comment));
                        // 用当前页面的所有评论数据进行渲染
                        renderComment(disqusjs.page.comment)


                        if (res.cursor.hasNext) {
                            // 将 cursor.next 存入 disqusjs 变量中供不能传参的不匿名函数使用
                            disqusjs.page.next = res.cursor.next;
                            // 确保 加载更多评论按钮 文字正常
                            $loadMoreBtn.innerHTML = '加载更多评论'
                            // 显示 加载更多评论 按钮
                            $loadMoreBtn.classList.remove('dsqjs-hide');
                            $loadMoreBtn.addEventListener('click', getMoreComment);
                        } else {
                            // 没有更多评论了，确保按钮隐藏
                            $loadMoreBtn.classList.add('dsqjs-hide');
                        }
                    } else if (res.code === 0 && res.response.length === 0) {
                        // 当前没有评论，显示提示信息
                        $$('dsqjs-msg').innerHTML = '你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>。'
                        $$('dsqjs-header').classList.remove('dsqjs-hide')
                        $$('dsqjs-post-container').innerHTML = '<div class="dsqjs-no-comment">这里冷冷清清的，一条评论都没有</div>'
                        $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                        $$('dsqjs-force-disqus').addEventListener('click', forceDisqus);
                    } else {
                        // DisqusJS 加载错误
                        getCommentError()
                    }
                }, (e) => {
                    // 评论列表加载错误
                    getCommentError()
                })
            }

            /*
             * parseCommentData(data) - 解析评论列表
             *
             * @param {Array} data - 评论列表 JSON
             * @return {Array} - 解析后的评论列表数据
             */
            let parseCommentData = (data) => {
                let topLevelComments = [],
                    childComments = [],
                    commentJSON = (comment) => {
                        return {
                            comment,
                            author: comment.author.name,
                            // 如果不设置 admin 会返回 undefined，所以需要嘴一个判断
                            isPrimary: (disqusjs.config.admin ? (comment.author.username === disqusjs.config.admin) : false),
                            children: getChildren(+comment.id)
                        }
                    };

                let getChildren = (id) => {
                    // 如果没有子评论，就不需要解析子评论了
                    if (childComments.length === 0) {
                        return null;
                    }

                    var list = [];
                    for (let comment of childComments) {
                        if (comment.parent === id) {
                            list.unshift(commentJSON(comment));
                        }
                    }

                    return (list.length) ? list : null
                }

                data.forEach((comment) => {
                    // 如果没有 comment.parent 说明是第一级评论
                    (comment.parent ? childComments : topLevelComments)['push'](comment);
                });

                let commentLists = topLevelComments.map((comment) => {
                    return commentJSON(comment);
                });

                return commentLists;
            }

            /*
             * renderCommentData(data) - 渲染评论列表
             *
             * @param {Array} data - 从 getComment() 获取到的 JSON
             */
            let renderComment = (data) => {
                /*
                 * processData(data) - 处理评论列表
                 *
                 * @param {Array} data - 解析后的评论列表 JSON
                 */
                let processData = (data) => {
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
                let removeDisqUs = (msg) => {
                    // aMatcher - 只处理 Disqus 短链接
                    let aMatcher = new RegExp(/<a(.*?)href="https:\/\/disq\.us(.+?)"(.+?)>(.+?)<\/a>/gi),
                        hrefMatcher = new RegExp(/href=\"(.+?)\"/gi)
                    let link = (msg.match(aMatcher) || []);
                    link.map((olink) => {
                        // (.*) 是贪婪处理，会一致匹配到最后，可以用于匹配最后一次
                        let link = olink.match(hrefMatcher)[0].replace(/href=\"https:\/\/disq.us\/url\?url=/g, '').replace(/(.*)"/, '$1');
                        link = decodeURIComponent(link);
                        link = link.replace(/(.*):(.*)cuid=(.*)/, '$1')
                        msg = msg.replace(olink, `<a href="${link}" rel="nofollow noopener noreferrer">${link}</a>`)
                    })

                    // 在最后添加 target="_blank" 可以生效到全局链接（包括 Disqus CDN 直链）
                    msg = msg.replace(/href=/g, `target="_blank" href=`)
                    return msg
                }

                let renderPostItem = (s) => {
                    let authorEl = ``,
                        message = ``;
                    if (s.isDeleted) {
                        message = `<small>此评论已被删除</small>`;
                    } else {
                        authorEl = `${s.authorEl}<span class="dsqjs-bullet"></span>`;
                        message = s.message;
                    }
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
                    var html = `<div class="dsqjs-post-item dsqjs-clearfix"><div class="dsqjs-post-avatar">${s.avatarEl}</div><div class="dsqjs-post-body"><div class="dsqjs-post-header">${authorEl}<span class="dsqjs-meta"><time>${formatDate(s.createdAt)}</time></span></div><div class="dsqjs-post-content">${removeDisqUs(message)}</div></div></div>`

                    return html;
                }

                let childrenComments = (data) => {
                    let nesting = data.nesting,
                        children = (data.children || []);

                    if (!children) {
                        return;
                    }

                    let html = (() => {
                        // 如果当前评论嵌套数大于 4 则不再右移
                        if (nesting < 4) {
                            return '<ul class="dsqjs-post-list dsqjs-children">';
                        } else {
                            return '<ul class="dsqjs-post-list">';
                        }
                    })();

                    children.map((comment) => {
                        comment = processData(comment);
                        comment.nesting = nesting + 1;
                        html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(comment.comment)}${childrenComments(comment)}</li>`;
                    });

                    html += '</ul>';

                    if (html.length !== 0) {
                        return html;
                    } else {
                        return;
                    }
                }

                var html = ''

                data = parseCommentData(data);

                data.map((comment) => {
                    // 如果有子评论，设置当前评论前套数为 1
                    if (comment.children) {
                        comment.nesting = 1;
                    }
                    comment = processData(comment);
                    html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(comment.comment)}${childrenComments(comment)}</li>`;
                });


                $$('dsqjs-header').classList.remove('dsqjs-hide')
                // 增加提示信息
                $$('dsqjs-msg').innerHTML = '你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>。'

                $$('dsqjs-post-container').innerHTML = html;

                $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
                $$('dsqjs-force-disqus').addEventListener('click', forceDisqus);
            }
        }

        /*
         * loadError() - 评论基础模式加载出现错误
         */
        function loadError() {

            $$('dsqjs-msg').innerHTML = '评论基础模式加载失败，是否 <a id="dsqjs-reload-dsqjs" class="dsqjs-msg-btn">重载</a> 或 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> ？'
            $$('dsqjs-reload-dsqjs').addEventListener('click', loadDsqjs);
            $$('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
        }

        /*
         * forceDsqjs() - 强制使用 DisqusJS
         * forceDisqus() - 强制使用 Disqus
         */
        function forceDsqjs() {
            setLS('dsqjs_mode', 'dsqjs')
            loadDsqjs()
        }

        function forceDisqus() {
            setLS('dsqjs_mode', 'disqus')
            loadDisqus()
        }

        let disqusjs = [];

        // 将传入的 config 参数赋给 disqusjs.config
        disqusjs.config = config;
        // 使用 https://disqus.skk.moe/disqus/ 作为备选反代服务器
        disqusjs.config.api = (disqusjs.config.api || 'https://disqus.skk.moe/disqus/');
        // 使用 d.location.origin + d.location.pathname + d.location.search 为默认 URL 和 identifier
        // Google Analytics Measurement Protocol 也使用这个参数作为 URL
        disqusjs.config.identifier = (disqusjs.config.identifier || d.location.origin + d.location.pathname + d.location.search);
        disqusjs.config.url = (disqusjs.config.url || d.location.origin + d.location.pathname + d.location.search);

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
        };


        disqusjs.mode = localStorage.getItem('dsqjs_mode');

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

    return DisqusJS
}));
