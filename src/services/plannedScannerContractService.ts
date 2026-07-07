export interface PlannedScannerContractSection {
  title: string;
  items: string[];
}

export interface PlannedRealScannerContract {
  contractVersion: 1;
  title: string;
  status: 'planned-only';
  stageGate: string;
  inputContract: PlannedScannerContractSection;
  outputContract: PlannedScannerContractSection;
  errorContract: PlannedScannerContractSection;
  safetyContract: PlannedScannerContractSection;
  forbiddenActions: string[];
  nextImplementationOrder: string[];
}

export const plannedScannerContractService = {
  getContract(): PlannedRealScannerContract {
    return {
      contractVersion: 1,
      title: 'Planned Real Scanner Contract',
      status: 'planned-only',
      stageGate: 'MVP-06 只定义合同；真实扫描必须等 MVP-07+，且先从用户手动选择的小样本目录开始。',
      inputContract: {
        title: '未来输入 ScannerRequest',
        items: [
          'rootId：由 UI/设置页生成的资源库 ID。',
          'rootPath：用户明确选择的目录；禁止默认扫描全盘或硬编码 E:\\arsm。',
          'libraryType：asmr / music / mixed。',
          'scanProfile：asmr-rj / music-folder / mixed-folder。',
          'mode：dry-run 优先，write-index 必须后置。',
          'limits：maxEntries、maxDepth、includeHidden=false、followSymlinks=false。',
        ],
      },
      outputContract: {
        title: '未来输出 ScannerResult',
        items: [
          'LocalJsonIndex draft：schemaVersion=1，sourceKind="electron-scan"。',
          'ScannerReport：summary、diagnostics、duplicates、nextActions。',
          'errors/warnings：不可吞掉访问失败、权限失败、路径过长、编码异常。',
          'previewOnly=true 时只返回内存结果，不写 library-index.json。',
        ],
      },
      errorContract: {
        title: '错误边界',
        items: [
          'invalid-root：目录不存在或不是目录。',
          'permission-denied：无权限访问。',
          'entry-limit-exceeded：超过 maxEntries 立即停止并报告。',
          'unsupported-extension：进入 warnings，不阻塞扫描。',
          'duplicate-rj / duplicate-track-path：只报告，不自动修复。',
          'path-encoding-warning：中文/日文/空格路径必须保留原文并记录 normalizedPath。',
        ],
      },
      safetyContract: {
        title: '安全合同',
        items: [
          '扫描器第一版只读；不删除、不移动、不重命名。',
          '写 library-index.json 必须是单独阶段，且需要 UI 二次确认。',
          '不联网抓元数据，不上传路径，不上传媒体内容。',
          '不自动调用播放器，不创建 file:// 播放 URL，播放链路另开任务。',
          '不接 SQLite；Local JSON Index 跑通后再评估数据库。',
        ],
      },
      forbiddenActions: [
        'scanAllDrives()',
        'hardcode E:\\arsm',
        'delete / unlink / rename / move files',
        'write library-index.json during dry-run',
        'open media with HTMLAudio during scan',
        'call Electron shell/player from scanner',
        'network metadata fetching',
      ],
      nextImplementationOrder: [
        'MVP-07：把 scanner contract 展示到 Settings/Diagnostics，仍然只读。',
        'MVP-08：添加 virtual path parser 单元用例，不读真实盘。',
        'MVP-09：Electron contract 文档与 IPC stub，不实现真实扫描。',
        'MVP-10：定义 planned dry-run scanner result contract，不读真实盘。',
        'MVP-11：把 planned dry-run contract 接入 UI / IPC stub，仍不写 library-index.json。',
      ],
    };
  },
};
