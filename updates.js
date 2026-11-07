const { version } = require("react");

//往数组最上面
window.UPDATE_LOG = {

  // 顶部提示（不需要就留空字符串 ''）
  alert: '⚠️ 遇到意外情况，请加站主QQ 3906951201 反馈问题，或在 GitHub 提交 Issue',
  
  // 更新列表（最新的放最上面）
  list: [
    {
      icon: '📋',
      version: '2.1.6',
      date: '2026/11/7',
      content: '把更新日志的anthor改成了version，方便查看版本号。'
    },
   {
      icon: '📋',
      version: '2.1',
      date: '2026/11/7',
      content: '更新日志系统上线，支持在网页上查看更新日志。'
    },
    {
      icon: '💌',
      version: '2.0',
      date: '2026/11/6',
      content: '隐私政策页面上线，支持在网页上查看隐私政策。'
    },
    {
      icon: '📁',
      version: '1.9.2',
      date: '2026/11/1',
      content: '文件库系统上线,支持登录注册、文件管理、上传下载，后端使用 Cloudflare Worker + GitHub 仓库存储。貌似需要VPN才能访问。'
    },
    {
      icon: '🔗',
      version: 'Bata-1.0',
      date: '2026/10/1',
      content: 'AARC 项目页面上线，帮 Au 做宣传推广。'
    }
    
  ]
};