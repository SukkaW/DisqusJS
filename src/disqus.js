// Import baituTemplate
/*! baiduTemplate | Verison 1.0.6 | BSD License */

/**
 * baiduTemplate简单好用的Javascript模板引擎 1.0.6 版本
 * http://baidufe.github.com/BaiduTemplate
 * 开源协议：BSD License
 * 浏览器环境占用命名空间 baidu.template ，nodejs环境直接安装 npm install baidutemplate
 * @param str{String} dom结点ID，或者模板string
 * @param data{Object} 需要渲染的json对象，可以为空。当data为{}时，仍然返回html。
 * @return 如果无data，直接返回编译后的函数；如果有data，返回html。
 * @author wangxiao
*/

; (function (window) {

    //取得浏览器环境的baidu命名空间，非浏览器环境符合commonjs规范exports出去
    //修正在nodejs环境下，采用baidu.template变量名
    var baidu = typeof module === 'undefined' ? (window.baidu = window.baidu || {}) : module.exports;

    //模板函数（放置于baidu.template命名空间下）
    baidu.template = function (str, data) {

        //检查是否有该id的元素存在，如果有元素则获取元素的innerHTML/value，否则认为字符串为模板
        var fn = (function () {

            //判断如果没有document，则为非浏览器环境
            if (!window.document) {
                return bt._compile(str);
            };

            //HTML5规定ID可以由任何不包含空格字符的字符串组成
            var element = document.getElementById(str);
            if (element) {

                //取到对应id的dom，缓存其编译后的HTML模板函数
                if (bt.cache[str]) {
                    return bt.cache[str];
                };

                //textarea或input则取value，其它情况取innerHTML
                var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML;
                return bt._compile(html);

            } else {

                //是模板字符串，则生成一个函数
                //如果直接传入字符串作为模板，则可能变化过多，因此不考虑缓存
                return bt._compile(str);
            };

        })();

        //有数据则返回HTML字符串，没有数据则返回函数 支持data={}的情况
        var result = bt._isObject(data) ? fn(data) : fn;
        fn = null;

        return result;
    };

    //取得命名空间 baidu.template
    var bt = baidu.template;

    //标记当前版本
    bt.versions = bt.versions || [];
    bt.versions.push('1.0.6');

    //缓存  将对应id模板生成的函数缓存下来。
    bt.cache = {};

    //自定义分隔符，可以含有正则中的字符，可以是HTML注释开头 <! !>
    bt.LEFT_DELIMITER = bt.LEFT_DELIMITER || '<%';
    bt.RIGHT_DELIMITER = bt.RIGHT_DELIMITER || '%>';

    //自定义默认是否转义，默认为默认自动转义
    bt.ESCAPE = true;

    //HTML转义
    bt._encodeHTML = function (source) {
        return String(source)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\\/g, '&#92;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    //转义影响正则的字符
    bt._encodeReg = function (source) {
        return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
    };

    //转义UI UI变量使用在HTML页面标签onclick等事件函数参数中
    bt._encodeEventHTML = function (source) {
        return String(source)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\\\\/g, '\\')
            .replace(/\\\//g, '\/')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r');
    };

    //将字符串拼接生成函数，即编译过程(compile)
    bt._compile = function (str) {
        var funBody = "var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('" + bt._analysisStr(str) + "');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";
        return new Function("_template_object", funBody);
    };

    //判断是否是Object类型
    bt._isObject = function (source) {
        return 'function' === typeof source || !!(source && 'object' === typeof source);
    };

    //解析模板字符串
    bt._analysisStr = function (str) {

        //取得分隔符
        var _left_ = bt.LEFT_DELIMITER;
        var _right_ = bt.RIGHT_DELIMITER;

        //对分隔符进行转义，支持正则中的元字符，可以是HTML注释 <!  !>
        var _left = bt._encodeReg(_left_);
        var _right = bt._encodeReg(_right_);

        str = String(str)

            //去掉分隔符中js注释
            .replace(new RegExp("(" + _left + "[^" + _right + "]*)//.*\n", "g"), "$1")

            //去掉注释内容  <%* 这里可以任意的注释 *%>
            //默认支持HTML注释，将HTML注释匹配掉的原因是用户有可能用 <! !>来做分割符
            .replace(new RegExp("<!--.*?-->", "g"), "")
            .replace(new RegExp(_left + "\\*.*?\\*" + _right, "g"), "")

            //把所有换行去掉  \r回车符 \t制表符 \n换行符
            .replace(new RegExp("[\\r\\t\\n]", "g"), "")

            //用来处理非分隔符内部的内容中含有 斜杠 \ 单引号 ‘ ，处理办法为HTML转义
            .replace(new RegExp(_left + "(?:(?!" + _right + ")[\\s\\S])*" + _right + "|((?:(?!" + _left + ")[\\s\\S])+)", "g"), function (item, $1) {
                var str = '';
                if ($1) {

                    //将 斜杠 单引 HTML转义
                    str = $1.replace(/\\/g, "&#92;").replace(/'/g, '&#39;');
                    while (/<[^<]*?&#39;[^<]*?>/g.test(str)) {

                        //将标签内的单引号转义为\r  结合最后一步，替换为\'
                        str = str.replace(/(<[^<]*?)&#39;([^<]*?>)/g, '$1\r$2')
                    };
                } else {
                    str = item;
                }
                return str;
            });


        str = str
            //定义变量，如果没有分号，需要容错  <%var val='test'%>
            .replace(new RegExp("(" + _left + "[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?" + _right, "g"), "$1;" + _right_)

            //对变量后面的分号做容错(包括转义模式 如<%:h=value%>)  <%=value;%> 排除掉函数的情况 <%fun1();%> 排除定义变量情况  <%var val='test';%>
            .replace(new RegExp("(" + _left + ":?[hvu]?[\\s]*?=[\\s]*?[^;|" + _right + "]*?);[\\s]*?" + _right, "g"), "$1" + _right_)

            //按照 <% 分割为一个个数组，再用 \t 和在一起，相当于将 <% 替换为 \t
            //将模板按照<%分为一段一段的，再在每段的结尾加入 \t,即用 \t 将每个模板片段前面分隔开
            .split(_left_).join("\t");

        //支持用户配置默认是否自动转义
        if (bt.ESCAPE) {
            str = str

                //找到 \t=任意一个字符%> 替换为 ‘，任意字符,'
                //即替换简单变量  \t=data%> 替换为 ',data,'
                //默认HTML转义  也支持HTML转义写法<%:h=value%>
                .replace(new RegExp("\\t=(.*?)" + _right, "g"), "',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'");
        } else {
            str = str

                //默认不转义HTML转义
                .replace(new RegExp("\\t=(.*?)" + _right, "g"), "',typeof($1) === 'undefined'?'':$1,'");
        };

        str = str

            //支持HTML转义写法<%:h=value%>
            .replace(new RegExp("\\t:h=(.*?)" + _right, "g"), "',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'")

            //支持不转义写法 <%:=value%>和<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)" + _right, "g"), "',typeof($1)==='undefined'?'':$1,'")

            //支持url转义 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)" + _right, "g"), "',typeof($1)==='undefined'?'':encodeURIComponent($1),'")

            //支持UI 变量使用在HTML页面标签onclick等事件函数参数中  <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)" + _right, "g"), "',typeof($1)==='undefined'?'':baidu.template._encodeEventHTML($1),'")

            //将字符串按照 \t 分成为数组，在用'); 将其合并，即替换掉结尾的 \t 为 ');
            //在if，for等语句前面加上 '); ，形成 ');if  ');for  的形式
            .split("\t").join("');")

            //将 %> 替换为_template_fun_array.push('
            //即去掉结尾符，生成函数中的push方法
            //如：if(list.length=5){%><h2>',list[4],'</h2>');}
            //会被替换为 if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")

            //将 \r 替换为 \
            .split("\r").join("\\'");

        return str;
    };

})(window);

// Import baiduTemplate finished

/*!
 * DisqusJS | v0.1.0
 * Author: SukkaW
 * Link: https://github.com/SukkaW/DisqusJS
 * License: GPL-3.0
 */

/*
 * The variable used in DisqusJS
 *
 * DisqusJS Mode
 * disqusjs.mode = proxy | direct - Set which mode to use, should store and get in localStorage
 *
 * DisqusJS Config
 * disqusjs.config.shortname - The disqus shortname
 * disqusjs.config.identifier - The identifier of the page
 * disqusjs.config.url - The url of the page
 * disqusjs.config,api - Where to get data
 * disqusjs.config.apikey - The apikey used to request Disqus API
 * disqusjs.config.admin - The disqus forum admin username
 *
 * DisqusJS Info
 * disqusjs.page.id = The thread id, used at next API call
 * disqusjs.page.title - The thread title
 * disqusjs.page.isClosed - Whether the comment is closed
 * disqusjs.page.lenfth - How many comment in this thread
 */

disqusjs.page = [];
disqusjs.mode = 'proxy';
var xhr = new XMLHttpRequest();

setLS = (key, value) => {
    try {
        localStorage.setItem(key, value)
    } catch (o) {
        console.log(o), console.log("Failed to set localStorage item")
    }
}

getLS = (key) => {
    return localStorage.getItem(key);
}

/*
 * Name: Date.Format()
 *
 * Usage:
 * Month - M | MM
 * Date - d | dd
 * Hour - h | hh
 * Minute - m | mm
 * Second - s | ss
 * Season - q | qq
 * Year - y | yy | yyyy
 * ms - S
 *
 * Example: (new Date()).Format("yyyy-MM-dd hh:mm:ss.S")
 */

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // Minth
        "d+": this.getDate(), // Date
        "h+": this.getHours(), // Hour
        "m+": this.getMinutes(), // Minute
        "s+": this.getSeconds(), // Second
        "q+": Math.floor((this.getMonth() + 3) / 3), // Season
        "S": this.getMilliseconds() // ms
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/*
 * Name: getMode()
 * Description: get mode from localstorage
 */

function getMode() {
    let s = getLS('disqusjs_mode');
    if (!s) {
        // Run checkDisqus() when no localStorage item
        // disqusjs.mode will be set in checkDisqus()
        checkDisqus();
    } else {
        disqusjs.mode = s;
    }
}

/*
 * Name: loadDisqus()
 * Descriptin: load disqus as it should be.
 */

function loadDisqus() {
    var d = document;
    var s = d.createElement('script');
    s.src = '//' + disqusjs.config.shortname + '.disqus.com/embed.js';
    s.setAttribute('data-timestamp', + new Date());
    (d.head || d.body).appendChild(s);
}

/*
 * Name: checkDisqus()
 * Description: Check disqus is avaliable for visitor or not
 * How it works: check favicons under 2 domains can be loaded or not.
*/
function checkDisqus() {
    let domain = ['disqus.com', disqusjs.config.shortname + '.disqus.com'],
        test = 0,
        success = 0;
    setmode = () => {
        if (success = test) {
            disqusjs.mode = 'direct',
                setLS('disqusjs_mode', 'direct');
        } else {
            disqusjs.mode = 'proxy',
                setLS('disqusjs_mode', 'proxy');
        }
    };
    check = (domain) => {
        var img = new Image;
        var checker = setTimeout(() => {
            img.onerror = img.onload = null,
                test++ ,
                setmode();
        }, 3000);
        img.onerror = () => {
            clearTimeout(checker),
                test++ ,
                setmode();
        };
        img.onload = () => {
            clearTimeout(checker),
                success++ ,
                test++ ,
                setmode();
        };
        img.src = 'https://' + domain + '/favicon.ico?' + +(new Date);
    };
    for (let i of domain) {
        check(i);
    };
}

/*
 * Name: getThreadInfo()
 * Description: Disqus API only support get thread list by ID, not identifter. So get Thread ID before get thread list.
 * API Docs: https://disqus.com/api/docs/threads/list/
 * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
*/

function getThreadInfo() {

    /*
     * Name: getComment()
     * Description: get the comment content
     * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
     */

    getComment = () => {
        let url = disqusjs.config.api + '3.0/posts/list.json?forum=' + disqusjs.config.shortname + '&thread=' + disqusjs.page.id + '&api_key=' + disqusjs.config.apikey;
        xhr.open('GET', url, true);
        xhr.timeout = 4000;
        xhr.send();
        xhr.onload = function () {
            if (this.status == 200 || this.status == 304) {
                var res = JSON.parse(this.responseText);
                if (res.code === 0) {
                    getCommentList(res.response);
                } else {
                    // Have error when get comments.
                }

            }
        };
        xhr.ontimeout = (e) => {
            console.log(e)
        };
        xhr.onerror = (e) => {
            console.log(e)
        };
    }

    let url = disqusjs.config.api + '3.0/threads/list.json?forum=' + disqusjs.config.shortname + '&thread=ident:' + disqusjs.config.identifier + '&api_key=' + disqusjs.config.apikey;
    xhr.open('GET', url, true);
    xhr.timeout = 4000;
    xhr.send();
    xhr.onload = function () {
        if (this.status == 200 || this.status == 304) {
            var response = JSON.parse(this.responseText).response[0];
            disqusjs.page = {
                id: response.id,
                title: response.title,
                isClosed: response.isClosed,
                length: response.posts
            };
            getComment();
        }
    };
    xhr.ontimeout = (e) => {
        console.log(e)
    };
    xhr.onerror = (e) => {
        console.log(e)
    };
}

/*
 * Name: getCommentList(data)
 * Description: Render JSON to comment list components
 */

function getCommentList(data) {
    var topLevelComments = [];
    var childComments = [];

    data.forEach(comment => {
        (comment.parent ? childComments : topLevelComments)['push'](comment)
    })

    var commentLists = topLevelComments.map(comment => {
        return {
            comment,
            author: comment.author.name,
            isPrimary: comment.author.username === disqusjs.config.admin,
            children: getChildren(+comment.id)
        };
    });

    function getChildren(id) {
        if (childComments.length === 0) return null;

        var list = [];
        for (let comment of childComments) {
            if (comment.parent === id) {
                list.unshift({
                    comment,
                    author: comment.author.name,
                    isPrimary: comment.author.username === disqusjs.config.admin,
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

    renderComment(commentLists)
}

function renderComment(data) {
    var disqusjsBaseTpl = `
    <div id="dsqjs">
        <section class="dsqjs-action"></section>
        <header></header>
        <section class="dsqjs-container"><ul id="dsqjs-list" class="dsqjs-list"></ul></section>
    </div>
    `;
    document.getElementById('disqus_thread').innerHTML = disqusjsBaseTpl;



    var commentBodyTpl = `
    <div class="dsqjs-item-container">
        <div class="dsqjs-avater">
            <%- avatarEl %>
        </div>
        <div class="dsqjs-body">
            <header class="dsqjs-header">
                <span class="dsqjs-author"><%- authorEl %></span>
                <span class="dsqjs-bullet"></span>
                <span class="dsqjs-meta"><time><%- (new Date(createdAt)).Format("yyyy-MM-dd hh:mm:ss") %></time></span>
            </header>
            <div class="dsqjs-content"><%- message %></div>
        </div>
    </div>
    `
    data.map(s => {
        childrenComments = (s) => {
            var children = (s.children || []);
            if (typeof children === 'null') return;

            var html = '<ul class="dsqjs-list dsqjs-children">';
            console.log(children)
            children.map(s => {
                let comment = s.comment

                if (comment.author.profileUrl) {
                    comment.avatarEl = `
                    <a href="${comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">
                        <img src="${comment.author.avatar.cache}">
                    </a>
                    `;
                    comment.authorEl = `<a href="${comment.author.profileUrl}">${comment.author.name}</a>`
                } else {
                    comment.avatarEl = `<img src="${comment.author.avatar.cache}">`;
                    comment.authorEl = `${comment.author.name}`
                }

                html += '<li class="dsqjs-item" id="comment-${comment.id}">'

                html += baidu.template(commentBodyTpl, comment)

                html += `${childrenComments(s)}
                </li>`
            })

            html += '</ul>';

            if (html.length !== 0) {
                return html;
            } else {
                return;
            }
        };

        let comment = s.comment;

        if (comment.author.profileUrl) {
            comment.avatarEl = `
            <a href="${comment.author.profileUrl}" target="_blank" rel="nofollow noopener noreferrer">
                <img src="${comment.author.avatar.cache}">
            </a>
            `;
            comment.authorEl = `<a href="${comment.author.profileUrl}">${comment.author.name}</a>`
        } else {
            comment.avatarEl = `<img src="${comment.author.avatar.cache}">`;
            comment.authorEl = `${comment.author.name}`
        }

        let html = '<li class="dsqjs-item" id="comment-${comment.id}">'

        html += baidu.template(commentBodyTpl, comment)

        html += `${childrenComments(s)}
        </li>`;

        document.getElementById('dsqjs-list').insertAdjacentHTML('beforeend', html);
    })
}


getThreadInfo();