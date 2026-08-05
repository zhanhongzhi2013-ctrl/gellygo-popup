# GellyGo Popup — Railway 部署指南

架构:Express 服务 + Postgres。提供弹窗脚本、在线管理后台(切换/新建模板、改文案配色即时生效)、订阅数据库 + CSV 导出。订阅时浏览器**双写**:Railway 数据库 + Shopify 客户列表。

## 一、部署到 Railway(约 5 分钟)

**方式 A — Railway CLI(推荐)**

```
npm install -g @railway/cli
railway login
cd gellygo-popup-railway
railway init          # 新建项目
railway add -d postgres   # 加数据库(自动注入 DATABASE_URL)
railway up            # 部署
railway variables --set ADMIN_PASSWORD=你的后台密码
railway variables --set ALLOWED_ORIGIN=https://gellygo.com
railway variables --set SHOP_DOMAIN=https://gellygo.com
railway domain        # 生成公网域名,如 xxx.up.railway.app
```

**方式 B — GitHub**:把本文件夹推到 GitHub 仓库 → railway.com → New Project → Deploy from GitHub repo → 再在项目里 Add Postgres,并在 Variables 设置上面 3 个变量 → Settings 生成域名。

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
