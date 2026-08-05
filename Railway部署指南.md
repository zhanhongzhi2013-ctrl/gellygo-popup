# GellyGo Popup — Railway 部署指南

架构:Express 服务 + Postgres。提供弹窗脚本、在线管理后台(切换/新建模板、改文案配色即时生效)、订阅数据库 + CSV 导出。订阅时浏览器**双写**:Railway 数据库 + Shopify 客户列表。

## 一、部署到 Railway(约 10 分钟,已按 2026 版 CLI 核对)

### 准备

1. 注册 [railway.com](https://railway.com) 账号(GitHub 或邮箱登录均可),Hobby 计划约 $5/月
2. 安装 [Node.js LTS](https://nodejs.org)(装过可跳过)
3. 安装 Railway CLI(Windows 直接用 npm):

```
npm i -g @railway/cli
railway --version     # 能打印版本号即成功
```

### 方式 A — Railway CLI(推荐,全程复制粘贴)

在终端(PowerShell)里逐条执行,`cd` 后面换成你解压的实际路径:

```
railway login
```
→ 自动打开浏览器,点 Verify 授权,回终端显示 Logged in 即可。

```
cd gellygo-popup-railway
railway init
```
→ 提示输入项目名:填 `gellygo-popup`,回车。

```
railway add --database postgres
```
→ 添加 Postgres 数据库,DATABASE_URL 之后会自动注入服务。

```
railway up --detach
```
→ 上传代码并构建部署。首次会提示选择/创建 service:选当前目录对应的 service(默认回车即可)。等 1-2 分钟构建完成。

```
railway variable set ADMIN_PASSWORD=你的后台密码
railway variable set ALLOWED_ORIGIN=https://gellygo.com
railway variable set SHOP_DOMAIN=https://gellygo.com
```
→ 设置 3 个环境变量(注意新版命令是 `variable` 单数)。每次设置变量会自动触发重新部署,等它跑完。

```
railway domain
```
→ 生成公网域名,输出形如 `https://gellygo-popup-production-xxxx.up.railway.app`,记下它。

**验证**:浏览器打开 `https://你的域名/` 应显示 "GellyGo Popup service is running";打开 `/admin`,用户名随便填(如 admin)、密码填你设的 ADMIN_PASSWORD,能看到管理后台即成功。

### 方式 B — GitHub 网页部署(不想用命令行)

1. 把 `gellygo-popup-railway` 文件夹推到你的 GitHub 私有仓库
2. railway.com → **New Project** → **Deploy from GitHub repo** → 授权并选该仓库,自动构建
3. 项目画布空白处右键 → **Add Service** → **Database** → **PostgreSQL**
4. 点你的应用服务 → **Variables** 页签 → 添加 `ADMIN_PASSWORD`、`ALLOWED_ORIGIN`、`SHOP_DOMAIN` 三个变量;再点 **Add Variable Reference** 选 Postgres 的 `DATABASE_URL`(若未自动出现)
5. **Settings** 页签 → Networking → **Generate Domain** 生成公网域名
6. 以后改代码 push 到 GitHub 即自动重新部署

### 常见问题

- `railway up` 卡住/报错 → 跑 `railway logs --build` 看构建日志
- 打开域名显示 Application failed to respond → 等 1 分钟再试;仍不行跑 `railway logs` 看运行日志,常见原因是变量没设完导致的首次重启
- 后台打不开提示密码 → 确认 `railway variable list` 里 ADMIN_PASSWORD 已存在
- 数据库没连上(日志出现"未检测到 DATABASE_URL") → 确认 Postgres 服务在同一项目、同一 environment,且应用服务 Variables 里能看到 DATABASE_URL

## 二、接入 Shopify 店铺(一行代码)

后台 → 在线商店 → 主题 → 编辑代码 → `layout/theme.liquid`,在 `</body>` 前加:

```html
<script src="https://你的域名.up.railway.app/popup.js" defer></script>
```

(也可以让 Claude 通过已连接的 Shopify 直接帮你加。)

## 三、管理后台

访问 `https://你的域名.up.railway.app/admin`,用户名随意(如 admin),密码 = ADMIN_PASSWORD。

- **模板页**:6 款预置模板卡片;启用 / 编辑(全部文案+11 项配色+倒计时)/ 预览 / 删除;**+ 新建模板**随时加(情人节、周年庆随便建),保存即时生效
- **触发设置**:生效模板、延时秒数、退出意图、N 天免打扰、手机号开关、店铺域名
- **订阅数据**:总量、留手机号数、按模板统计、明细表、导出 CSV

## 四、数据说明

- Railway Postgres:所有订阅(邮箱、手机号、来源模板、时间),后台可看可导出
- Shopify 客户列表:同步写入,tag `newsletter, popup, popup-<模板id>`,可直接用 Shopify Email 营销;若开了联系表单 reCAPTCHA 个别会被拦截,Railway 库始终有全量数据
- 费用:Railway Hobby 计划(约 $5/月)足够

## 五、常见操作

- 换季:后台模板页点"启用"即可
- 加新节日模板:后台"+ 新建模板"填文案配色,预览满意后启用
- 改折扣力度:后台改折扣码字段 + 在 Shopify 建对应码(或让 Claude 建)
