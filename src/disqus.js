/*
 * DisqusJS | v0.1.4
 * Author: SukkaW
 * Link: https://github.com/SukkaW/DisqusJS
 * License: GPL-3.0
 */

/*
 * The variable used in DisqusJS
 *
 * DisqusJS Mode
 * disqusjs.mode = dsqjs | disqus - Set which mode to use, should store and get in localStorage
 *
 * DisqusJS Config
 * disqusjs.config.shortname - The disqus shortname
 * disqusjs.config.identifier - The identifier of the page
 * disqusjs.config.url - The url of the page
 * disqusjs.config.api - Where to get data
 * disqusjs.config.apikey - The apikey used to request Disqus API
 * disqusjs.config.admin - The disqus forum admin username
 * disqusjs.config.adminLabel - The disqus moderator badge text
 *
 * DisqusJS Info
 * disqusjs.page.id = The thread id, used at next API call
 * disqusjs.page.title - The thread title
 * disqusjs.page.isClosed - Whether the comment is closed
 * disqusjs.page.lenfth - How many comment in this thread
 */

(() => {
    // 定义 disqusjs.page，之后会填充 thread id、title 等数据
    disqusjs.page = [];

    // 从 disqusjs.config 获取 Disqus 所需的配置
    window.disqus_config = function () {
        this.page.url = disqusjs.config.url;
        this.page.identifier = disqusjs.config.identifier;
    };

    // 定义 xhr
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = (e) => {
        // Have error when get comments.
        loadError();
    };
    xhr.onerror = (e) => {
        // Have error when get comments.
        loadError();
    };

    // localstorage 操作类
    // 用于持久化某些数据（如 newComment 的评论者的相关信息）

    /*
     * Name: setLS(kwy, value) getLS(key)
     * Description: Encapsulation of writing localStorage
     */
    function setLS(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (o) {
            console.log("Failed to set localStorage item");
        }
    }
    /*
     * Name: setLS(kwy, value) getLS(key)
     * Description: Encapsulation of reading localStorage item
     */
    function getLS(key) {
        return localStorage.getItem(key);
    }

    /*
     * Name: dateFormat
     * Description: Transoform Date object from XML format to human readable format
     */
    function dateFormat(date) {
        return `${date.getUTCFullYear().toString()}/${(date.getUTCMonth() + 1).toString()}/${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
        //yyyy-MM-dd hh:mm:ss
    }

    /*
     * Name: loadDisqus()
     * Descriptin: load disqus as it should be. And show the button for switching to DisqusJS mode.
     */

    function loadDisqus() {
        var d = document;
        d.getElementById('dsqjs-load-disqus').classList.remove('dsqjs-hide');
        d.getElementById('dsqjs-force-dsqjs').addEventListener('click', forceDsqjs);
        var s = d.createElement('script');
        s.src = 'https://' + disqusjs.config.shortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', + new Date());
        (d.head || d.body).appendChild(s);
    }

    /*
     * Name: checkDisqus()
     * Description: Check disqus is avaliable for visitor or not
     */

    // 工作原理：检查 disqus.com 和 ${disqusjs.config.shortname}.disqus.com 下的 favicon 能否正常加载

    function checkDisqus() {
        var img = new Image;
        let check1 = setTimeout(() => {
            img.onerror = img.onload = null;
            setLS('disqusjs_mode', 'dsqjs');
        }, 2000);

        img.onerror = () => {
            clearTimeout(check1);
            setLS('disqusjs_mode', 'dsqjs');
            main();
        };
        img.onload = () => {
            clearTimeout(check1);
            let check2 = setTimeout(() => {
                img.onerror = img.onload = null;
                setLS('disqusjs_mode', 'dsqjs');
            }, 2000);

            img.onerror = () => {
                clearTimeout(check2);
                setLS('disqusjs_mode', 'dsqjs');
                main();
            };

            img.onload = () => {
                clearTimeout(check2);
                setLS('disqusjs_mode', 'disqus');
                main();
            };

            img.src = `https://${disqusjs.config.shortname}.disqus.com/favicon.ico?${+(new Date)}`;
        };

        img.src = `https://disqus.com/favicon.ico?${+(new Date)}`;
    }

    /*
     * Name: forceDsqjs() forceDisqus()
     * Description: Switch to DisqusJS/DISQUDS Mode
     * How it works: Change mode in localStorage then run main() to run recheck.
     */

    function forceDsqjs() {
        setLS('disqusjs_mode', 'dsqjs');
        main();
    }
    function forceDisqus() {
        setLS('disqusjs_mode', 'disqus');
        main();
    }

    /*
     * Name: getThreadInfo()
     * Description: Disqus API only support get thread list by ID, not identifter. So get Thread ID before get thread list.
     * API Docs: https://disqus.com/api/docs/threads/list/
     * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
    */

    function getThreadInfo() {
        // Show loading DisqusJS message
        document.getElementById('dsqjs-loading-dsqjs').classList.remove('dsqjs-hide');
        // Hide disqusjs load error message
        // DisqusJS 模式第一次加载失败时，重载按钮会再次调用 getThreadInfo()
        // 确保 #dsqjs-load-error 信息被隐藏
        document.getElementById('dsqjs-load-error').classList.add('dsqjs-hide');
        // 为 强制 DISQUS 模式 设置监听点击事件
        document.getElementById('dsqjs-force-disqus').addEventListener('click', forceDisqus);
        // 为 尝试 DISQUS 模式 设置监听点击事件
        document.getElementById('dsqjs-reload-disqus').addEventListener('click', checkDisqus);
        let url = `${disqusjs.config.api}3.0/threads/list.json?forum=${disqusjs.config.shortname}&thread=ident:${disqusjs.config.identifier}&api_key=${disqusjs.config.apikey}`;
        xhr.open('GET', url, true);
        xhr.timeout = 4000;
        xhr.send();
        xhr.onload = function () {
            if (this.status === 200 || this.status === 304) {
                let res = JSON.parse(this.responseText).response;
                // 如果只返回一条则找到了对应 thread，否则是当前 identifier 不能找到 thread
                if (res.length === 1) {
                    var response = res[0];
                    disqusjs.page = {
                        id: response.id,
                        title: response.title,
                        isClosed: response.isClosed,
                        length: response.posts
                    };
                    // 获取评论列表
                    getComment();
                } else {
                    // 提示 当前页面可能还未初始化（创建 thread）
                    // create 需要 Authentication，不能在前端实现
                    document.getElementById('dsqjs-thread-not-init').classList.remove('dsqjs-hide');
                    document.getElementById('dsqjs-init-thread').addEventListener('click', forceDisqus);
                }
            } else {
                loadError();
            }
        };
    }

    /*
     * Name: getComment()
     * Description: get the comment content
     * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
     */

    function getComment(cursor) {
        // 当评论翻页时仍调用此函数，这里对 cursor 参数做一个判断
        if (!cursor) {
            cursor = '';
        } else {
            cursor = `&cursor=${cursor}`;
        }

        let url = `${disqusjs.config.api}3.0/posts/list.json?forum=${disqusjs.config.shortname}&thread=${disqusjs.page.id}${cursor}&api_key=${disqusjs.config.apikey}`;
        xhr.open('GET', url, true);
        xhr.timeout = 4000;
        xhr.send();
        xhr.onload = function () {
            if (this.status === 200 || this.status === 304) {
                var res = JSON.parse(this.responseText);
                if (res.code === 0 && res.response.length > 0) {
                    getCommentList(res.response);
                } else if (res.code === 0 && res.response.length === 0) {
                    // Have no comments.
                    document.getElementById('dsqjs-no-comment').classList.remove('dsqjs-hide');
                } else {
                    loadError();
                }

                if (res.cursor.hasNext) {
                    // load more comment
                    // 显示 加载更多评论 按钮
                    document.getElementById('dsqjs-load-more').classList.remove('dsqjs-hide');
                    // 点击 按钮 递归调用 getComment 并传入 cursor 参数
                    document.getElementById('dsqjs-load-more').addEventListener('click', () => { getComment(res.cursor.next); });
                } else {
                    // 没有更多评论了，确保按钮隐藏
                    document.getElementById('dsqjs-load-more').classList.add('dsqjs-hide');
                }

            } else {
                loadError();
            }
        };
    }

    /*
     * Name: getCommentList(data)
     * Description: Render JSON to comment list components
     */

    function getCommentList(data) {
        var topLevelComments = [];
        var childComments = [];

        data.forEach((comment) => {
            (comment.parent ? childComments : topLevelComments)['push'](comment);
        });

        var commentLists = topLevelComments.map((comment) => {
            return {
                comment,
                author: comment.author.name,
                isPrimary: comment.author.username === disqusjs.config.admin.toLowerCase(),
                children: getChildren(+comment.id)
            };
        });

        function getChildren(id) {
            if (childComments.length === 0) {
                return null;
            }

            var list = [];
            for (let comment of childComments) {
                if (comment.parent === id) {
                    list.unshift({
                        comment,
                        author: comment.author.name,
                        isPrimary: comment.author.username === disqusjs.config.admin.toLowerCase(),
                        children: getChildren(+comment.id)
                    });
                }
            }

            if (list.length) {
                return list;
            } else {
                return null;
            }
        }

        renderComment(commentLists);
    }

    function renderComment(data) {
        function processData(s) {
            if (s.comment.author.profileUrl) {
                /*
                <a href="${comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">
                    <img src="${comment.author.avatar.cache}">
                </a>
                */
                s.comment.avatarEl = `<a href="${s.comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer"><img src="${s.comment.author.avatar.cache}"></a>`;
                s.comment.authorEl = `<a href="${s.comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">${s.comment.author.name}</a>`;
            } else {
                s.comment.avatarEl = `<img src="${s.comment.author.avatar.cache}">`;
                s.comment.authorEl = `${s.comment.author.name}`;
            }

            if (s.isPrimary) {
                s.comment.authorEl += `<span class="dsqjs-admin-badge">${disqusjs.config.adminLabel}</span>`;
            }

            if (s.children) {
                // 如果有子评论，设置当前评论前套数为 1
                s.nesting = 1;
            }

            return s;
        }

        // 传入评论数据数组渲染评论条目
        function renderCommentItem(s) {
            /*
            <div class="dsqjs-item-container">
                <div class="dsqjs-avater">
                    ${s.avatarEl}
                </div>
                <div class="dsqjs-body">
                    <header class="dsqjs-header">
                        <span class="dsqjs-author">${s.authorEl}</span>
                        <span class="dsqjs-bullet"></span>
                        <span class="dsqjs-meta"><time>${dateFormat(new Date(s.createdAt))}</time></span>
                    </header>
                    <div class="dsqjs-content">${s.message}</div>
                </div>
            </div>
            */
            let commentItemTpl = `<div class="dsqjs-item-container"><div class="dsqjs-avater">${s.avatarEl}</div><div class="dsqjs-body"><header class="dsqjs-header"><span class="dsqjs-author">${s.authorEl}</span><span class="dsqjs-bullet"></span><span class="dsqjs-meta"><time>${dateFormat(new Date(s.createdAt))}</time></span></header><div class="dsqjs-content">${s.message}</div></div></div>`;

            return commentItemTpl;
        }


        data.map((s) => {
            // 子评论渲染函数
            function childrenComments(s) {
                var nesting = s.nesting,
                    children = (s.children || []);

                if (!children) {
                    return;
                }

                let html = (() => {
                    // 如果当前评论嵌套数大于 4 则不再右移
                    if (nesting < 4) {
                        return '<ul class="dsqjs-list dsqjs-children">';
                    } else {
                        return '<ul class="dsqjs-list">';
                    }
                })();

                // 渲染子评论列表
                html += children.map((s) => {
                    s = processData(s);

                    s.nesting = nesting + 1;

                    return `<li class="dsqjs-item" id="comment-${s.comment.id}">${renderCommentItem(s.comment)}${childrenComments(s)}</li>`;
                });

                html += '</ul>';

                if (html.length !== 0) {
                    return html;
                } else {
                    return;
                }
            };

            s = processData(s);

            // 渲染父评论条目
            let html = `<li class="dsqjs-item" id="comment-${s.comment.id}">${renderCommentItem(s.comment)}${childrenComments(s)}</li>`;

            document.getElementById('dsqjs-list').insertAdjacentHTML('beforeend', html);
        })
    }

    /*
     * Name: loadError()
     * Description: When dsqjs mode load error
     */

    function loadError() {
        // 显示 DisqusJS 加载错误
        document.getElementById('dsqjs-load-error').classList.remove('dsqjs-hide');
        // 隐藏 DisqusJS 正在加载
        document.getElementById('dsqjs-loading-dsqjs').classList.add('dsqjs-hide');
        document.getElementById('dsqjs-reload').addEventListener('click', getThreadInfo);
    }

    function main() {
        // Add dsqjs container element to #disqus_thread

        /*
        <div id="dsqjs">
            <section class="dsqjs-action"></section>
            <section class="dsqjs-info">
                <p id="dsqjs-load-disqus" class="dsqjs-message dsqjs-hide">评论完整模式加载中...如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或使用<a id="dsqjs-force-dsqjs">评论基础模式</a></p>
                <p id="dsqjs-loading-dsqjs" class="dsqjs-message dsqjs-hide">你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并<a id="dsqjs-reload-disqus">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus">强制完整 Disqus 模式</a>。</p>
                <p id="dsqjs-thread-not-init" class="dsqjs-message dsqjs-hide">该 Thread 并没有初始化，是否 <a id="dsqjs-init-thread">切换到完整 Disqus 模式</a> 进行初始化？</p>
                <p id="dsqjs-load-error" class="dsqjs-message dsqjs-hide">评论基础模式出现错误，是否<a id="dsqjs-reload">重载</a>？</p>
                <p id="dsqjs-no-comment" class="dsqjs-no-comment dsqjs-hide">这里冷冷清清的，一条评论都没有</p>
            </section>
            <section class="dsqjs-container" id="dsqjs-container">
                <ul id="dsqjs-list" class="dsqjs-list"></ul>
                <a id="dsqjs-load-more" class="dsqjs-load-more dsqjs-hide">加载更多评论</a>
                <div class="dsqjs-footer">
                    <div class="dsqjs-footer-right">
                        Powered by <a href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank">DISQUS</a> & <a href="https://github.com/SukkaW/DisqusJS">DisqusJS</a>
                    </div>
                </div>
            </section>
        </div>
        */
        var disqusjsBaseTpl = `<div id="dsqjs"><section class="dsqjs-action"></section><section class="dsqjs-info"><p id="dsqjs-load-disqus" class="dsqjs-message dsqjs-hide">评论完整模式加载中...如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或使用<a id="dsqjs-force-dsqjs">评论基础模式</a></p><p id="dsqjs-loading-dsqjs" class="dsqjs-message dsqjs-hide">你可能无法访问 Disqus，已启用评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并<a id="dsqjs-reload-disqus">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus">强制完整 Disqus 模式</a>。</p><p id="dsqjs-thread-not-init" class="dsqjs-message dsqjs-hide">该 Thread 并没有初始化，是否 <a id="dsqjs-init-thread">切换到完整 Disqus 模式</a> 进行初始化？</p><p id="dsqjs-load-error" class="dsqjs-message dsqjs-hide">评论基础模式出现错误，是否<a id="dsqjs-reload">重载</a>？</p><p id="dsqjs-no-comment" class="dsqjs-no-comment dsqjs-hide">这里冷冷清清的，一条评论都没有</p></section><section class="dsqjs-container" id="dsqjs-container"><ul id="dsqjs-list" class="dsqjs-list"></ul><a id="dsqjs-load-more" class="dsqjs-load-more dsqjs-hide">加载更多评论</a><div class="dsqjs-footer"><div class="dsqjs-footer-right">Powered by <a href="https://disqus.com" rel="nofollow noopener noreferrer" target="_blank">DISQUS</a> & <a href="https://github.com/SukkaW/DisqusJS">DisqusJS</a></div></div></section></div>`;
        // 将 DIsqusJS 的基本 HTML 组件渲染到页面上
        document.getElementById('disqus_thread').innerHTML = disqusjsBaseTpl;

        // 从 localStorage 中获取 mode 信息
        disqusjs.mode = getLS('disqusjs_mode');
        if (disqusjs.mode === 'disqus') {
            loadDisqus();
        } else if (disqusjs.mode === 'dsqjs') {
            getThreadInfo();
        } else {
            // Run checkDisqus() when no localStorage item
            // disqusjs.mode will be set in checkDisqus()
            checkDisqus();
        }

    }

    // 等页面 onload 事件触发了再执行 main()
    window.onload = () => {
        main();
    }

})();