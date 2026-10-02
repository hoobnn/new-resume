# new-resume：用 React 写的个人简历页

**简体中文** · [English](#english)

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

## 技术栈

React 19、Vite、TypeScript；husky + commitlint 管提交信息。

## English

My own resume as a web page. Content is written in Markdown (kept out of git under `local/data/`), the layout is React + Vite, and the PDF comes from the browser's print dialog. Chinese and English versions, three color themes, a showcase layout and a classic one (`?style=classic`), and a print stylesheet tuned for two A4 pages.

## 许可 / License

[MIT](LICENSE)
