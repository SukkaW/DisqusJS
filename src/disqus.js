/**
 * @typedef {object} DisqusJSMode
 * @property {'dsqjs'|'disqus'} mode - Set which mode to use, should store and get in localStorage
 * @property {'popular' | 'asc' | 'desc'} sortType - Set which sort type to use, should store and get in localStorage
 *
 * @typedef {object} DisqusJSConfig
 * @property {string} shortname - The disqus shortname
 * @property {string} siteName - The Forum Name
 * @property {string} identifier - The identifier of the page
 * @property {string} title - The title of the page
 * @property {string} url - The url of the page
 * @property {string} api - Where to get data
 * @property {string} apikey - The apikey used to request Disqus API
 * @property {number} nesting - The max nesting level of Disqus comment
 * @property {string} nocomment - The msg when there is no comment
 * @property {string} admin - The disqus forum admin username
 * @property {string} adminLabel - The disqus moderator badge text
 *
 * @typedef {object} DisqusJSInfo
 * @property {string} id = The thread id, used at next API call
 * @property {string} next = The cursor of next page of list
 * @property {boolean} isClosed - Whether the comment is closed
 * @property {number} length - How many comment in the thread
 * @property {string} title - The title of the thread
 * @property {DisqusComment[]} comment - The list of comment
 *
 * @typedef {{createdAt:string;parent:any}} DisqusComment
 *
 */

const $$ = (/** @type {string} */ elementID) => document.getElementById(elementID)

const setLS = (/** @type {string} */ key, /** @type {string} */ value) => {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.log(e)
  }
}

// 定义一些常量
const CLICK = 'click'
const DISQUS_CONTAINER_EL_ID = 'disqus_thread'
const DSQJS_STORAGE_KEY_SORT_TYPE = 'dsqjs_sort'

/**
 * htmlTpl - DisqusJS 的 HTML 模板片段
 *
 * msg: DisqusJS 提示信息模板
 * footer: 尾部信息模板
 */

/*
  target="_blank" rel="external nofollow noopener noreferrer"
   */
const HTML_TPL_A_ATTR = `target="_blank" rel="external nofollow noopener noreferrer"`
/*
  <div id="dsqjs-msg"></div>
  */
const HTML_TPL_EL_MSG = `<div id="dsqjs-msg"></div>`
/*
  <footer>
      <p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" ${HTML_TPL_A_ATTR}></a>&nbsp;&amp;&nbsp;<a href="https://disqusjs.skk.moe" target="_blank">DisqusJS</a>
      </p>
  </footer>
  */
const HTML_TPL_EL_FOOTER = `<footer><p class="dsqjs-footer">Powered by <a class="dsqjs-disqus-logo" href="https://disqus.com" ${HTML_TPL_A_ATTR}></a>&nbsp;&amp;&nbsp;<a href="https://disqusjs.skk.moe" target="_blank">DisqusJS</a></p></footer>`

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
              <label class="dsqjs-order-label" for="dsqjs-order-popular" title="按评分从高到低">最佳</label>
          </div>
      </nav>
  </header>
  */
const HTML_TPL_EL_HEADER = (/** @type {string} */ num, /** @type {string} */ title) =>
  `<header class="dsqjs-header" id="dsqjs-header"><nav class="dsqjs-nav dsqjs-clearfix"><ul><li class="dsqjs-nav-tab dsqjs-tab-active"><span>${num} Comments</span></li><li class="dsqjs-nav-tab">${title}</li></ul><div class="dsqjs-order"><input class="dsqjs-order-radio" id="dsqjs-order-desc" type="radio" name="comment-order" value="desc" checked="true"><label class="dsqjs-order-label" for="dsqjs-order-desc" title="按从新到旧">最新</label><input class="dsqjs-order-radio" id="dsqjs-order-asc" type="radio" name="comment-order" value="asc"><label class="dsqjs-order-label" for="dsqjs-order-asc" title="按从旧到新">最早</label><input class="dsqjs-order-radio" id="dsqjs-order-popular" type="radio" name="comment-order" value="popular"><label class="dsqjs-order-label" for="dsqjs-order-popular" title="按评分从高到低">最佳</label></div></nav></header>`

const HTML_TPL_EL_COMMENT = (
  /** @type {{ avatarEl:string, createdAt:string }} */ { avatarEl, createdAt },
  /** @type {string} */ authorEl,
  /** @type {string} */ message
) =>
  `<div class="dsqjs-post-item dsqjs-clearfix"><div class="dsqjs-post-avatar">${avatarEl}</div><div class="dsqjs-post-body"><div class="dsqjs-post-header">${authorEl}<span class="dsqjs-meta"><time>${formatDate(
    createdAt
  )}</time></span></div><div class="dsqjs-post-content">${message}</div></div></div>`

const HTML_TPL_EL_ASK_FOR_FULL =
  '如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> | <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">强制完整 Disqus 模式</a>'

/**
 * formatDate(date) - 解析 date 为 yyyy-MM-dd hh:mm:ss
 *
 * @param {string|number|Date} date - 传入评论创建日期（XML 格式）
 * @return {string} - 格式化后的日期
 */
const formatDate = (date) => {
  // 不足两位补 0
  const x = (/** @type {number} */ input) => (input < 10 ? `0${input}` : input)
  // 将传入的 date 转化为时间戳
  date = Date.parse(new Date(date).toString())

  // Disqus API 返回的是 UTC 时间，所以在时间戳上加 28800000 毫秒补上 8 小时时差
  date = new Date(date + 8 * 60 * 60 * 1000)
  const y = date.getFullYear()
  const m = x(date.getMonth() + 1)
  const d = x(date.getDate())
  const h = x(date.getHours())
  const minute = x(date.getMinutes())
  return `${y}-${m}-${d} ${h}:${minute}`
}

/**
 * @class DisqusJS
 * @implements {DisqusJSMode}
 */
class DisqusJS {
  /**
   * @param {Partial<DisqusJSConfig>} config
   */
  constructor(config) {
    const currentPageFullUrl = document.location.origin + document.location.pathname + document.location.search
    this.config = Object.assign(
      {
        api: 'https://disqus.skk.moe/disqus/',
        identifier: currentPageFullUrl,
        url: currentPageFullUrl,
        title: document.title,
        siteName: '',
        //@ts-ignore
        nesting: parseInt(config.nesting) || 4,
        nocomment: '这里冷冷清清的，一条评论都没有'
      },
      config
    )
    /** @type {Partial<DisqusJSInfo>} */
    this.page = {}
    const that = this
    /*
     * window.disqus_config - 从 disqusjs.config 获取 Disqus 所需的配置
     */
    //@ts-ignore
    window.disqus_config = function () {
      //@ts-ignore
      this.page.url = that.config.url
      //@ts-ignore
      this.page.identifier = that.config.identifier
      //@ts-ignore
      this.page.title = that.config.title
    }

    // 填充 DisqusJS 的 Container
    $$(DISQUS_CONTAINER_EL_ID).innerHTML = `<div id="dsqjs">${HTML_TPL_EL_MSG}${HTML_TPL_EL_FOOTER}</div>`

    // 引入 Fetch 以后，一堆浏览器将不再被支持，所以加个判断，劝退一些浏览器
    if (!fetch || !localStorage || !Promise) {
      this.msg(`你的浏览器版本过低，不兼容评论基础模式。${HTML_TPL_EL_ASK_FOR_FULL}`)
      this.assignClickEventForAskForFulButton()
    } else {
      this.initDsqjs()
    }
  }
  /**
   * @param {string} str
   */
  msg(str) {
    const msgEl = $$('dsqjs-msg')
    if (msgEl) msgEl.innerHTML = str
  }
  /**
   * @param {RequestInfo} url
   */
  _get(url) {
    return fetch(url)
      .then((resp) => Promise.all([resp.ok, resp.status, resp.json(), resp.headers]))
      .then(([ok, status, data, headers]) => {
        if (ok) {
          return { ok, status, data, headers }
        } else {
          throw new Error()
        }
      })
      .catch((error) => {
        throw error
      })
  }
  /*
   * loadDisqus() - 加载 Disqus
   */
  loadDisqus() {
    //@ts-ignore
    if (window.DISQUS) {
      const { identifier, url, title } = this.config
      //@ts-ignore
      window.DISQUS.reset({
        reload: true,
        config() {
          this.page.identifier = identifier
          this.page.url = url
          this.page.title = title
        }
      })
    } else {
      const s = document.createElement('script')

      // 显示提示信息
      // Disqus 加载成功以后会把 #disqus_thread 内的内容全部覆盖
      $$(
        DISQUS_CONTAINER_EL_ID
      ).innerHTML = `<div id="dsqjs"><section><div id="dsqjs-msg">评论完整模式加载中... 如果长时间无法加载，请针对 disq.us | disquscdn.com | disqus.com 启用代理，或切换至 <a id="dsqjs-force-dsqjs" class="dsqjs-msg-btn">评论基础模式</a></div></section>${HTML_TPL_EL_FOOTER}</div>`
      $$('dsqjs-force-dsqjs').addEventListener(CLICK, this.useDsqjs)

      s.src = `https://${this.config.shortname}.disqus.com/embed.js`
      s.setAttribute('data-timestamp', new Date().valueOf().toString())
      ;(document.head || document.body).appendChild(s)
    }
  }
  checkDisqus() {
    $$(
      DISQUS_CONTAINER_EL_ID
    ).innerHTML = `<div id="dsqjs"><section><div id="dsqjs-msg">正在检查 Disqus 能否访问...</div></section>${HTML_TPL_EL_FOOTER}</div>`

    /**
     *
     * @param {string} domain
     * @returns {Promise<void>}
     */
    const runcheck = (domain) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        // 处理加载超时
        const timeout = setTimeout(() => {
          img.onerror = img.onload = null
          reject()
        }, 3000)

        img.onerror = () => {
          clearTimeout(timeout)
          reject()
        }

        img.onload = () => {
          clearTimeout(timeout)
          resolve()
        }

        img.src = `https://${domain}/favicon.ico?${+new Date()}=${+new Date()}`
      })
    }

    // 测试 Disqus 的域名
    // *.disquscdn.com 没有被墙所以不做检查
    return Promise.all([runcheck('disqus.com'), runcheck(`${this.config.shortname}.disqus.com`)]).then(
      this.useDisqus,
      this.useDsqjs
    )
  }

  /*
   * useDsqjs() - 强制使用 DisqusJS
   */
  useDsqjs() {
    setLS('dsqjs_mode', 'dsqjs')
    this.loadDsqjs()
  }
  /**
   * useDsqjs() - 强制使用 Disqus
   */
  useDisqus() {
    setLS('dsqjs_mode', 'disqus')
    this.loadDisqus()
  }

  assignClickEventForAskForFulButton() {
    $$('dsqjs-reload-disqus').addEventListener(CLICK, this.checkDisqus)
    $$('dsqjs-force-disqus').addEventListener(CLICK, this.useDisqus)
  }

  loadDsqjs() {
    // DisqusJS 加载中信息
    this.msg(`评论基础模式加载中... ${HTML_TPL_EL_ASK_FOR_FULL}`)
    this.assignClickEventForAskForFulButton()

    /*
     * 获取 Thread 信息
     * Disqus API 只支持通过 Thread ID 获取评论列表，所以必须先通过 identifier 获取当前页面 Thread ID
     *
     * API Docs: https://disqus.com/api/docs/threads/list/
     * API URI: /3.0/threads/list.json?forum=[disqus_shortname]&thread=ident:[identifier]&api_key=[apikey]
     */
    const url = `${this.config.api}3.0/threads/list.json?forum=${encodeURIComponent(
      this.config.shortname
    )}&thread=${encodeURIComponent(`ident:${this.config.identifier}`)}&api_key=${encodeURIComponent(this.apikey())}`

    this._get(url)
      .then(({ data }) => {
        if (data.code === 0 && data.response.length === 1) {
          const { id, title, isClosed, posts: length } = data.response[0]
          this.page = { id, title, isClosed, length, comment: [] }

          // 在 #disqus_thread 中填充 DisqusJS Container
          $$(
            DISQUS_CONTAINER_EL_ID
          ).innerHTML = `<div id="dsqjs"><div id="dsqjs-msg">评论基础模式加载中... ${HTML_TPL_EL_ASK_FOR_FULL}</div>${HTML_TPL_EL_HEADER(
            length,
            this.config.siteName
          )}<section class="dsqjs-post-container"><ul class="dsqjs-post-list" id="dsqjs-post-container"><p class="dsqjs-no-comment">评论列表加载中...</p></ul><a id="dsqjs-load-more" class="dsqjs-load-more dsqjs-hide">加载更多评论</a></section>${HTML_TPL_EL_FOOTER}</div>`

          this.assignClickEventForAskForFulButton()

          $$(`dsqjs-order-${this.sortType}`).setAttribute('checked', 'true')

          // 获取评论列表
          getComment()
        } else if (data.code === 0 && data.response.length !== 1) {
          // 当前页面可能还未初始化（需要创建 thread）
          // Disqus API 的 threads/create 需要在服务端发起请求，不支持 AJAX Call
          this.msg(
            '当前 Thread 尚未创建。是否切换至 <a id="dsqjs-force-disqus" class="dsqjs-msg-btn">完整 Disqus 模式</a>？'
          )
          $$('dsqjs-force-disqus').addEventListener(CLICK, this.useDisqus)
        } else {
          throw new Error()
        }
      })
      .catch(this.loadError)

    /**
     * getComment(cursor) - 获取评论列表
     *
     * @param {String} cursor - 传入 cursor 用于加载下一页的评论
     */
    const getComment = (cursor = '') => {
      const $loadMoreBtn = $$('dsqjs-load-more')
      const $orderRadio = document.getElementsByClassName('dsqjs-order-radio')
      const $loadHideCommentInDisqus = document.getElementsByClassName('dsqjs-has-more-btn')

      const unregisterListenerForSwitchTypeRadioAndGetMoreCommentBtn = () => {
        // 为按钮们取消事件，避免重复绑定
        // 重新 getComment() 时会重新绑定
        Array.prototype.slice.call($orderRadio).forEach((i) => i.removeEventListener('change', switchSortType))
        $loadMoreBtn.removeEventListener(CLICK, getMoreComment)
        Array.prototype.slice
          .call($loadHideCommentInDisqus)
          .forEach((i) => i.removeEventListener(CLICK, this.checkDisqus))
      }

      const getMoreComment = () => {
        unregisterListenerForSwitchTypeRadioAndGetMoreCommentBtn()
        // 加载下一页评论
        getComment(this.page.next)
      }

      const getCommentError = () => {
        if (cursor === '') {
          this.loadError()
        } else {
          $loadMoreBtn.classList.remove('dsqjs-disabled')
          // 在按钮上显示提示信息
          $loadMoreBtn.innerHTML = '加载更多评论失败，点击重试'
          // 重新在按钮上绑定 加载更多按钮
          $loadMoreBtn.addEventListener(CLICK, getMoreComment)
        }
      }

      // 切换排序方式
      const switchSortType = ({ target }) => {
        // 通过 event.target 获取被选中的按钮
        this.sortType = target.getAttribute('value')
        // 将结果在 localStorage 中持久化
        setLS(DSQJS_STORAGE_KEY_SORT_TYPE, this.sortType)
        unregisterListenerForSwitchTypeRadioAndGetMoreCommentBtn()

        // 清空评论列表和其它参数
        this.page.comment = []
        this.page.next = '' // 不然切换排序方式以后以后加载更多评论就会重复加载

        // 显示加载中提示信息
        // 反正只有评论基础模式已经加载成功了才会看到排序选项，所以无所谓再提示一次 Disqus 不可访问了
        $$('dsqjs-post-container').innerHTML = '<p class="dsqjs-no-comment">正在切换排序方式...</p>'
        // 把 加载更多评论 隐藏起来
        $loadMoreBtn.classList.add('dsqjs-hide')
        getComment()
      }

      // 处理传入的 cursor
      const cursorParam = cursor === '' ? '' : `&cursor=${cursor}`

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
      const sortCommentParseDate = (/** @type {DisqusComment}*/ { createdAt }) =>
        Date.parse(new Date(createdAt).toString())
      /**
       *
       * @param {DisqusComment} a
       * @param {DisqusComment} b
       * @returns
       */
      const sortCommentparentAsc = (a, b) => {
        if (a.parent && b.parent) {
          return sortCommentParseDate(a) - sortCommentParseDate(b)
        } else {
          return 0
        }
      }

      const url = `${this.config.api}3.0/threads/listPostsThreaded?forum=${encodeURIComponent(
        this.config.shortname
      )}&thread=${encodeURIComponent(this.page.id || '')}${encodeURIComponent(
        cursorParam
      )}&api_key=${encodeURIComponent(this.apikey())}&order=${encodeURIComponent(this.sortType)}`

      this._get(url)
        .then(({ data }) => {
          if (data.code === 0 && data.response.length > 0) {
            // 解禁 加载更多评论
            $loadMoreBtn.classList.remove('dsqjs-disabled')

            // 将获得的评论数据和当前页面已有的评论数据合并
            this.page.comment?.push(...data.response)

            // 将所有的子评论进行降序排列
            this.page.comment?.sort(sortCommentparentAsc)

            // 用当前页面的所有评论数据进行渲染
            renderComment(this.page.comment)

            // 为排序按钮们委托事件
            Array.prototype.slice.call($orderRadio).forEach((i) => i.addEventListener('change', switchSortType))
            Array.prototype.slice
              .call($loadHideCommentInDisqus)
              .forEach((i) => i.addEventListener(CLICK, this.checkDisqus))

            if (data.cursor.hasNext) {
              // 将 cursor.next 存入 disqusjs 变量中供不能传参的不匿名函数使用
              this.page.next = data.cursor.next
              // 确保 加载更多评论按钮 文字正常
              $loadMoreBtn.innerHTML = '加载更多评论'
              // 显示 加载更多评论 按钮
              $loadMoreBtn.classList.remove('dsqjs-hide')
              $loadMoreBtn.addEventListener(CLICK, getMoreComment)
            } else {
              // 没有更多评论了，确保按钮隐藏
              $loadMoreBtn.classList.add('dsqjs-hide')
            }
          } else if (data.code === 0 && data.response.length === 0) {
            // 当前没有评论，显示提示信息
            this.msg(`你可能无法访问 Disqus，已启用评论基础模式。${HTML_TPL_EL_ASK_FOR_FULL}`)
            $$('dsqjs-post-container').innerHTML = `<p class="dsqjs-no-comment" >${this.config.nocomment}</p>`

            this.assignClickEventForAskForFulButton()

            $$('dsqjs-force-disqus').addEventListener(CLICK, this.useDsqjs)
          } else {
            throw new Error()
          }
        })
        .catch(getCommentError)
    }

    /**
     * parseCommentData(data) - 解析评论列表
     *
     * @param {Array} data - 评论列表 JSON
     * @return {Array} - 解析后的评论列表数据
     */
    const parseCommentData = (data) => {
      let topLevelComments = []
      let childComments = []

      const commentJSON = (comment) => ({
        comment,
        author: comment.author.name,

        // 如果不设置 admin 会返回 undefined，所以需要嘴一个判断
        isPrimary: this.config.admin ? comment.author.username === this.config.admin : false,

        children: getChildren(+comment.id),

        /*
         * Disqus 改变了 Private API 的行为
         * https://github.com/fooleap/disqus-php-api/issues/44
         * 默认隐藏更多的评论，通过 hasMore 字段判断
         */
        // 将 hasMore 字段提升到上层字段中
        hasMore: comment.hasMore
      })

      const getChildren = (id) => {
        // 如果没有子评论，就不需要解析子评论了
        if (childComments.length === 0) return null

        const list = []
        childComments.forEach((comment) => {
          if (comment.parent === id) {
            list.unshift(commentJSON(comment))
          }
        })

        return list.length ? list : null
      }

      data.forEach((comment) => {
        // 如果没有 comment.parent 说明是第一级评论
        const c = comment.parent ? childComments : topLevelComments
        c.push(comment)
      })
      return topLevelComments.map(commentJSON)
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
                  <a href="${data.comment.author.profileUrl}" ${HTML_TPL_A_ATTR}>
                      <img src="${data.comment.author.avatar.cache}">
                  </a>
                  Author Element
                  <span class="dsqjs-post-author">
                      <a href="${data.comment.author.profileUrl}" ${HTML_TPL_A_ATTR}>${data.comment.author.name}</a>
                  </span>
                  */
          data.comment.avatarEl = `<a href="${
            data.comment.author.profileUrl
          }" ${HTML_TPL_A_ATTR}><img src="${replaceDisquscdn(data.comment.author.avatar.cache)}"></a>`
          data.comment.authorEl = `<span class="dsqjs-post-author"><a href="${data.comment.author.profileUrl}" ${HTML_TPL_A_ATTR}>${data.comment.author.name}</a></span>`
        } else {
          data.comment.avatarEl = `<img src="${replaceDisquscdn(data.comment.author.avatar.cache)}">`
          data.comment.authorEl = `<span class="dsqjs-post-author">${data.comment.author.name}</span>`
        }

        // 处理 Admin Label
        // 需要同时设置 isPrimary 和 adminLabel；admin 已经在 processData() 中做过判断了
        if (this.config.adminLabel && data.isPrimary) {
          data.comment.authorEl += `<span class="dsqjs-admin-badge">${this.config.adminLabel}</span>`
        }

        return data
      }

      /**
       * removeDisqUs(input) - 将 comment 中的短链接 disq.us 去除
       * @param {String} input - 评论信息
       * @return {string} msg - 经过处理的评论信息
       */
      const removeDisqUs = (input) => {
        const el = document.createElement('div')
        el.innerHTML = input
        const aTag = el.getElementsByTagName('a')
        // Use Array.prototype.slice.call(aTag) instead of [...aTag] because when using gulp, [..aTag] may be replaced by [].concat(aTag), which is not the same meaning.
        Array.prototype.slice.call(aTag).forEach((i) => {
          const link = decodeURIComponent(i.href.replace(/https:\/\/disq\.us\/url\?url=/g, '')).replace(
            /(.*):.+cuid=.*/,
            '$1'
          )

          i.href = link
          i.innerHTML = link
          i.rel = 'external noopener nofollow noreferrer'
          i.target = '_blank'
        })

        return el.innerHTML
      }

      /**
       * replaceDisquscdn(str) - 将 a.disquscdn.com 替换为 c.disquscdn.com
       * @param {String} str - 字符串
       * @return {string} - 替换后的字符串
       */
      const replaceDisquscdn = (str) => str.replace(/a\.disquscdn\.com/g, 'c.disquscdn.com')

      const renderPostItem = (s) => {
        let authorEl = ''
        let message = ''
        if (s.isDeleted) {
          message = `<small>此评论已被删除</small>`
        } else {
          authorEl = `${s.authorEl}<span class="dsqjs-bullet"></span>`
          message = removeDisqUs(replaceDisquscdn(s.message))
        }

        return HTML_TPL_EL_COMMENT(s, authorEl, message)
      }

      const childrenComments = (data) => {
        const nesting = data.nesting
        const children = data.children || []

        if (!children) {
          return
        }

        let html = ''
        // 如果当前评论嵌套数大于 4 则不再右移
        if (nesting < this.config.nesting) {
          html = '<ul class="dsqjs-post-list dsqjs-children">'
        } else {
          html = '<ul class="dsqjs-post-list">'
        }

        children.map((comment) => {
          comment = processData(comment)
          comment.nesting = nesting + 1

          // 处理可能存在的隐藏回复
          const hasMoreEl = comment.hasMore
            ? `<p class="dsqjs-has-more">切换至 <a class="dsqjs-has-more-btn" id="load-more-${comment.comment.id}" data-more-id="comment-${comment.comment.id}">完整 Disqus 模式</a> 显示更多回复</p>`
            : ''

          html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(
            comment.comment
          )}${childrenComments(comment)}${hasMoreEl}</li>`
        })

        html += '</ul>'

        if (html.length !== 0) {
          return html
        } else {
          return
        }
      }

      let html = ''

      parseCommentData(data).map((comment) => {
        // 如果有子评论，设置当前评论前套数为 1
        if (comment.children) {
          comment.nesting = 1
        }
        comment = processData(comment)

        // 处理可能存在的隐藏回复
        let hasMoreEl = ''
        if (comment.hasMore) {
          hasMoreEl = `<p class="dsqjs-has-more">切换至 <a id="load-more-${comment.comment.id}">完整 Disqus 模式</a> 显示更多回复</p>`
        }

        html += `<li data-id="comment-${comment.comment.id}" id="comment-${comment.comment.id}">${renderPostItem(
          comment.comment
        )}${childrenComments(comment)}${hasMoreEl}</li>`
      })

      // 增加提示信息
      this.msg(`你可能无法访问 Disqus，已启用评论基础模式。${HTML_TPL_EL_ASK_FOR_FULL}`)

      $$('dsqjs-post-container').innerHTML = html

      // 为 checkDisqus 和 useDsqjs 按钮添加事件
      this.assignClickEventForAskForFulButton()
    }
  }
  /**
   * loadError() - 评论基础模式加载出现错误
   */
  loadError(err) {
    console.log(err)
    this.msg(
      '评论基础模式加载失败，是否 <a id="dsqjs-reload-dsqjs" class="dsqjs-msg-btn">重载</a> 或 <a id="dsqjs-reload-disqus" class="dsqjs-msg-btn">尝试完整 Disqus 模式</a> ？'
    )

    $$('dsqjs-reload-dsqjs').addEventListener(CLICK, this.loadDsqjs)
    $$('dsqjs-reload-disqus').addEventListener(CLICK, this.checkDisqus)
  }

  apikey() {
    const disqusJsApiKeys = this.config.apikey
    return Array.isArray(disqusJsApiKeys)
      ? disqusJsApiKeys[Math.floor(Math.random() * disqusJsApiKeys.length)]
      : disqusJsApiKeys
  }
  initDsqjs() {
    this.mode = /** @type {DisqusJSMode['mode']} */ (localStorage.getItem('dsqjs_mode'))
    this.sortType = localStorage.getItem(DSQJS_STORAGE_KEY_SORT_TYPE) || localStorage.getItem('disqus.sort')

    if (!this.sortType) {
      setLS(DSQJS_STORAGE_KEY_SORT_TYPE, 'desc')
      this.sortType = 'desc'
    }
    if (this.mode === 'disqus') {
      this.loadDisqus()
    } else if (this.mode === 'dsqjs') {
      this.loadDsqjs()
    } else {
      // 没有在 localStorage 中找到 disqusjs_mode 相关内容，开始检查访客的 Disqus 可用性
      // 也作为不支持 localStorage 的浏览器的 fallback
      this.checkDisqus()
    }
  }
}

export default DisqusJS
