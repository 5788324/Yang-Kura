# U40-D 自动测试矩阵

| 缺陷 | 自动验证 |
|---|---|
| U40-B01 | `test-u40d-library-read-state.mjs`、TypeScript、U28、U40-B |
| U40-B02 | shared session verifier、TopBar/Router 状态标记、U30/U32/U40-B |
| U40-B03 | `test-u40d-profile-cleanup.mjs`、U29、重启流程 |
| U40-M01 | `test-u40d-library-normalization.mjs`、U28、U32 |
| U40-M02 | `test-u40d-daily-language.mjs`、U30、U32 |
| U40-O01 | 环境 Observation；基础播放由 U29 验证 |
| Issue #66 | 生产路由退出旧 Settings/Diagnostics、相对导入循环必须为 0 |

完整实机真实库验收见 `CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`。
