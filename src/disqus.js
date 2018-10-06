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
 *
 * DisqusJS Info
 * disqusjs.page.id = The thread id, used at next API call
 * disqusjs.page.title - The thread title
 * disqusjs.page.isClosed - Whether the comment is closed
 * disqusjs.page.lenfth - How many comment in this thread
 */

var xhr = new XMLHttpRequest();

/*
 * Name: getThreadID()
 * Descr: Disqus API only support get thread list by ID, not identifter. So get Thread ID before get thread list.
 * API Docs: https://disqus.com/api/docs/threads/list/
 * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
*/


function getThreadInfo() {
    var url = disqusjs.config.api + '/3.0/threads/list.json?forum=' + disqusjs.config.shortname + '&thread=ident:'+ disqusjs.config.identifier + '&api_key=' + disqusjs.config.apikey;
    xhr.open('GET', url, true);
    xhr.timeout = 4000;
    xhr.send();
    xhr.onload = function() {
        if (this.status == 200||this.status == 304) {
            var response = JSON.parse(this.responseText).response[0];
            console.log(response);
            disqusjs.page = {
                id: response.id,
                title: response.title,
                isClosed: response.isClosed,
                length: response.posts
            };
            console.log(disqusjs);
        }
    };
    xhr.ontimeout = function(e) {
        console.log(e)
    };
    xhr.onerror = function(e) {
        console.log(e)
    };
}

