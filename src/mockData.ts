import { AudioTrack, RJWork, MusicAlbum, Playlist } from './types';

// Let's define some premium image URLs (Unsplash links with optimized sizes)
export const COVERS = {
  windChime: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=350&auto=format&fit=crop',
  catCafe: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop',
  campfire: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=350&auto=format&fit=crop',
  camping: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=350&auto=format&fit=crop',
  lofi: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=350&auto=format&fit=crop',
  acoustic: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=350&auto=format&fit=crop',
  ambient: 'https://images.unsplash.com/photo-1495563947136-339736c2d12f?q=80&w=350&auto=format&fit=crop',
  mixedPlaylist: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=350&auto=format&fit=crop',
  sleepRain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=350&auto=format&fit=crop',
};

// Generic nature ASMR lyrics for illustration
const natureLrc = [
  '[00:00.00] (微风拂过，风铃发出清脆的响声...)',
  '[00:15.00] (远处传来松涛阵阵与不知名鸟鸣)',
  '[00:45.00] (近处的泉水汩汩流淌，洗涤心灵的疲惫)',
  '[01:15.00] (温柔的人声低语：今天辛苦了，闭上眼睛好好休息吧...)',
  '[02:00.00] (雨滴开始轻柔地敲击竹叶，沙沙作响)',
  '[02:45.00] (风铃声在雨雾中显得愈发空灵和悠远)',
  '[03:30.00] (炉火哔哔啵啵地燃烧着，带来恰到好处的温暖)',
  '[04:15.00] (进入深度放松状态，伴随着呼吸沉沉睡去...)'
];

const catLrc = [
  '[00:00.00] (猫咪慵懒的呼噜声在耳边回荡，极其治愈)',
  '[00:20.00] (午后阳光洒在木地板上，翻书的沙沙声)',
  '[00:50.00] (汤匙轻轻搅拌咖啡杯，瓷器碰撞的清脆声)',
  '[01:25.00] (柔和的暖阳音乐背景音，让人昏昏欲睡)',
  '[02:00.00] (猫咪换了个姿势，抓了抓毛，继续发出满足的呼噜声)',
  '[02:40.00] (雨点打在玻璃窗上，世界只剩下这个安静的角落)'
];

const standardSongLrc = [
  '[00:00.00] 暖色光晕 - 纯真民谣',
  '[00:10.00] 词：Yang-Kura Project',
  '[00:20.00] 编曲：Acoustic Whispers',
  '[00:30.00] 阳光穿过旧窗台上的那片薄雾',
  '[00:38.00] 影子慢慢拉长 记录着时间的脚步',
  '[00:46.00] 泡一杯热茶 听吉他轻轻拨动心弦',
  '[00:54.00] 那些未曾说出口的 都在旋律中沉淀',
  '[01:02.00] 愿你在漫漫长夜 找到属于你的光亮',
  '[01:10.00] 卸下所有防备 枕着温柔的梦乡',
  '[01:18.00] (吉他间奏 - 悠长而治愈)',
  '[01:35.00] 岁月带走喧嚣 只留下纯粹的温热',
  '[01:43.00] 你的呼吸 伴随微风轻轻地附和',
  '[01:51.00] 闭上眼 听这首专门写给你的歌',
  '[01:59.00] 明天太阳升起 依然温暖如昨'
];

// Let's create mock tracks for ASMR RJ works
export const mockAsmrTracks: { [rjId: string]: AudioTrack[] } = {
  RJ01026048: [
    {
      id: 'track_rj01026048_01',
      title: '01_お姉ちゃんの優しいハグとご挨拶',
      artist: '周防パトラ',
      album: '【超特大】お姉ちゃんに甘えてね',
      rjId: 'RJ01026048',
      duration: 210,
      coverUrl: COVERS.windChime,
      fileSize: '48.2 MB',
      type: 'asmr',
      fileTreePath: '周防パトラ/01_お姉ちゃんの優しいハグとご挨拶.wav',
      lyrics: natureLrc
    },
    {
      id: 'track_rj01026048_02',
      title: '02_炭酸ヘッドスパシャンプーで泡あわお耳掃除',
      artist: '周防パトラ',
      album: '【超特大】お姉ちゃんに甘えてね',
      rjId: 'RJ01026048',
      duration: 1140,
      coverUrl: COVERS.windChime,
      fileSize: '261.5 MB',
      type: 'asmr',
      fileTreePath: '周防パトラ/02_炭酸ヘッドスパシャンプーで泡あわお耳掃除.flac',
      lyrics: natureLrc
    },
    {
      id: 'track_rj01026048_03',
      title: '03_深夜の添い寝密着ささやき＆甘々耳はぁ呼吸音',
      artist: '周防パトラ',
      album: '【超特大】お姉ちゃんに甘えてね',
      rjId: 'RJ01026048',
      duration: 1560,
      coverUrl: COVERS.windChime,
      fileSize: '357.1 MB',
      type: 'asmr',
      fileTreePath: '周防パトラ/03_深夜の添い寝密着ささやき＆甘々耳はぁ呼吸音.flac',
      lyrics: natureLrc
    }
  ],
  RJ332128: [
    {
      id: 'track_rj332128_01',
      title: '01_耳元ふーふー息吹きかけ＆トントン耳マッサージ',
      artist: 'あまね',
      album: '【超高音質】圧倒的包容力で眠らせる極上ASMR',
      rjId: 'RJ332128',
      duration: 600,
      coverUrl: COVERS.catCafe,
      fileSize: '137.4 MB',
      type: 'asmr',
      fileTreePath: 'あまね/01_耳元ふーふー息吹きかけ.wav',
      lyrics: catLrc
    },
    {
      id: 'track_rj332128_02',
      title: '02_極上両耳同時耳かき(極限のぞわぞわ感)',
      artist: 'あまね',
      album: '【超高音質】圧倒的包容力で眠らせる極上ASMR',
      rjId: 'RJ332128',
      duration: 1800,
      coverUrl: COVERS.catCafe,
      fileSize: '412.0 MB',
      type: 'asmr',
      fileTreePath: 'あまね/02_極上两耳同时耳かき.flac',
      lyrics: catLrc
    }
  ],
  RJ253912: [
    {
      id: 'track_rj253912_01',
      title: '01_膝枕でたっぷり甘やかし＆優しく包み込むお耳掃除',
      artist: '伊ヶ崎綾香',
      album: 'ひざまくらでたっぷり甘やかし耳かき',
      rjId: 'RJ253912',
      duration: 1500,
      coverUrl: COVERS.campfire,
      fileSize: '343.3 MB',
      type: 'asmr',
      fileTreePath: '伊ヶ崎綾香/01_膝枕優しくお耳掃除.flac',
      lyrics: natureLrc
    }
  ],
  RJ312093: [
    {
      id: 'track_rj312093_01',
      title: '01_ツンデレ猫耳彼女の照れくさいご挨拶',
      artist: '柚木ちひろ',
      album: 'ツンデレ猫耳彼女と過ごす、とろけるような耳かき',
      rjId: 'RJ312093',
      duration: 240,
      coverUrl: COVERS.camping,
      fileSize: '55.0 MB',
      type: 'asmr',
      fileTreePath: '柚木ちひろ/01_猫耳彼女ご挨拶.mp3',
      lyrics: catLrc
    },
    {
      id: 'track_rj312093_02',
      title: '02_耳穴オイルマッサージと耳殻トントン',
      artist: '柚木ちひろ',
      album: 'ツンデレ猫耳彼女と過ごす、とろけるような耳かき',
      rjId: 'RJ312093',
      duration: 1200,
      coverUrl: COVERS.camping,
      fileSize: '275.1 MB',
      type: 'asmr',
      fileTreePath: '柚木ちひろ/02_耳穴オイルマッサージ.mp3',
      lyrics: catLrc
    }
  ],
  RJ399712: [
    {
      id: 'track_rj399712_01',
      title: '01_雨降る田舎のお堂で不意の雨宿り',
      artist: 'ななひら',
      album: 'お隣の元気な女の子与ひみつの雨宿り',
      rjId: 'RJ399712',
      duration: 360,
      coverUrl: COVERS.lofi,
      fileSize: '82.4 MB',
      type: 'asmr',
      fileTreePath: 'ななひら/01_不意の雨宿り.wav',
      lyrics: standardSongLrc
    },
    {
      id: 'track_rj399712_02',
      title: '02_ドキドキ添い寝と安らぎの竹製耳かき',
      artist: 'ななひら',
      album: 'お隣 of 幼馴染',
      rjId: 'RJ399712',
      duration: 1440,
      coverUrl: COVERS.lofi,
      fileSize: '329.5 MB',
      type: 'asmr',
      fileTreePath: 'ななひら/02_添い寝耳かき.flac',
      lyrics: standardSongLrc
    }
  ],
  RJ01004124: [
    {
      id: 'track_rj01004124_01',
      title: '01_夜更かしの星空プラネタリウム読み聞かせ朗読',
      artist: '小岩井ことり',
      album: '心安らぐ静かな夜 of 読み聞かせ',
      rjId: 'RJ01004124',
      duration: 1200,
      coverUrl: '',
      fileSize: '275.1 MB',
      type: 'asmr',
      fileTreePath: '小岩井ことり/01_星空読み聞かせ.mp3',
      lyrics: natureLrc
    }
  ],
  RJ356984: [],
  RJ01150241: [
    {
      id: 'track_rj01150241_01',
      title: '01_破損音声_指かき・いたずら耳ふー_corrupted.flac',
      artist: '柚原みう',
      album: '小悪魔彼女にイタズラされちゃう耳かき',
      rjId: 'RJ01150241',
      duration: 300,
      coverUrl: COVERS.acoustic,
      fileSize: '68.6 MB',
      type: 'asmr',
      fileTreePath: '柚原みう/corrupted_いたずら耳ふー.flac',
      lyrics: natureLrc
    }
  ]
};

export const mockRjWorks: RJWork[] = [
  {
    id: 'RJ01026048',
    title: '【超特大ボリューム】お姉ちゃんにいっぱい甘えてね♪耳かき・添い寝・シャンプー・密着耳はぁ・いちゃいちゃ',
    circle: 'Honey Strap (周防パトラ)',
    cvs: ['周防パトラ'],
    releaseDate: '2024-03-22',
    coverUrl: COVERS.windChime,
    tags: ['甘やかし', '添い寝', '耳かき', 'シャンプー', '炭酸デトックス', '密着', '温柔低语'],
    status: 'identified',
    fileCount: 3,
    totalDuration: 2910,
    description: '周防パトラ极高水准力作！夏日夜晚在大姐姐房间里享受舒适的掏耳与细致温柔的贴耳轻声细语。伴着极尽写实的心跳声与甜甜氛围，全身心放松入睡。',
    tracks: mockAsmrTracks.RJ01026048,
    addedAt: '2026-06-25'
  },
  {
    id: 'RJ332128',
    title: '【超高音質3D】圧倒的包容力で眠らせる。極上の両耳同時耳かき・シャンプー・耳ふー・オイルマッサージ',
    circle: '桃色CODE',
    cvs: ['あまね'],
    releaseDate: '2023-08-15',
    coverUrl: COVERS.catCafe,
    tags: ['两耳同时耳かき', 'シャンプー', '耳ふー', 'オイルマッサージ', '膝枕', '极度解压'],
    status: 'identified',
    fileCount: 2,
    totalDuration: 2400,
    description: '采用特制高敏双耳麦克风，极致再现立体声。洗发水搓泡泡与掏耳的绝妙搭配，辅以两耳极尽温柔的低气呼吸音，助您在5分钟内深陷梦乡。',
    tracks: mockAsmrTracks.RJ332128,
    addedAt: '2026-06-20'
  },
  {
    id: 'RJ253912',
    title: '【3D耳かき】全編最高峰バイノーラル・ひざまくらでたっぷり甘やかし耳かき',
    circle: '柚子蜜 (Yuzumitsu)',
    cvs: ['伊ヶ崎綾香'],
    releaseDate: '2024-01-10',
    coverUrl: COVERS.campfire,
    tags: ['ひざまくら', '梵天耳かき', 'ささやき', '吐息', '赤ちゃん返り'],
    status: 'identified',
    fileCount: 1,
    totalDuration: 1500,
    description: '由ASMR界资深CV伊ヶ崎綾香倾情呈现，将您疲惫的一天完全治愈。在松软的膝枕上体验羽毛般温柔的梵天掏耳。',
    tracks: mockAsmrTracks.RJ253912,
    addedAt: '2026-06-15'
  },
  {
    id: 'RJ312093',
    title: '【猫耳甘やかし】ツンデレ猫耳彼女と過ごす、とろけるような耳かき＆添い寝マッサージ',
    circle: 'Sugar Sound',
    cvs: ['柚木ちひろ'],
    releaseDate: '2023-11-20',
    coverUrl: COVERS.camping,
    tags: ['猫耳', 'ツンデレ', '添い寝マッサージ', '炭酸耳かき', '耳穴マッサージ'],
    status: 'identified',
    fileCount: 2,
    totalDuration: 1440,
    description: '傲娇可爱的猫耳女友在午后对你进行的细致护理！带着小脾气又充满心意的精细采耳与舒适按摩，让酥麻的舒适感流遍全身。',
    tracks: mockAsmrTracks.RJ312093,
    addedAt: '2026-06-10'
  },
  {
    id: 'RJ399712',
    title: '【幼馴染】お隣の元気な女の子とひみつの雨宿り。耳かきと、ドキドキ添い寝。',
    circle: 'Confetto (ななひら)',
    cvs: ['ななひら'],
    releaseDate: '2024-05-18',
    coverUrl: COVERS.lofi,
    tags: ['幼馴染', '雨宿り', '耳かき', '添い寝', '甘酸っぱい'],
    status: 'identified',
    fileCount: 2,
    totalDuration: 1800,
    description: '和元气活泼的青梅竹马（CV. ななひら）在破旧的小庙里躲避突如其来的雷阵雨。狭窄的小空间里，两颗心在雨声和采耳中愈发靠近。',
    tracks: mockAsmrTracks.RJ399712,
    addedAt: '2026-06-05'
  },
  {
    id: 'RJ01004124',
    title: '【高音質睡眠導入】心安らぐ静かな夜の耳かきと、星空のプラネタリウム読み闻かせ',
    circle: '星ノ音ASMR',
    cvs: ['小岩井ことり'],
    releaseDate: '2025-09-05',
    coverUrl: '',
    tags: ['朗読', 'プラネタリウム', '耳かき', '睡眠導入', '环境音'],
    status: 'missing-cover',
    fileCount: 1,
    totalDuration: 1200,
    description: '著名声优小岩井ことり为您温和朗读治愈故事。由于封面文件缺失，本条目在库中展示缺省占位后备封面。',
    tracks: mockAsmrTracks.RJ01004124,
    addedAt: '2026-06-01'
  },
  {
    id: 'RJ356984',
    title: '【和風ASMR】ひぐらしの鳴く田舎の縁側で、優しいおばあちゃんに膝枕耳かきしてもらう',
    circle: '風鈴庵 (Furin-An)',
    cvs: ['ひなき'],
    releaseDate: '2025-07-20',
    coverUrl: COVERS.sleepRain,
    tags: ['和风', '膝枕耳かき', 'ひぐらし', '田舎', '安らぎ', '未加载'],
    status: 'missing-audio',
    fileCount: 0,
    totalDuration: 0,
    description: '在蝉鸣和夏风中享受温暖膝枕的怀旧时光。目前该条目已被库扫描到，本磁盘暂不提供音频，可在线检索。',
    tracks: [],
    addedAt: '2026-05-20'
  },
  {
    id: 'RJ01150241',
    title: '【小悪魔彼女】甘えん坊なあなたを優しくいじめる。いたずら耳ふー・ゼロ距離ささやき・指かき',
    circle: 'Sugar Star',
    cvs: ['柚原みう'],
    releaseDate: '2026-01-15',
    coverUrl: COVERS.acoustic,
    tags: ['小悪魔', '耳ふー', '指かき', 'ゼロ距離ささやき', 'いちゃいちゃ'],
    status: 'warning',
    fileCount: 1,
    totalDuration: 300,
    description: '有点坏心眼的小恶魔女友对你进行的贴耳恶作剧！注意：此条目部分声轨包含数字破音和损坏迹象，系统已触发风险警告。',
    tracks: mockAsmrTracks.RJ01150241,
    addedAt: '2026-05-10'
  }
];


// Mock Normal Music Albums
export const mockMusicAlbums: MusicAlbum[] = [
  {
    id: 'album_01',
    title: 'Lo-Fi Beats for Coding & Meditation',
    artist: 'Chilled Cat Cafe',
    coverUrl: COVERS.lofi,
    releaseYear: '2025',
    genre: 'Lo-Fi / Instrumental',
    tracks: [
      {
        id: 'track_music_01_01',
        title: 'Morning Dew (晨露)',
        artist: 'Chilled Cat Cafe',
        album: 'Lo-Fi Beats for Coding & Meditation',
        duration: 185,
        coverUrl: COVERS.lofi,
        type: 'music',
        fileSize: '4.5 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-25'
      },
      {
        id: 'track_music_01_02',
        title: 'Midnight Coffee (午夜咖啡)',
        artist: 'Chilled Cat Cafe',
        album: 'Lo-Fi Beats for Coding & Meditation',
        duration: 210,
        coverUrl: COVERS.lofi,
        type: 'music',
        fileSize: '5.2 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-20'
      },
      {
        id: 'track_music_01_03',
        title: 'Rainy Terminal (雨夜终端)',
        artist: 'Chilled Cat Cafe',
        album: 'Lo-Fi Beats for Coding & Meditation',
        duration: 195,
        coverUrl: COVERS.lofi,
        type: 'music',
        fileSize: '4.8 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-15'
      }
    ]
  },
  {
    id: 'album_02',
    title: 'Acoustic Whispers (温暖木吉他民谣)',
    artist: 'Sora & Friends',
    coverUrl: COVERS.acoustic,
    releaseYear: '2024',
    genre: 'Folk / Acoustic',
    tracks: [
      {
        id: 'track_music_02_01',
        title: '暖色光晕 (Warm Glow)',
        artist: 'Sora & Friends',
        album: 'Acoustic Whispers',
        duration: 245,
        coverUrl: COVERS.acoustic,
        type: 'music',
        fileSize: '5.8 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-10'
      },
      {
        id: 'track_music_02_02',
        title: '微风的寄托 (Breeze Whispers)',
        artist: 'Sora & Friends',
        album: 'Acoustic Whispers',
        duration: 220,
        coverUrl: COVERS.acoustic,
        type: 'music',
        fileSize: '5.3 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-05'
      },
      {
        id: 'track_music_02_03',
        title: '枕边信笺 (Letters on Pillow)',
        artist: 'Sora & Friends',
        album: 'Acoustic Whispers',
        duration: 275,
        coverUrl: COVERS.acoustic,
        type: 'music',
        fileSize: '6.4 MB',
        lyrics: standardSongLrc,
        addedAt: '2026-06-01'
      }
    ]
  },
  {
    id: 'album_03',
    title: 'Ambient Space Textures (宇宙回响白噪音)',
    artist: 'Nebula Sounds',
    coverUrl: COVERS.ambient,
    releaseYear: '2026',
    genre: 'Ambient / Drone',
    tracks: [
      {
        id: 'track_music_03_01',
        title: 'Cosmic Wind (宇宙微光)',
        artist: 'Nebula Sounds',
        album: 'Ambient Space Textures',
        duration: 480,
        coverUrl: COVERS.ambient,
        type: 'music',
        fileSize: '11.1 MB',
        lyrics: natureLrc,
        addedAt: '2026-05-20'
      },
      {
        id: 'track_music_03_02',
        title: 'Starlight Ocean (繁星之海)',
        artist: 'Nebula Sounds',
        album: 'Ambient Space Textures',
        duration: 600,
        coverUrl: COVERS.ambient,
        type: 'music',
        fileSize: '13.8 MB',
        lyrics: natureLrc,
        addedAt: '2026-05-10'
      }
    ]
  }
];

// Flatten all music tracks
export const mockMusicTracks: AudioTrack[] = mockMusicAlbums.flatMap(album => album.tracks);

// Curated Playlists (Supports ASMR track and regular music track mixed)
export const mockPlaylists: Playlist[] = [
  {
    id: 'playlist_system_favorite',
    name: '我喜欢的音频',
    description: '收藏的ASMR音声与普通音乐曲目',
    coverUrl: COVERS.mixedPlaylist,
    creator: '本地管理员',
    tracksCount: 3,
    isSystem: true,
    tracks: [
      mockAsmrTracks.RJ01026048[1], // 碳酸ヘッドスパ (ASMR)
      mockMusicTracks[0],           // Morning Dew (Music)
      mockAsmrTracks.RJ332128[1],   // 两耳同时耳かき (ASMR)
    ]
  },
  {
    id: 'playlist_01',
    name: '极度助眠·深空与篝火',
    description: '在细雨、星夜、炉火中陷入甜美梦乡的混合歌单',
    coverUrl: COVERS.sleepRain,
    creator: 'Yang-Kura Curator',
    tracksCount: 4,
    tracks: [
      mockAsmrTracks.RJ253912[0],   // 膝枕優しくお耳掃除 (ASMR)
      mockAsmrTracks.RJ312093[1],   // 耳穴オイルマッサージ (ASMR)
      mockAsmrTracks.RJ399712[1],   // 添い寝耳かき (ASMR)
      mockMusicTracks[1],           // Midnight Coffee (Music ambient)
    ]
  },
  {
    id: 'playlist_02',
    name: '专注写代码 / 降噪背景音',
    description: 'Lo-Fi 旋律结合双耳大自然触发音，让你迅速进入 Flow 状态',
    coverUrl: COVERS.lofi,
    creator: '本地用户',
    tracksCount: 4,
    tracks: [
      mockMusicTracks[0],           // Morning Dew (Lo-Fi)
      mockMusicTracks[2],           // Rainy Terminal (Lo-Fi)
      mockAsmrTracks.RJ01026048[0], // お姉ちゃんの優しいハグ (ASMR)
      mockMusicTracks[1],           // Midnight Coffee (Lo-Fi)
    ]
  }
];

// "最近播放" List (Demo History)
export const mockRecentPlays: AudioTrack[] = [
  mockAsmrTracks.RJ01026048[2], // 添い寝密着ささやき
  mockMusicTracks[1],           // Midnight Coffee
  mockAsmrTracks.RJ332128[1],   // 两耳同时耳かき
  mockMusicTracks[0],           // Morning Dew
  mockAsmrTracks.RJ399712[0],   // 01_雨降る田舎のお堂
];
