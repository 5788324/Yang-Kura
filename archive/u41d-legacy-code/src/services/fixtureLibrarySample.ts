import type {FixtureLibraryEntry} from './fixtureLibraryScanner';

export const fixtureLibrarySampleEntries: FixtureLibraryEntry[] = [
  // Baseline ASMR/RJ work with multi-language subtitle coverage.
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/cover.jpg', sizeBytes: 4096, mtimeMs: 1000},
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/01_本編.mp3', sizeBytes: 12_000_000, mtimeMs: 1001},
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/01_本編.zh.lrc', sizeBytes: 2048, mtimeMs: 1002},
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/02_耳かき.wav', sizeBytes: 80_000_000, mtimeMs: 1003},
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/02_耳かき.ja.lrc', sizeBytes: 2048, mtimeMs: 1004},
  {libraryType: 'asmr', relativePath: 'RJ01234567_雨音耳かき/02_耳かき.bilingual.lrc', sizeBytes: 4096, mtimeMs: 1005},

  // Spaces, Japanese path, and a normal RJ folder.
  {libraryType: 'asmr', relativePath: 'RJ07654321_添い寝 特典/cover.webp', sizeBytes: 8192, mtimeMs: 1100},
  {libraryType: 'asmr', relativePath: 'RJ07654321_添い寝 特典/01_添い寝.flac', sizeBytes: 64_000_000, mtimeMs: 1101},

  // ASMR folder without RJ code.
  {libraryType: 'asmr', relativePath: '中文 空格 无RJ作品/folder.png', sizeBytes: 5120, mtimeMs: 1200},
  {libraryType: 'asmr', relativePath: '中文 空格 无RJ作品/track one.m4a', sizeBytes: 9_500_000, mtimeMs: 1201},

  // Duplicate RJ case: same normalized RJ in two different folders.
  {libraryType: 'asmr', relativePath: 'RJ00000111_重复作品A/cover.jpg', sizeBytes: 4096, mtimeMs: 1300},
  {libraryType: 'asmr', relativePath: 'RJ00000111_重复作品A/01_duplicate_a.mp3', sizeBytes: 7_000_000, mtimeMs: 1301},
  {libraryType: 'asmr', relativePath: 'RJ00000111_重复作品B/cover.jpg', sizeBytes: 4096, mtimeMs: 1310},
  {libraryType: 'asmr', relativePath: 'RJ00000111_重复作品B/01_duplicate_b.mp3', sizeBytes: 7_100_000, mtimeMs: 1311},

  // Empty / metadata-only and cover-only cases.
  {libraryType: 'asmr', relativePath: 'RJ08888888_空目录/.keep', sizeBytes: 0, mtimeMs: 1400},
  {libraryType: 'asmr', relativePath: 'RJ09999999_只有封面/cover.jpg', sizeBytes: 4096, mtimeMs: 1410},

  // Video ASMR case: video files are recognized as tracks but should use external-player strategy later.
  {libraryType: 'asmr', relativePath: 'RJ06666666_视频ASMR/cover.jpg', sizeBytes: 4096, mtimeMs: 1500},
  {libraryType: 'asmr', relativePath: 'RJ06666666_视频ASMR/01_耳かき映像.mp4', sizeBytes: 700_000_000, mtimeMs: 1501},
  {libraryType: 'asmr', relativePath: 'RJ06666666_视频ASMR/01_耳かき映像.zh.srt', sizeBytes: 2048, mtimeMs: 1502},
  {libraryType: 'asmr', relativePath: 'RJ06666666_视频ASMR/02_添い寝映像.mkv', sizeBytes: 900_000_000, mtimeMs: 1503},

  // Image/CG case: image assets are indexed as image tracks, not playable audio.
  {libraryType: 'asmr', relativePath: 'RJ05555555_CG差分合集/cover.jpg', sizeBytes: 4096, mtimeMs: 1600},
  {libraryType: 'asmr', relativePath: 'RJ05555555_CG差分合集/cg/01.png', sizeBytes: 2_000_000, mtimeMs: 1601},
  {libraryType: 'asmr', relativePath: 'RJ05555555_CG差分合集/cg/02.webp', sizeBytes: 1_500_000, mtimeMs: 1602},

  // Multi-disc / special bonus case.
  {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/cover.jpg', sizeBytes: 4096, mtimeMs: 1700},
  {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/Disc 1/01_本編.mp3', sizeBytes: 50_000_000, mtimeMs: 1701},
  {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/Disc 1/01_本編.zh.vtt', sizeBytes: 2048, mtimeMs: 1702},
  {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/Disc 2/01_特典.wav', sizeBytes: 96_000_000, mtimeMs: 1703},
  {libraryType: 'asmr', relativePath: 'RJ04444444_多Disc特典/特典/bonus.ogg', sizeBytes: 20_000_000, mtimeMs: 1704},

  {libraryType: 'music', relativePath: 'Aimer - Walpurgis/cover.jpg', sizeBytes: 4096, mtimeMs: 2000},
  {libraryType: 'music', relativePath: 'Aimer - Walpurgis/01 Walpurgis.flac', sizeBytes: 36_000_000, mtimeMs: 2001},
  {libraryType: 'music', relativePath: 'Aimer - Walpurgis/01 Walpurgis.ja.lrc', sizeBytes: 2048, mtimeMs: 2002},
  {libraryType: 'music', relativePath: 'Aimer - Walpurgis/02 STAND-ALONE.mp3', sizeBytes: 10_000_000, mtimeMs: 2003},
  {libraryType: 'music', relativePath: 'Singles 中文 空格/cover.png', sizeBytes: 4096, mtimeMs: 2100},
  {libraryType: 'music', relativePath: 'Singles 中文 空格/夜に駆ける.mp3', sizeBytes: 8_000_000, mtimeMs: 2101},

  // Duplicate track path and missing cover music cases.
  {libraryType: 'music', relativePath: 'Duplicate Path/01 same.mp3', sizeBytes: 3_000_000, mtimeMs: 2200},
  {libraryType: 'music', relativePath: 'Duplicate Path/01 same.mp3', sizeBytes: 3_000_000, mtimeMs: 2200},
  {libraryType: 'music', relativePath: 'Missing Cover Album/01 only.mp3', sizeBytes: 5_000_000, mtimeMs: 2300},
];

export const fixtureLibrarySampleNotes = [
  '正常 RJ 目录：RJ01234567_雨音耳かき，含 cover、mp3、wav、zh/ja/bilingual LRC。',
  '含空格和日文路径：RJ07654321_添い寝 特典。',
  '无 RJ 但有音频的 ASMR 文件夹：中文 空格 无RJ作品。',
  '重复 RJ 样本：RJ00000111_重复作品A / RJ00000111_重复作品B。',
  '空目录 / 只有封面：RJ08888888_空目录、RJ09999999_只有封面。',
  '视频类 ASMR：RJ06666666_视频ASMR，含 mp4/mkv 和 srt。',
  '图片/CG 目录：RJ05555555_CG差分合集，图片作为 image track 进入 index。',
  '多 disc / 特典目录：RJ04444444_多Disc特典，含 Disc 1 / Disc 2 / 特典 子目录。',
  '普通音乐专辑目录：Aimer - Walpurgis，含 flac、mp3、ja.lrc。',
  '普通音乐单曲集合：Singles 中文 空格。',
  '重复 Track 路径样本：music/Duplicate Path/01 same.mp3。',
  '缺封面音乐样本：Missing Cover Album。',
];
