# DisqusJS

https://disqusjs.skk.moe

> 纯前端、超轻量级的「评论基础模式」实现：使用 Disqus API 渲染评论列表

[![npm version](https://img.shields.io/npm/v/disqusjs.svg?style=flat-square)](https://www.npmjs.com/package/disqusjs) [![Author](https://img.shields.io/badge/Author-Sukka-b68469.svg?style=flat-square)](https://skk.moe) [![npm license](https://img.shields.io/npm/l/disqusjs.svg?style=flat-square)](https://github.com/SukkaW/DisqusJS/blob/master/LICENSE) [![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/disqusjs/badge)](https://www.jsdelivr.com/package/npm/disqusjs)

## 简介

DisqusJS 是一个基于 Disqus API 和 React 开发的 Embed 插件。DisqusJS 通过 Disqus API 渲染只读的评论列表，搭配反向代理可以实现在网络审查地区加载 Disqus 评论列表；支持自动检测访客是否能够访问 Disqus、并自动选择加载原生 Disqus（评论完整模式）或 DisqusJS 提供的评论基础模式。

## 功能

- 判断访客能否访问 Disqus、自动选择「评论基础模式」或「Disqus 完整模式」
- 展示评论列表、支持按照「最新」、「最早」、「最佳」排序
- 可搭配 React（Gatsby、Next.js）使用

## Demo

- https://disqusjs.skk.moe
- https://blog.skk.moe

## 安装和使用

### 在 HTML 中直接引入

在你需要安装 DisqusJS 的页面的 `</head>` 之前引入 DisqusJS 的 CSS：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/disqusjs@3.0/dist/browser/styles/disqusjs.css">
```

在需要展示评论的地方插入 JS：

```html
<script src="https://cdn.jsdelivr.net/npm/disqusjs@3.0/dist/browser/disqusjs.es2015.umd.min.js"></script>

<!-- 如果你只兼容现代浏览器，你也可以使用 ES Module -->
<script type="module">
  import DisqusJS from 'https://cdn.jsdelivr.net/npm/disqusjs@3.0/dist/browser/disqusjs.es2018.es.min.mjs'
</script>
```

接着创建一个 DisqusJS 容器：

```html
<div id="disqusjs"></div>
```

### 通过 NPM 安装

```sh
npm i disqusjs
# Yarn
# yarn add disqusjs
# pnpm
# pnpm add disqusjs
```

然后在项目中引入 DisqusJS：

```js
// CommonJS
const DisqusJS = require('disqusjs/es2015');
// const DisqusJS = require('disqusjs/es2017');
// const DisqusJS = require('disqusjs/es2022');

// ES Module
import DisqusJS from 'disqusjs/es2015';
// import DisqusJS from 'disqusjs/es2017';
// import DisqusJS from 'disqusjs/es2022';
```

注意，你仍然需要手动引入 DisqusJS 的 CSS：

```js
import 'disqusjs/disqusjs.css';
```

---

使用下述代码初始化一个 DisqusJS 实例。注意初始化需在 DisqusJS 加载完成后进行：

```js
const disqusjs = new DisqusJS({
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
```

接下来，我们需要让 DisqusJS 实例将评论组件渲染到页面上：

```js
disqusjs.render(document.getElementById('disqusjs'));
// 你也可以传入一个 CSS 选择器
// disqusjs.render('#disqusjs');
```

### 作为 React 组件使用

```jsx
import 'disqusjs/react/styles/disqusjs.css';
import { DisqusJS } from 'disqusjs/react/es2015';
// import { DisqusJS } from 'disqusjs/es2017';
// import { DisqusJS } from 'disqusjs/es2022';
// const { DisqusJS } = require('disqusjs/es2015');
// const { DisqusJS } = require('disqusjs/es2017');
// const { DisqusJS } = require('disqusjs/es2022');

<DisqusJS
  shortname=""
  siteName=""
  identifier=""
  url=""
  api=""
  apikey=""
  admin=""
  adminLabel=""
/>
```

---

完成上述步骤后，DisqusJS 就已经在您的站点安装好了，但是你现在还不能使用它。要使用 DisqusJS，你还需要进行一些配置。

### 配置 Disqus Application

在 [Disqus API Application](https://disqus.com/api/applications/) 处注册一个 Application。

![](https://i.loli.net/2018/10/08/5bbb71f99369d.png)

点击新创建的 Application，获取你的 API Key（公钥）。

![](https://i.loli.net/2018/10/08/5bbb723acbe07.png)

在 Application 的 Settings 页面设置你使用 DisqusJS 时的域名。Disqus API 会检查 API 请求的 Referrer 和 Origin。

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

**apikey** `{string | string[]}`

- DisqusJS 向 API 发起请求时使用的 API Key，你应该在配置 Disqus Application 时获取了 API Key
- DisqusJS 支持填入一个 包含多个 API Key 的数组，每次请求时会随机使用其中一个；如果你只填入一个 API Key，可以填入 string 或 Array。
- **必填**，无默认值

**nesting** `{number}`

- 最大评论嵌套数；超过嵌套层数的评论，会不论从属关系显示在同一层级下
- 非必须，默认值为 `4`

**nocomment** `{string}`

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

### SPA 与 PJAX 站点注意事项

如果你在 React SPA、Next.js、Gatsby 中以 React 组件的形式使用 DisqusJS，无需任何额外步骤，只需修改 `<DisqusJS />` 组件的 prop，DisqusJS 会自动更新。

如果你在 PJAX 站点中使用，需要在页面 unload 之前手动销毁 DisqusJS 实例，并新页面 load 后重新渲染一个 DisqusJS 实例：

```js
let disqusjs = null;
// 初始化 DisqusJS 实例
disqusjs = new DisqusJS({
  // ...
});
// 将 DisqusJS 渲染到页面上
disqusjs.render(document.getElementById('disqusjs'));

document.addEventListener('pjax:send', () => {
  // 销毁 DisqusJS 实例
  disqusjs.destroy();
});

document.addEventListener('pjax:complete', () => {
  // 使用新的参数（如新的 identifier 和 url）创建全新的 DisqusJS 实例
  disqusjs = new DisqusJS({
    // ...
  });
  // 渲染新的 DisqusJS
  disqusjs.render(document.getElementById('disqusjs'));
});
```

## 如何搭建 Disqus API 反代

使用 Caddy 或者 Nginx 都可以搭建一个反代服务器，需要反代的 Endpoint 是 `https://disqus.com/api/`。这里介绍的是针对不使用服务器和后端程序，使用 Serverless 平台搭建 Disqus API 反代的方法。

### Vercel

[Vercel](https://vercel.com) 是一个 Serverless 平台。免费的 Hobby Plan 提供每月 100 GiB 流量和无限的请求次数。
[sukkaw/disqusjs-proxy-example](https://github.com/SukkaW/disqusjs-proxy-example) 提供了一个使用 Now Router 进行反代的样例配置文件。

### Cloudflare Workers

[Cloudflare Workers](https://www.cloudflare.com/products/cloudflare-workers/) 提供了一个在 Cloudflare 上运行 JavaScript 的平台。免费 Plan 可提供每天 `100000` 次免费请求次数额度。
[idawnlight/disqusjs-proxy-cloudflare-workers](https://github.com/idawnlight/disqusjs-proxy-cloudflare-workers) 提供了一份使用 Cloudflare Workers 进行反代的样例代码。

### Firebase

[Firebase Cloud Functions](https://firebase.google.com/products/functions/) 提供了执行 Node.js 代码的 Serverless 平台。需绑定银行卡 (Visa 或 MasterCard) 才能启用互联网出站访问功能。
[ysc3839/disqusjs-proxy 的 `firebase` 分支](https://github.com/ysc3839/disqusjs-proxy/tree/firebase) 提供了一个可以部署在 Firebase 上的反代样例。

## 注意事项

- Disqus API 不支持通过 AJAX 方式调用创建评论或者初始化页面，所以自动初始化页面和创建匿名评论在不搭配专门的后端程序的话不能实现。
  - Disqus API 会检查请求是否包含 `Origin`、`X-Request-With` 等响应头、拦截 AJAX 请求。就算 Disqus API 不做检查，把你的私钥和公钥一起明文写在前端也是 **十分愚蠢** 的
- 所以如果 DisqusJS 检测到当前页面没有初始化、会提示是否切换到 Disqus 完整模式进行初始化。
- DisqusJS 仅在当前域名首次访问时检测 Disqus 可用性并选择模式，并把结果持久化在 localStorage 中，之后访问都会沿用之前的模式。
- 一个 Disqus Application 的 Rate Limit 是每小时 1000 次；DisqusJS 一次正常加载会产生 2 次请求。DisqusJS 支持将多个 API Key 填入一个 Array 中，并在请求时随机选择（负载均衡）。你可以创建多个 Disqus API Application 并分别获取 API Key。

## 从 DisqusJS 1.3.0 升级到 DisqusJS 3.0.0

```html
<!-- 替换 DisqusJS 版本 -->
<!--<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/disqusjs@1.3/dist/disqusjs.css">-->
<!--<script src="https://cdn.jsdelivr.net/npm/disqusjs@1.3/dist/disqus.js"></script>-->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/disqusjs@3.0/dist/browser/styles/disqusjs.css">
<script src="https://cdn.jsdelivr.net/npm/disqusjs@3.0/dist/browser/disqusjs.es2015.umd.min.js"></script>

<!--
  DisqusJS 1.3.0 容器的 id 属性必须是 `disqus_thread`，
  DisqusJS 3.0.0 容器的 id 属性 **必须不是** `disqus_thread`。
  建议使用 "disqusjs" 作为 DisqusJS 容器的 id 属性。
-->
<!--<div id="disqus_thread"></div>-->
<div id="disqusjs"></div>
<script>
  const disqusjs = new DisqusJS({
    // DisqusJS 1.3.0 和 DisqusJS 3.0.0 配置完全兼容，无需更改
    // ...
  });

  // DisqusJS 1.3.0 在初始化实例后评论列表已经开始渲染到页面上，DisqusJS 3.0.0 还需要额外调用 render() 方法：
  disqusjs.render(document.getElementById('disqusjs')); // render() 方法需要传入 DisqusJS 的容器

  // DisqusJS 3.0.0 新增了销毁实例的 destroy() 方法，你可以在 PJAX 跳转时直接调用它：
  disqusjs.destroy();
  // 关于 PJAX 站点使用，请参考前文「SPA 与 PJAX 站点注意事项」
</script>
```

## 谁在使用 DisqusJS？

- Sukka: [Sukka's Blog](https://blog.skk.moe)
- Yrom Wang: [Yrom's](https://yrom.net/) (Still using DisqusJS v0.2.5)
- chawyehsu: [The Art of Chawye Hsu](https://chawyehsu.com) ([source](https://github.com/chawyehsu/chawyehsu.com))
- ysc3839: [YSC's blog](https://blog.ysc3839.com/)
- JiPai: [JiPai Store](https://blog.jipai.moe/)
- GodU: [U](https://godu.ink/)
- bmyjacks: [Hey Bro, Wassup?](https://www.dreamsafari.info/)
- 若风: [青菜芋子](https://loafing.cn/)
- Ward Chen:[WardChan 的小站](https://blog.wardchan.com/)
- jubyshu:[渚碧](https://jubeny.com/)
- V2beach:[V2beach's Blog](https://blog.v2beach.cn/)


如果你的站点或者个人博客在使用 DisqusJS，来 [把你的网站分享给其他人吧](https://github.com/SukkaW/DisqusJS/issues/12)！

## Author 作者

**DisqusJS** © [Sukka](https://github.com/SukkaW), Released under the [MIT](https://github.com/SukkaW/DisqusJS/blob/master/LICENSE) License.<br>
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/DisqusJS/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · Keybase [@sukka](https://keybase.io/sukka)

<p align="center">
  <a href="https://github.com/sponsors/SukkaW/">
    <img src="https://sponsor.cdn.skk.moe/sponsors.svg"/>
  </a>
</p>
