# 🎮 2048 小游戏

一个纯前端实现的经典 2048 小游戏，使用 **HTML + CSS + JavaScript** 编写，无需任何构建工具，可直接部署到 GitHub Pages。

## ✨ 特性

- 🎯 完整还原 2048 玩法，滑动合并相同数字
- ⌨️ 支持**键盘方向键**操作
- 📱 支持**移动端触摸滑动**
- 💾 使用 `localStorage` 自动保存**最高分**
- 🎨 平滑的方块滑动与合并动画
- 🏆 达到 2048 弹出胜利提示，可继续挑战
- 📐 响应式布局，手机 / 平板 / PC 自适应

## 🚀 本地运行

直接用浏览器打开 `index.html` 即可，无需安装任何依赖。

或者启动一个本地服务器：

```bash
# Python 3
python -m http.server 8000

# 或 Node.js
npx serve .
```

然后访问 `http://localhost:8000`。

## 📦 部署到 GitHub Pages

### 方式一：根目录部署（推荐）

1. 在 GitHub 上新建一个仓库，例如 `2048-game`
2. 把本项目所有文件上传到仓库根目录：

```bash
git init
git add .
git commit -m "Initial commit: 2048 game"
git branch -M main
git remote add origin https://github.com/你的用户名/2048-game.git
git push -u origin main
```

3. 进入仓库 **Settings → Pages**
4. **Source** 选择 `Deploy from a branch`
5. **Branch** 选择 `main`，文件夹选 `/ (root)`，点击 Save
6. 等待约 1 分钟，访问 `https://你的用户名.github.io/2048-game/` 即可游玩

### 方式二：放在子目录

如果项目文件放在仓库的某个子文件夹（如 `2048-game/`），
在 Pages 设置里把文件夹改成 `/docs` 或将文件移到根目录即可。

> 💡 注意：GitHub Pages 项目站点地址为 `https://用户名.github.io/仓库名/`，
> 如果 `index.html` 不在根目录，需要在路径后补上对应文件夹。

## 📁 项目结构

```
2048-game/
├── index.html      # 游戏主页面
├── css/
│   └── style.css   # 样式与动画
├── js/
│   └── game.js     # 游戏核心逻辑
└── README.md
```

## 🎮 玩法说明

- 使用 **方向键**（或滑动屏幕）移动所有方块
- 每次移动后会随机出现一个 2 或 4
- 两个相同数字相撞会**合并**成它们的和
- 拼出 **2048** 即获胜，之后可继续挑战更高分
- 棋盘填满且无法合并时游戏结束

## 📄 License

MIT
