# DisqusJS

> Alternative Disqus - Render comment component using Disqus API<br>
> Disqus 替代方案：使用 Disqus API 渲染评论列表

[![npm version](https://img.shields.io/npm/v/disqusjs.svg?style=flat-square)](https://www.npmjs.com/package/disqusjs)
[![Author](https://img.shields.io/badge/Author-Sukka-b68469.svg?style=flat-square)](https://skk.moe)
[![npm license](https://img.shields.io/npm/l/disqusjs.svg?style=flat-square)](https://github.com/SukkaW/suka.css/blob/master/LICENSE)
[![Size](https://badge-size.herokuapp.com/SukkaW/DisqusJS/master/dist/disqus.js?compression=gzip&style=flat-square)](https://github.com/SukkaW/suka.css/tree/master/dist)
[![Travis](https://img.shields.io/travis/SukkaW/DisqusJS.svg?style=flat-square)](https://travis-ci.org/SukkaW/DisqusJS)
[![Dependency Status](https://img.shields.io/david/SukkaW/DisqusJS.svg?style=flat-square)](https://david-dm.org/SukkaW/DisqusJS)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/disqusjs/badge)](https://www.jsdelivr.com/package/npm/disqusjs)

## 简介

使用 Disqus API 获取到的数据渲染评论列表，搭配 Disqus API 的反代可以实现在网络审查地区加载 Disqus 评论列表；支持自动检测访客的 Disqus 可用性自动选择加载原生 DISQUS（评论完整模式）和 DisqusJS 提供的评论基础模式。

## 功能

- [x] 展示评论列表
- [x] 自动判断访客的 DISQUS 可用性选择不同模式
- [ ] 展示评论中的媒体内容
- [ ] 自动初始化新页面（使用 `disqusjs.config.identifier`）
- [ ] 提交新评论（匿名）（WIP）

## 使用

### 安装

首先下载 [经过编译和压缩的 DisqusJS 相关文件](https://github.com/SukkaW/DisqusJS/tree/master/dist)，在你的站点需要安装  DisqusJS 的页面的 `</head>` 之前引入 DisqusJS 的 css、在 `</body>` 之前引入 Disqus 的 JS：

```html
<link rel="stylesheet" href="disqusjs.css">
```

```html
<script src="disqus.js"></script>
```

你也可以使用 CDN 加载上述文件：

```html
<!-- Unpkg -->
<link rel="stylesheet" href="https://unpkg.com/disqusjs@0.1.1/dist/disqusjs.css">
<script src="https://unpkg.com/disqusjs@0.1.1/dist/disqus.js"></script>
<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/disqusjs@0.1.1/dist/disqusjs.css">
<script src="https://cdn.jsdelivr.net/npm/disqusjs@0.1.1/dist/disqus.js"></script>
```

在需要显示评论的地方插入下述代码：

```html
<div id="disqus_thread"></div>
<script>
var disqusjs = [];
disqusjs.config = {
    shortname: '',
    identifier: '',
    url: '',
    api: '',
    apikey: '',
    admin: '',
    adminLabel: ''
};
</script>
```

完成上述步骤后，DisqusJS 就已经安装好了，但是你现在还不能使用它。要使用 DisqusJS，你还需要进行一些配置。

### 配置 Disqus Application

在 [Disqus API Application](https://disqus.com/api/applications/) 处注册一个 Application。

![](https://i.loli.net/2018/10/08/5bbb71f99369d.png)

点击新创建的 Application，获取你的 API Key（公钥）。

![](https://i.loli.net/2018/10/08/5bbb723acbe07.png)

在 Application 的 Settings 页面设置你的域名，Disqus 会检查 API 请求的 Referrer。

![](https://i.loli.net/2018/10/08/5bbb735b9d2a4.png)

### 配置 DisqusJS 参数

```
disqusjs.config {}
```

**shortname**

- 你的 Disqus Forum 的 shortname，你可以在 [Disqus Admin - Settings - General - Shortname](https://disqus.com/admin/settings/general/) 获取你的 shortname
- {String}
- **必填**，无默认值

**identifier**

- 你的页面的 identifier，用来区分不同页面
- {String}
- **必填**，无默认值

**url**

- 你的页面的 URL，Disqus 的爬虫会爬取该 URL 获取页面相关信息
- {String}
- **必填**，无默认值

**api**

- DisqusJS 请求的 API Endpoint，通常情况下你应该配置一个 Disqus API 的反代并填入反代的地址，或者直接使用 `https://disqus.com/api/`
- {String}
- **必填**，无默认值

**apikey**

- DisqusJS 向 API 发起请求时使用的 API Key，你应该在配置 Disqus Application 时获取了 API Key
- {String}
- **必填**，无默认值

以下配置和 Disqus Moderator Badge 相关

**admin**

- 你的站点的 Disqus Moderator 的用户名（也就是你的用户名）
- {String}
- **必填**，不使用 Badge 时配置为 `''`

**adminLabel**

- 你想显示在 Disqus Moderator Badge 中的文字。该配置应和 [Disqus Admin - Settings - Community - Moderator Badge Text](https://disqus.com/admin/settings/community/) 相同
- {String}
- **必填**，不使用 Badge 时配置为 `''`

---

未来可能扩展的配置：

- nesting 最大评论嵌套数（超过嵌套层数的评论会显示在同一层级下，目前该值采用 Disqus 官方 4 级嵌套且不可改变）
- nocomment 没有评论时的提示语（对应 Disqus Admin - Settings - Community - Comment Count Link - Zero comments）
- commentPolicyURL 站点评论政策 URL（对应 对应 Disqus Admin - Settings - General - Comment Policy URL）
- commentPolicyText 站点评论政策 URL（对应 对应 Disqus Admin - Settings - General - Comment Policy Summary）
- noavatar 默认头像的图片 URL（对应 对应 Disqus Admin - Settings - General - Default Commenter Avatar）
- newcomment 是否允许添加新评论（目前增加评论功能尚未实现）

## 注意

- ~~DisqusJS 尚不支持初始化一个新页面，在新创建了页面以后需要先使用原版 Disqus 访问一次该页面完成初始化。~~DisqusJS 如果检测到当前页面没有初始化、会提示是否切换到 Disqus 完整模式进行初始化。
- DisqusJS 仅在当前域名首次访问时检测 Disqus 可用性并选择模式，并把结果持久化在 localStorage 中，之后访问都会沿用之前的模式。

## 调试、进阶使用 & 开发相关

- `a.disquscdn.com` 和 `c.disquscdn.com` 解析到 Cloudflare 而不是 Fastly，可用性大大增强；部分地区 `disqus.com` 已经解封，但是 `shortname.disqus.com` 仍然被墙。
- DisqusJS 检测访客的 Disqus 可用性是通过检测 `disqus.com/favicon.ico` 和 `${disqusjs.config.shortname}.disqus.com/favicon.ico` 是否能正常加载，如果有一个加载出错或超时（2s）就判定 Disqus 不可用。
- 你应该已经注意到 DisqusJS 在页面注册了全局变量 `window.disqusjs`，你可以直接在控制台输入 `console.log(disqusjs)` 查看。关于里面每个子串的含义全部标注在 [DisqusJS 源文件](https://github.com/SukkaW/DisqusJS/blob/master/src/disqus.js) 的注释之中。
- Disqus 自己的 config 保存在全局变量 `window.disqus_config` 中，你可能好奇为什么没有引入。实际上由于 `disqus_config` 和 `disqusjs.config` 中有很多重复的配置，所以 DisqusJS 直接将 `disqusjs.config` 中相关配置项赋给了 `disqus_config`，所以用户只需要配置 `disqusjs.config` 即可。
- ~~ES6 模板字符串不支持复用，所以引入了 [baiduTemplate](https://baidufe.github.io/BaiduTemplate/) 用来渲染评论条目。baiduTemplate 是一个超轻量级的浏览器端 EJS 模板实现。以后 DisqusJS 可能会通过复用函数的方法实现 ES6 模板字符串复用，届时就可以剥离掉 baiduTemplate 了。~~ 已经剥离 baiduTemplate。
- Disqus API 中有一个 createComment 的 API 用于创建新的评论，但是调用时会有一些坑。
- DisqusJS 并没有使用 Webpack 将 `disqusjs.css` 和 `disqus.js` 打包在一起，这样大家就可以开发自己的 DisqusJS 主题并引入。所有 DisqusJS 创建的 HTML 元素都在 `<div id="dsqjs"></div>` 之中、几乎所有的元素都有自己的类名并都以 `dsqjs-` 为前缀，防止污染。

## Todo List

[DisqusJS GitHub Project](https://github.com/SukkaW/DisqusJS/projects/1)

## Author 作者

**DisqusJS** © [Sukka](https://github.com/SukkaW), Released under the [GPL-3.0](https://github.com/SukkaW/suka.css/blob/master/LICENSE) License.<br>
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/suka.css/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel)
