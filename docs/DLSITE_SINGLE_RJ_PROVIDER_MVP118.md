# MVP118：DLsite 单个 RJ 元数据 Provider

Electron main 侧查询单个 RJ 的 DLsite 作品页，经过域名白名单、超时和响应体上限后，标准化为标题、社团、声优、发售日期、简介和标签。

流程：单个 RJ → HTTPS 请求 → 页面解析 → 差异预览 → 手动填入表单 → 用户再次保存。

安全边界：不做全库批量查询，不自动保存，不自动覆盖，不修改媒体文件，不写入媒体目录，不返回 absolutePath/file://，不接 SQLite。

当前执行环境无法解析外网域名，因此解析器夹具、IPC、类型、编译和错误处理已验证，但真实 DLsite 在线响应仍需 Windows Electron 快检。
