/*
 * The variable used in DisqusJS
 *
 * DisqusJS Mode
 * @param {string} disqusjs.mode = dsqjs | disqus - Set which mode to use, should store and get in localStorage
 *
 * DisqusJS Config
 * @param {string} disqusjs.config.shortname - The disqus shortname
 * @param {string} disqusjs.config.identifier - The identifier of the page
 * @param {string} disqusjs.config.url - The url of the page
 * @param {string} disqusjs.config.api - Where to get data
 * @param {string} disqusjs.config.apikey - The apikey used to request Disqus API
 * @param {string} disqusjs.config.admin - The disqus forum admin username
 * @param {string} disqusjs.config.adminLabel - The disqus moderator badge text
 *
 * DisqusJS Info
 * @param {string} disqusjs.page.id = The thread id, used at next API call
 * @param {string} disqusjs.page.title - The thread title
 * @param {boolean} disqusjs.page.isClosed - Whether the comment is closed
 * @param {number} disqusjs.page.lenfth - How many comment in this thread
 */

function DisqusJS(config) {
    let disqusjs = [];
    disqusjs.config = config

    // 定义 disqusjs.page，之后会填充 thread id、title 等数据
    disqusjs.page = [];

    /*
     * window.disqus_config - 从 disqusjs.config 获取 Disqus 所需的配置
     */
    window.disqus_config = function () {
        this.page.url = disqusjs.config.url;
        this.page.identifier = disqusjs.config.identifier;
    };

    /*
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
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.responseText)
                success(res)
            }
        };
        xhr.timeout = 4000;
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

    /*
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

    /*
     * getLS(key) - 从 localStorage 条目
     *
     * @param {string} key
     * @return {string} - 返回条目 value 内容
     */
    const getLS = (key) => {
        return localStorage.getItem(key);
    }

    /*
     * dateFormat(date) - 解析 date 为 yyyy-MM-dd hh:mm:ss
     *
     * @param {function} date - 传入 Date 对象
     * @return {string} - 格式化后的日期
     */
    const dateFormat = (date) => {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        m = m < 10 ? (`0${m}`) : m;
        let d = date.getDate();
        d = d < 10 ? (`0${d}`) : d;
        let h = date.getHours() + 8;
        h = h < 10 ? (`0${h}`) : h;
        let minute = date.getMinutes();
        minute = minute < 10 ? (`0${minute}`) : minute;
        let second = date.getSeconds();
        second = minute < 10 ? (`0${second}`) : second;
        return `${y}-${m}-${d} ${h}:${minute}:${second}`;
    }

    /*
     * loadDisqus() - 加载 Disqus
     */
    function loadDisqus() {
        let d = document;
        let s = d.createElement('script');
        s.src = 'https://' + disqusjs.config.shortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', + new Date());
        (d.head || d.body).appendChild(s);
    }

    function checkDisqus() {
        let domain = ['disqus.com', `${disqusjs.config.shortname}.disqus.com`],
            test = 0,
            success = 0;

        let checker = () => {
            if ((domain.length === test) && (test === success)) {
                setLS('dsqjs_mode', 'disqus')
            } else if (domain.length === test) {
                setLS('dsqjs_mode', 'dsqjs')
            }
        }

        for (let i of domain) {
            ((i) => {
                let img = new Image;
                let timeout = setTimeout(() => {
                    img.onerror = img.onload = null;
                    test++;
                    checker()
                }, 2000);

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

                img.src = `https://${i}/favicon.ico?${+(new Date)}`

            })(i);

        }
    }

    function loadDsqjs() {
        (() => {
            let url = `${disqusjs.config.api}3.0/threads/list.json?forum=${disqusjs.config.shortname}&thread=ident:${disqusjs.config.identifier}&api_key=${disqusjs.config.apikey}`;
            /*
             * Disqus API 只支持通过 Thread ID 获取评论列表，所以必须先通过 identifier 获取当前页面 Thread ID
             *
             * API Docs: https://disqus.com/api/docs/threads/list/
             * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
             */
            get(url, (res) => {
                console.log(res);
                // 如果只返回一条则找到了对应 thread，否则是当前 identifier 不能找到唯一的 thread
                // 如果 thread 不唯一则需要进行初始化
                if (res.code === 0 && res.response.length === 1) {
                    var resp = res.response[0];
                    disqusjs.page = {
                        id: resp.id, // Thread ID
                        title: resp.title, // Thread Title (默认是页面标题)
                        isClosed: resp.isClosed, // 评论是否关闭
                        length: resp.posts // 评论数目
                    };
                    // 获取评论列表
                    getComment()
                } else if (res.code === 0 && res.response.length !== 1) {
                    // 当前页面可能还未初始化（创建 thread）
                } else {
                    // 评论列表加载错误
                }
            }, (e) => {
                // 评论列表加载错误
                console.log(e);
            })
        })()

        /*
         * getComment(cursor) - 获取评论列表
         *
         * @param {string} cursor - 传入 cursor 用于加载更多评论
         */
        let getComment = (cursor) => {
            // 处理传入的 cursor
            if (!cursor) {
                cursor = '';
            } else {
                cursor = `&cursor=${cursor}`;
            }
            /*
             * 获取评论列表
             *
             * API Docs: https://disqus.com/api/docs/posts/list/
             * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
             */
            let url = `${disqusjs.config.api}3.0/posts/list.json?forum=${disqusjs.config.shortname}&thread=${disqusjs.page.id}${cursor}&api_key=${disqusjs.config.apikey}`;
            get(url, (res) => {
                if (res.code === 0 && res.response.length > 0) {
                    // 已获得评论列表
                    renderComment(res.response)
                } else if (res.code === 0 && res.response.length === 0) {
                    // 当前没有评论
                } else {
                    // 评论列表加载错误
                }
            }, (e) => {
                // 评论列表加载错误
                console.log(e);
            })
        }

        /*
         * parseCommentData(data) - 解析评论列表
         *
         * @param {Object} data - 评论列表 JSON
         * @return {Object} - 解析后的评论列表数据
         */
        let parseCommentData = (data) => {
            var topLevelComments = [],
                childComments = [];

            let getChildren = (id) => {
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

            return commentLists;
        }

        /*
         * parseCommentData(data) - 渲染评论列表
         *
         * @param {Object} data - 从 getComment() 获取到的 JSON
         */
        let renderComment = (data) => {
            data = parseCommentData(data);
            console.log(data)
        }
    }


}
