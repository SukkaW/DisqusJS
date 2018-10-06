/*!
 * DisqusJS | v0.1.0
 * Author: SukkaW
 * Link: https://github.com/SukkaW/DisqusJS
 * License: GPL-3.0
 */

/*
 * The variable used in DisqusJS
 *
 * DisqusJS Config
 * disqusjs.config.shortname - The disqus shortname
 * disqusjs.config.identifier - The identifier of the page
 * disqusjs.config.url - The url of the page
 * disqusjs.config,api - Where to get data
 * disqusjs.config.apikey - The apikey used to request Disqus API
 * disqusjs.config.mode - proxy | direct - Set which mode to use, should store and get in localStorage
 *
 * DisqusJS Info
 * disqusjs.page.id = The thread id, used at next API call
 * disqusjs.page.title - The thread title
 * disqusjs.page.isClosed - Whether the comment is closed
 * disqusjs.page.lenfth - How many comment in this thread
 */

disqusjs.page = {};
var xhr = new XMLHttpRequest();

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
 * How it works:
    First check https://disqus.com/next/config.json is avaliable in 2000 or not.
    Then check [shortname].disqus.com/favicon.ico is avaliable in 3000 or not.
*/
function checkDisqus() {
    xhr.open('GET', 'https://disqus.com/next/config.json', true);
    xhr.timeout = 2000;
    xhr.send();
    xhr.onload = function () {
        if (this.status == 200 || this.status == 304) {
            var img = new Image;
            var checker = setTimeout(function () {
                img.onerror = img.onload = null;
                disqusjs.config.mode = 'proxy';
            }, 2500);
            img.onerror = function () {
                clearTimeout(checker);
                disqusjs.config.mode = 'proxy';
                console.log(disqusjs)
            };
            img.onload = function () {
                clearTimeout(checker);
                disqusjs.config.mode = 'direct';
                console.log(disqusjs)
            };
            img.src = "https://" + disqusjs.config.shortname + ".disqus.com/favicon.ico?" + +(new Date);
        }
    };
    xhr.ontimeout = function (e) {
        disqusjs.config.mode = 'proxy';
        console.log(disqusjs)
    };
    xhr.onerror = function (e) {
        disqusjs.config.mode = 'proxy';
        console.log(disqusjs)
    };
}

/*
 * Name: getThreadInfo()
 * Description: Disqus API only support get thread list by ID, not identifter. So get Thread ID before get thread list.
 * API Docs: https://disqus.com/api/docs/threads/list/
 * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
*/

function getThreadInfo() {
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
            console.log(disqusjs);
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
 * Name: getComment()
 * Description: get the comment content
 * API URI: /3.0/posts/list.json?forum=[shortname]&thread=[thread id]&api_key=[apikey]
 */

function getComment() {
    var url = disqusjs.config.api + '3.0/posts/list.json?forum=' + disqusjs.config.shortname + '&thread=' + disqusjs.page.id + '&api_key=' + disqusjs.config.apikey;
    xhr.open('GET', url, true);
    xhr.timeout = 4000;
    xhr.send();
    xhr.onload = function () {
        if (this.status == 200 || this.status == 304) {
            var response = JSON.parse(this.responseText);
            console.log(response);
        }
    };
    xhr.ontimeout = function (e) {
        console.log(e)
    };
    xhr.onerror = function (e) {
        console.log(e)
    };
}

checkDisqus();

/* getThreadInfo(); */
