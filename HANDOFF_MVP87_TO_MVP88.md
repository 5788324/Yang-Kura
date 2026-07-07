# HANDOFF MVP-87 TO MVP-88

当前版本：`0.126.0-mvp88`

## 本轮完成

MVP-88：音乐专辑 / 单曲只读识别。

新增：

```text
src/services/musicImportReadOnlyDetectionService.ts
docs/CURRENT_ROADMAP_MVP88.md
docs/MUSIC_IMPORT_READONLY_DETECTION_MVP88.md
scripts/verify-mvp88-music-import-readonly-detection.mjs
```

修改：

```text
src/components/ImporterPage.tsx
src/components/DiagnosticsPage.tsx
src/services/index.ts
package.json
package-lock.json
README.md
PROJECT_STATE.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
```

## 本轮边界

```text
只读识别
只处理 sourceRootToken / sourceDisplayName / relativePaths
不读取真实目录
不读 ID3 / FLAC tag
不转换 / 不解密受保护格式
不 copy / move / delete / rename
不写正式库
```

## 下一轮建议

MVP-89：冲突检测：同 RJ、同文件、同专辑、hash 策略。
