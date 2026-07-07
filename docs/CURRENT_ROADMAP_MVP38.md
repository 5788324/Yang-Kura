# Yang-Kura Current Roadmap — MVP-38

## Version

`0.76.0-mvp38`

## Scope

MVP-38 focuses on UI demo-residue cleanup and media-library polish.

The goal is not to add new backend capabilities. The goal is to make the primary user surfaces feel more like a media library and less like an engineering prototype.

## Completed in MVP-38

- Top app bar changed from build/MVP wording to user-facing media-library wording.
- Sidebar subtitle changed from development build wording to local media-library wording.
- Sidebar labels use user-facing Chinese labels for import planning and diagnostics.
- Dashboard resource-library status copy avoids raw `index` wording where possible.
- ASMR library filters use “本地资源 / 示例资源” instead of “真实 index / 演示资源”.
- ASMR table column “诊断状态” changed to “资源状态”.
- Playlist system/demo wording changed to “系统示例”.
- Downloader page stays Coming Soon and no longer claims crawler, SQLite write, real disk readiness, or local physical sandbox behavior in primary copy.

## Still intentionally unchanged

- Diagnostics keeps detailed technical history and MVP sections.
- Settings still contains detailed scan/index controls because it is the resource-import workflow.
- Downloading remains Coming Soon only.

## Forbidden scope

MVP-38 does not add:

- SQLite
- downloader
- metadata scraping
- mpv backend
- file delete / move / rename
- real download behavior
- new network calls

## Next stage

MVP-39 should continue media-library polish or move to playlist/player detail refinement according to the existing plan.
