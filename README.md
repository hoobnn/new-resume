# new-resume：用 React 写的个人简历页

**简体中文** · [English](#english)

new-resume 是一个用 React 19 + Vite + TypeScript 写的开源（MIT）个人简历网页：内容用 Markdown 写，中英文双语，可切换配色与版式，直接在浏览器里打印成 A4 两页的 PDF。

我自己用的简历。网上的简历模板要么太普通，要么改起来麻烦，所以干脆写成一个网页：内容用 Markdown 写，排版交给代码，改完直接在浏览器里打印成 PDF。

- 中英文两份简历，页面上可以切换
- 三套配色：纸张、素白、深色
- 两种版式：默认的展示版，地址后加 `?style=classic` 是传统版
- 打印样式单独调过，A4 两页

## 用法

简历内容不在仓库里，放在被 git 忽略的 `local/data/` 下：

```text
local/data/resume.md      中文简历
local/data/resume.en.md   英文简历
local/data/photo.png      照片
```

Markdown 的分节标题（个人优势、技能清单、工作经历、项目经历、教育经历、荣誉与证书）和字段约定见 `src/lib/resumeMarkdown.ts`。

```sh
bun install
bun run dev          # 本地预览
bun run build        # 构建
bun run check:print-pages   # 用 Chrome 打印成 PDF，检查页数是否为 2（需先 bun run preview）
```

## 常见问题

**这是简历模板吗？别人能用吗？**
可以当模板用：克隆仓库，把你自己的 Markdown 简历放进 `local/data/`（被 git 忽略），`bun run dev` 预览即可。仓库里不含我的简历内容，也没有部署的在线页面。

**怎么导出 PDF？**
在浏览器里打开页面，用打印功能另存为 PDF。打印样式按 A4 两页调过，`bun run check:print-pages` 会用 Chrome 检查页数。

**支持英文简历吗？**
支持，中英文各一份 Markdown，页面上切换。

**和 LaTeX 简历模板、在线简历生成器比有什么不同？**
这是纯网页方案：不需要 LaTeX 环境，也不依赖第三方在线服务，内容留在本机。需要现成的在线编辑器和模板库的话，用在线简历生成器更省事。

## 技术栈

React 19、Vite、TypeScript；husky + commitlint 管提交信息。

## English

My own resume as a web page. Content is written in Markdown (kept out of git under `local/data/`), the layout is React + Vite, and the PDF comes from the browser's print dialog. Chinese and English versions, three color themes, a showcase layout and a classic one (`?style=classic`), and a print stylesheet tuned for two A4 pages.

**FAQ**: Is it a template? Yes — clone it and put your own Markdown resume in the git-ignored `local/data/`; the repo contains no personal resume content and no deployed site. Export to PDF? Use the browser's print dialog (styles tuned for two A4 pages; `bun run check:print-pages` verifies the page count with Chrome). Bilingual? Yes, one Markdown file per language, switchable on the page. Stack: React 19, Vite, TypeScript; MIT license.

## 许可证 / License

[MIT](LICENSE) © 2026 hoobnn。可自由使用、修改和分发，需保留版权声明。
