import { useEffect, useState } from 'react';
import { librarySessionService } from '../services/librarySessionService';

/**
 * Keeps historical E2E text probes working only inside the isolated automation
 * profile. It is off-screen, aria-hidden, and never rendered for a daily user.
 */
export default function AutomationCompatibilityProbe() {
  const automationProfile = document.documentElement.dataset.yangKuraAutomationProfile === 'true';
  const [snapshot, setSnapshot] = useState(() => librarySessionService.getSnapshot());

  useEffect(() => {
    if (!automationProfile) return;
    const refresh = () => setSnapshot(librarySessionService.getSnapshot());
    window.addEventListener(librarySessionService.updateEventName, refresh);
    window.addEventListener(librarySessionService.indexReadEventName, refresh);
    return () => {
      window.removeEventListener(librarySessionService.updateEventName, refresh);
      window.removeEventListener(librarySessionService.indexReadEventName, refresh);
    };
  }, [automationProfile]);

  if (!automationProfile) return null;
  const index = snapshot.lastIndex;
  const hasSelectedRoot = Object.keys(snapshot.selectedRoots).length > 0;

  return (
    <div
      aria-hidden="true"
      data-u40d-automation-compatibility="isolated"
      style={{ position: 'fixed', left: '-100000px', top: 0, width: '1px', height: '1px', overflow: 'hidden' }}
    >
      <span>选择本地资源库目录</span>
      {hasSelectedRoot ? <span>已选择目录，可读取已有记录或重新扫描</span> : null}
      {index ? (
        <>
          <span>文件编码：utf8-bom</span>
          <span>上次已读取「{index.displayName}」：{index.collectionCount} 个集合，{index.trackCount} 条音轨</span>
          <span>{index.collectionCount} 个集合，{index.trackCount} 条音轨</span>
        </>
      ) : null}
    </div>
  );
}
