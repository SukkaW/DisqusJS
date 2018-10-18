/*!
 * DisqusJS | v0.2.4
 * Author: SukkaW
 * Link: https://github.com/SukkaW/DisqusJS
 * License: GPL-3.0
 *//*
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

function DisqusJS(config) {
    var disqusjs = [];
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
    var get = function (url, success, error) {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', encodeURI(url), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var res = JSON.parse(xhr.responseText)
                success(res)
            }
        };
        xhr.timeout = 4000;
        xhr.ontimeout = function (e) {
            error(e);
        };
        xhr.onerror = function (e) {
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
    var setLS = function (key, value) {
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
    var getLS = function (key) {
        return localStorage.getItem(key);
    }

    /*
     * dateFormat(date) - 解析 date 为 yyyy-MM-dd hh:mm:ss
     *
     * @param {function} date - 传入 Date 对象
     * @return {string} - 格式化后的日期
     */
    var dateFormat = function (date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? (("0" + m)) : m;
        var d = date.getDate();
        d = d < 10 ? (("0" + d)) : d;
        var h = date.getHours() + 8;
        h = h < 10 ? (("0" + h)) : h;
        var minute = date.getMinutes();
        minute = minute < 10 ? (("0" + minute)) : minute;
        var second = date.getSeconds();
        second = minute < 10 ? (("0" + second)) : second;
        return (y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second);
    }

    /*
     * loadDisqus() - 加载 Disqus
     */
    function loadDisqus() {
        var d = document;
        var s = d.createElement('script');
        s.src = 'https://' + disqusjs.config.shortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', + new Date());
        (d.head || d.body).appendChild(s);
    }

    function checkDisqus() {
        var domain = ['disqus.com', ((disqusjs.config.shortname) + ".disqus.com")],
            test = 0,
            success = 0;

        var checker = function () {
            if ((domain.length === test) && (test === success)) {
                setLS('dsqjs_mode', 'disqus')
            } else if (domain.length === test) {
                setLS('dsqjs_mode', 'dsqjs')
            }
        }

        for (var i$1 = 0, list = domain; i$1 < list.length; i$1 += 1) {
            var i = list[i$1];

            (function (i) {
                var img = new Image;
                var timeout = setTimeout(function () {
                    img.onerror = img.onload = null;
                    test++;
                    checker()
                }, 2000);

                img.onerror = function () {
                    clearTimeout(timeout);
                    test++;
                    checker()
                }

                img.onload = function () {
                    clearTimeout(timeout);
                    test++;
                    success++;
                    checker()
                }

                img.src = "https://" + i + "/favicon.ico?" + (+(new Date))

            })(i);

        }
    }

    function loadDsqjs() {
        (function () {
            var url = (disqusjs.config.api) + "3.0/threads/list.json?forum=" + (disqusjs.config.shortname) + "&thread=ident:" + (disqusjs.config.identifier) + "&api_key=" + (disqusjs.config.apikey);
            /*
             * Description: Disqus API only support get thread list by ID, not identifter. So get Thread ID before get thread list.
             * API Docs: https://disqus.com/api/docs/threads/list/
             * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
             */
            get(url, function (res) {
                if (res.response.length === 1) {
                    var resp = res.response[0];
                    disqusjs.page = {
                        id: resp.id,
                        title: resp.title,
                        isClosed: resp.isClosed,
                        length: resp.posts
                    };
                    // 获取评论列表
                } else {
                    // 当前页面可能还未初始化（创建 thread）
                }
            }, function (e) {
                console.log(e);
            })
        })()

        function getComment(cursor) {
            if (!cursor) {
                cursor = '';
            } else {
                cursor = "&cursor=" + cursor;
            }
            /*
             * Description: get the comment content
             * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
             */
            var url = (disqusjs.config.api) + "3.0/posts/list.json?forum=" + (disqusjs.config.shortname) + "&thread=" + (disqusjs.page.id) + cursor + "&api_key=" + (disqusjs.config.apikey);
            console.log(url)
        }
    }

    loadDsqjs()
}
