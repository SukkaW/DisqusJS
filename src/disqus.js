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

const DisqusJS = () => {
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
    const get = ({
        url = '/',
        timeout = '4000',
        async = true
    }, success, error) => {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', encodeURI(url), async);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                let res = JSON.parse(xhr.responseText)
                success(res)
            }
        };
        xhr.timeout = timeout;
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

    function loadDisqus() {
        let d = document;
        let s = d.createElement('script');
        s.src = 'https://' + disqusjs.config.shortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', + new Date());
        (d.head || d.body).appendChild(s);
    }
}
