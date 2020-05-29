# DisqusJS

> 纯前端、超轻量级的「评论基础模式」实现：使用 Disqus API 渲染评论列表

[![npm version](https://img.shields.io/npm/v/disqusjs.svg?style=flat-square)](https://www.npmjs.com/package/disqusjs)
[![Author](https://img.shields.io/badge/Author-Sukka-b68469.svg?style=flat-square)](https://skk.moe)
[![npm license](https://img.shields.io/npm/l/disqusjs.svg?style=flat-square)](https://github.com/SukkaW/DisqusJS/blob/master/LICENSE)
[![Size](https://badge-size.herokuapp.com/SukkaW/DisqusJS/master/dist/disqus.js?compression=gzip&style=flat-square)](https://github.com/SukkaW/DisqusJS/tree/master/dist)
[![Travis](https://img.shields.io/travis/SukkaW/DisqusJS.svg?style=flat-square)](https://travis-ci.org/SukkaW/DisqusJS)
[![Codacy Badge](https://img.shields.io/codacy/grade/20babb75dd6047c2828f231e7254bb5b.svg?style=flat-square)](https://app.codacy.com/app/SukkaW/DisqusJS)
[![Dependency Status](https://img.shields.io/david/SukkaW/DisqusJS.svg?style=flat-square)](https://david-dm.org/SukkaW/DisqusJS)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/disqusjs/badge)](https://www.jsdelivr.com/package/npm/disqusjs)

## 简介

使用 Disqus API 获取到的数据渲染评论列表，搭配 Disqus API 的反代可以实现在网络审查地区加载 Disqus 评论列表；支持自动检测访客的 Disqus 可用性自动选择加载原生 Disqus（评论完整模式）和 DisqusJS 提供的评论基础模式。

## 功能

- 展示评论列表、支持按照「最新」、「最早」、「最佳」排序
- 判断访客能否访问 Disqus、自动选择「评论基础模式」或「Disqus 完整模式」

## Demo

- https://disqusjs.skk.moe
- https://blog.skk.moe

## 使用

### 安装

#### 直接引入

首先下载 [经过编译和压缩的 DisqusJS 相关文件](https://github.com/SukkaW/DisqusJS/tree/master/dist)，在你需要安装 DisqusJS 的页面的 `</head>` 之前引入 DisqusJS 的 css，在需要在需要显示评论的位置引入 DisqusJS 的 js：

```html
<link rel="stylesheet" href="disqusjs.css">
```

```html
<script src="disqus.js"></script>
```

你也可以使用 CDN 加载上述文件：

```html
<!-- Unpkg -->
<link rel="stylesheet" href="https://unpkg.com/disqusjs@1.3/dist/disqusjs.css">
<script src="https://unpkg.com/disqusjs@1.3/dist/disqus.js"></script>

<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/disqusjs@1.3/dist/disqusjs.css">
<script src="https://cdn.jsdelivr.net/npm/disqusjs@1.3dist/disqus.js"></script>
```

DisqusJS 从 v1.3.0 版本开始使用 Fetch API 代替 XMLHttpRequest，因此不再兼容低于 IE 11 的老旧浏览器。这些浏览器将会收到如下提示：

```
你的浏览器版本过低，不兼容评论基础模式。如需完整体验请针对 disq.us | disquscdn.com | disqus.com 启用代理并尝试完整 Disqus 模式
```

如果需要为 IE8 及以上浏览器提供 DisqusJS 评论基础模式的兼容性支持，请在 DisqusJS 加载之前添加如下的 Polyfill：

```html
<!-- Promise Polyfill -->
<script src="https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js"></script>
<!-- Fetch Polyfill -->
<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.0.0/dist/fetch.umd.min.js"></script>
```

#### 从 NPM 安装

你可以轻松将 DisqusJS 引入你现有的项目：

```bash
npm i --save disqusjs
```

```js
import 'disqusjs/dist/disqusjs.css'
import DisqusJS from 'disqusjs'
```

### 使用

创建一个 DisqusJS 的容器：

```html
<div id="disqus_thread"></div>
```

> 这个容器和 Disqus 原版评论的容器相同。

使用下述代码初始化一个 DisqusJS 实例，注意初始化需在 DisqusJS 加载完成后执行：

```html
<script>
var dsqjs = new DisqusJS({
    shortname: '',
    siteName: '',
    identifier: '',
    url: '',
    title: '',
    api: '',
    apikey: '',
    admin: '',
    adminLabel: ''
});
</script>
```

完成上述步骤后，DisqusJS 就已经在您的站点安装好了，但是你现在还不能使用它。要使用 DisqusJS，你还需要进行一些配置。

### 配置 Disqus Application

在 [Disqus API Application](https://disqus.com/api/applications/) 处注册一个 Application。

![](https://i.loli.net/2018/10/08/5bbb71f99369d.png)

点击新创建的 Application，获取你的 API Key（公钥）。

![](https://i.loli.net/2018/10/08/5bbb723acbe07.png)

在 Application 的 Settings 页面设置你的域名，Disqus 会检查 API 请求的 Referrer。

![](https://i.loli.net/2018/10/08/5bbb735b9d2a4.png)

### 配置 DisqusJS 参数

**shortname** `{string}`

- 你的 Disqus Forum 的 shortname，你可以在 [Disqus Admin - Settings - General - Shortname](https://disqus.com/admin/settings/general/) 获取你的 shortname
- **必须**，无默认值

**siteName** `{string}`

- 你站点的名称，将会显示在「评论基础模式」的 header 中；该配置应该和 [Disqus Admin - Settings - General - Website Name](https://disqus.com/admin/settings/general/) 一致
- 非必须，无默认值

**identifier** `{string}`

- 当前页面的 identifier，用来区分不同页面
- **建议**，默认值为 `document.location.origin + document.location.pathname + document.location.search`

**url** `{string}`

- 当前页面的 URL，Disqus 的爬虫会爬取该 URL 获取页面相关信息
- **建议**，默认值为 `document.location.origin + document.location.pathname + document.location.search`

**title** `{string}`

- 当前页面的标题，如果没有设置默认为当前页面的标题。当页面标题中有其他信息（比如站点名称）而不想在 Disqus 中展示时，可以设置此项。
- 非必须，默认值为 `document.title`

**api** `{string}`

- DisqusJS 请求的 API Endpoint，通常情况下你应该配置一个 Disqus API 的反代并填入反代的地址。你也可以直接使用 DISQUS 官方 API 的 Endpoint `https://disqus.com/api/`，或是使用我搭建的 Disqus API 反代 Endpoint `https://disqus.skk.moe/disqus/`。如有必要可以阅读关于搭建反代的 [相关内容](https://github.com/SukkaW/DisqusJS#%E8%B0%83%E8%AF%95%E8%BF%9B%E9%98%B6%E4%BD%BF%E7%94%A8--%E5%BC%80%E5%8F%91%E7%9B%B8%E5%85%B3)
- **建议**，默认值为 `https://disqus.skk.moe/disqus/`

**apikey** `{string || Array}`

- DisqusJS 向 API 发起请求时使用的 API Key，你应该在配置 Disqus Application 时获取了 API Key
- DisqusJS 支持填入一个 包含多个 API Key 的 Array，在每次请求时会随机使用其中一个；如果你只填入一个 API Key，可以填入 string 或 Array。
- **必填**，无默认值

**nesting** `{Number}`

- 最大评论嵌套数；超过嵌套层数的评论，会不论从属关系显示在同一层级下
- 非必须，默认值为 `4`

**nocomment** `{Number}`

- 没有评论时的提示语（对应 Disqus Admin - Settings - Community - Comment Count Link - Zero comments）
- 非必须，默认值为 `这里冷冷清清的，一条评论都没有`

---

以下配置和 Disqus Moderator Badge 相关，缺少一个都不会显示 Badge

**admin** `{string}`

- 你的站点的 Disqus Moderator 的用户名（也就是你的用户名）。你可以在 [Disqus - Settings - Account - Username](https://disqus.com/home/settings/account/) 获取你的 Username
- 非必须，无默认值

**adminLabel** `{string}`

- 你想显示在 Disqus Moderator Badge 中的文字。该配置应和 [Disqus Admin - Settings - Community - Moderator Badge Text](https://disqus.com/admin/settings/community/) 相同
- 非必须，无默认值

### PJAX 站点注意事项

如果你在使用 DisqusJS v0.2.5 版本，需要在 PJAX 的页面跳转事件下销毁 Disqus 实例（Disqus 不支持 PJAX）、并通过 `window.disqusjs.load();` 重新加载 DisqusJS。DisqusJS v0.2.5 版本支持自动判断当前页面是否存在 `#disqus_thread` 容器，如果容器不存在就不加载。

DisqusJS v1.0.0 及之后的版本使用了新的方法加载 DisqusJS，并去除了对 `#disqus_thread` 容器的判断，在没有容器的页面初始化 DisqusJS 实例会报错。在切换页面时需要销毁已有的 Disqus 实例和 DisqusJS 实例，然后重新初始化一个新的 DisqusJS 实例。

DisqusJS v1.2.6 开始支持检测是否存在 Disqus 实例，并在加载 Disqus 时直接调用 `DISQUS.reset()` 方法重载 Disqus 评论，无需用户手动销毁现有的 Disqus 实例。

代码可以参考 [DIYgod 的这条 commit](https://github.com/DIYgod/diygod.me/commit/31012c21a457df5ab172c2e24bc197d5a0de8e69#diff-566630479f69d2ba36b6b996f6ba5a8f)，DIYgod 在这次 commit 中将 DisqusJS 从 v0.2.5 升级到了 v1.0.8。

## 如何搭建 Disqus API 反代

使用 Caddy 或者 Nginx 都可以搭建一个反代服务器，需要反代的 Endpoint 是 `https://disqus.com/api/`。这里介绍的是针对不使用服务器和后端程序，使用 Serverless 平台搭建 Disqus API 反代的方法。

> 当然，你也可以直接使用我搭建的反代 `https://disqus.skk.moe/disqus/`。

### Vercel (ZEIT Now)

[ZEIT Now](https://zeit.co) 是一个 Serverless 平台。免费 Plan 提供每月 100 GiB 流量和无限的请求次数。
[sukkaw/disqusjs-proxy-example](https://github.com/SukkaW/disqusjs-proxy-example) 提供了一个使用 Now Router 进行反代的样例配置文件。

### Cloudflare Workers

[Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/) 提供了一个在 Cloudflare 上运行 JavaScript 的平台。免费 Plan 可提供每天 `100000` 次免费请求次数额度。
[idawnlight/disqusjs-proxy-cloudflare-workers](https://github.com/idawnlight/disqusjs-proxy-cloudflare-workers) 提供了一份使用 Cloudflare Workers 进行反代的样例代码。

### Heroku

[Heroku](https://www.heroku.com/) 是一个支持多种编程语言的 SaaS 平台。不绑定信用卡每月有 550 小时的免费运行时间、绑定信用卡后每月有 1000 小时的免费运行时间。
[ysc3839/disqusjs-proxy](https://github.com/ysc3839/disqusjs-proxy) 提供了一个直接部署至 Heroku 的 Disqus API 反代项目。你可以点击 [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ysc3839/disqusjs-proxy) 直接部署。

### Firebase

[Firebase Cloud Functions](https://firebase.google.com/products/functions/) 提供了执行 Node.js 代码的 Serverless 平台。需绑定银行卡 (Visa 或 MasterCard) 才能启用互联网出站访问功能。
[ysc3839/disqusjs-proxy 的 `firebase` 分支](https://github.com/ysc3839/disqusjs-proxy/tree/firebase) 提供了一个可以部署在 Firebase 上的反代样例。

## 注意

- Disqus API 不支持通过 AJAX 方式调用创建评论或者初始化页面，所以自动初始化页面和创建匿名评论在不搭配专门的后端程序的话不能实现。
  - Disqus API 会检查请求是否包含 `Origin`、`X-Request-With` 等响应头、拦截 AJAX 请求。就算 Disqus API 不做检查，把你的私钥和公钥一起明文写在前端也是 **十分愚蠢** 的
- 所以如果 DisqusJS 检测到当前页面没有初始化、会提示是否切换到 Disqus 完整模式进行初始化。
- DisqusJS 仅在当前域名首次访问时检测 Disqus 可用性并选择模式，并把结果持久化在 localStorage 中，之后访问都会沿用之前的模式。
  - 一些广告拦截规则（如 [Fanboy’s Enhanced Tracking List](https://github.com/ryanbr/fanboy-adblock)） 会导致检测失败，可在广告拦截器的自定义规则中添加 `@@||*disqus*.com/favicon.ico*` 解决。当然你不必担心访客，因为 DisqusJS 会提供 `尝试 Disqus 完整模式 | 强制 Disqus 完整模式` 的按钮供访客切换。
- 一个 Disqus Application 的 Rate Limit 是每小时 1000 次；DisqusJS 一次正常加载会产生 2 次请求。DisqusJS 支持将多个 API Key 填入一个 Array 中，并在请求时随机选择（负载均衡）。你可以创建多个 Disqus API Application 并分别获取 API Key。
- 我搭建了一个 Disqus API 反代的服务 `https://disqus.skk.moe/disqus/` 供没有能力搭建反代的用户使用，不保证 SLA、缓存 TTL 3 小时。

## 谁在使用 DisqusJS？

- Sukka: [Sukka's Blog](https://blog.skk.moe)
- DIYgod: [Hi, DIYgod](https://diygod.me) ([source](https://github.com/DIYgod/diygod.me))
- imlonghao: [Imlonghao](https://imlonghao.com/)
- Yrom Wang: [Yrom's](https://yrom.net/) (Still using DisqusJS v0.2.5)
- h404bi: [Chawye Hsu's Blog](https://www.h404bi.com/blog/) ([source](https://github.com/h404bi/www.h404bi.com))
- ysc3839: [YSC's blog](https://blog.ysc3839.com/)

如果你的站点或者个人博客在使用 DisqusJS，来 [把你的网站分享给其他人吧](https://github.com/SukkaW/DisqusJS/issues/12)！

## 调试、进阶使用 & 开发相关

- ~~`a.disquscdn.com` 和 ~~`c.disquscdn.com` 解析到 Cloudflare 而不是 Fastly，可用性大大增强；`disqus.com` 和 `shortname.disqus.com` 仍然被墙；`disq.us` 解析到 Fastly 连通性较差，DisqusJS 通过解析获得了原链接。
- `a.disquscdn.com` 重新解析到 Fastly，可用性不如 `c.disquscdn.com`，DisqusJS 内部已增加替换 `a.disquscdn.com` 为 `c.disquscdn.com` 以改善速度。
- DisqusJS 检测访客的 Disqus 可用性是通过检测 `disqus.com/favicon.ico` 和 `${disqusjs.config.shortname}.disqus.com/favicon.ico` 是否能正常加载，如果有一个加载出错或超时（2s）就判定 Disqus 不可用。
- DisqusJS 在 localStorage 中持久化了 Disqus 连通性检查结果，key 为 `dsqjs_mode`，value 为 `disqus` 或者 `dsqjs`。需要调整 DisqusJS 的模式时可以直接操作 localStorage。
- Disqus 自己的 config 保存在全局变量 `window.disqus_config` 中，你可能好奇为什么没有引入。实际上由于 `disqus_config` 和 DisqusJS 中有很多重复的配置，所以 DisqusJS 直接将相关配置项赋给了 `disqus_config`，所以用户只需要配置 DisqusJS 即可。
- DisqusJS 并没有使用 Webpack 将 `disqusjs.css` 和 `disqus.js` 打包在一起，大家可以开发自己的 DisqusJS 主题。所有 DisqusJS 创建的 HTML 元素都包裹在 `<div id="dsqjs"></div>` 之中、几乎所有的元素都有自己的类名并都以 `dsqjs-` 为前缀，防止污染。
- DisqusJS 从 v1.2.0 版本开始实现了评论排序。Disqus 将评论排序方式持久化在 localStorage 中、key 为 `disqus.sort`，DisqusJS 沿用了这一位置。

## Todo List

[DisqusJS GitHub Project](https://github.com/SukkaW/DisqusJS/projects/1)

## Author 作者

**DisqusJS** © [Sukka](https://github.com/SukkaW), Released under the [MIT](https://github.com/SukkaW/DisqusJS/blob/master/LICENSE) License.<br>
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/DisqusJS/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Twitter [@isukkaw](https://twitter.com/isukkaw) · Keybase [@sukka](https://keybase.io/sukka)
