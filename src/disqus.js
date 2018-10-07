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

var setLS = function (key, value) {
    try {
        localStorage.setItem(key, value)
    } catch (o) {
        console.log(o), console.log("Failed to set localStorage item")
    }
}

var getLS = function (key) {
    return localStorage.getItem(key);
}

/*
 * Name: getMode()
 * Description: get mode from localstorage
 */

function getMode() {
    var s = getLS('disqusjs_mode');
    if (!s) {
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
    var domain = ['disqus.com', disqusjs.config.shortname + '.disqus.com'],
        test = 0,
        success = 0;
    var setmode = function () {
        if (success = test) {
            disqusjs.mode = 'direct',
                setLS('disqusjs_mode', 'direct');
        } else {
            disqusjs.mode = 'proxy',
                setLS('disqusjs_mode', 'proxy');
        }
    };
    var check = function (domain) {
        var img = new Image;
        var checker = setTimeout(function () {
            img.onerror = img.onload = null,
                test++ ,
                setmode();
        }, 2500);
        img.onerror = function () {
            clearTimeout(checker),
                test++ ,
                setmode();
        };
        img.onload = function () {
            clearTimeout(checker),
                success++ ,
                test++ ,
                setmode();
        };
        img.src = 'https://' + domain + '/favicon.ico?' + +(new Date);
    };
    for (var i = 0; i < domain.length; i++) {
        check(domain[i]);
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

    var getComment = function () {
        var url = disqusjs.config.api + '3.0/posts/list.json?forum=' + disqusjs.config.shortname + '&thread=' + disqusjs.page.id + '&api_key=' + disqusjs.config.apikey;
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
        xhr.ontimeout = function (e) {
            console.log(e)
        };
        xhr.onerror = function (e) {
            console.log(e)
        };
    }

    var url = disqusjs.config.api + '3.0/threads/list.json?forum=' + disqusjs.config.shortname + '&thread=ident:' + disqusjs.config.identifier + '&api_key=' + disqusjs.config.apikey;
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
    xhr.ontimeout = function (e) {
        console.log(e)
    };
    xhr.onerror = function (e) {
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

    data.forEach(function (comment) {
        (comment.parent ? childComments : topLevelComments)['push'](comment)
    })

    var commentLists = topLevelComments.map(function (comment) {
        return {
            comment: comment,
            author: comment.author.name,
            isPrimary: comment.author.username === disqusjs.config.admin,
            children: getChildren(Number(comment.id))
        };
    });

    function getChildren(id) {
        if (childComments.length === 0) {
            return null;
        }

        var list = [];
        for (var i = 0; i < childComments.length; i++) {
            var comment = childComments[i];
            if (comment.parent === id) {
                list.unshift({
                    comment: comment,
                    author: comment.author.name,
                    isPrimary: comment.author.username === disqusjs.config.admin,
                    children: getChildren(Number(comment.id))
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
    data.map(function (comment) {
        console.log(comment)
    })
}


getThreadInfo();