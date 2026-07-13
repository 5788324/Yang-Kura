import fs from 'node:fs';

const filePath = 'src/components/PlayerBar.tsx';
let source = fs.readFileSync(filePath, 'utf8');

function replaceExactlyOnce(search, replacement, label) {
  const count = source.split(search).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one match, found ${count}`);
  source = source.replace(search, replacement);
}

replaceExactlyOnce(
  "import React, { useState, useMemo, useEffect } from 'react';",
  "import React, { useState, useMemo } from 'react';",
  'React imports',
);

replaceExactlyOnce(
  "} from '../player/playerBarMath';\n",
  "} from '../player/playerBarMath';\nimport { useAutoDismissMessage, useDelayedVisibility } from '../hooks/usePlayerTransientUi';\n",
  'transient UI hook import',
);

replaceExactlyOnce(
  `  // Local state controls\n  const [showVolumeSlider, setShowVolumeSlider] = useState(false);\n  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);\n  const [desktopLyricsActive, setDesktopLyricsActive] = useState(false);\n  const [toastMessage, setToastMessage] = useState<string | null>(null);\n`,
  `  // Local state controls\n  const {\n    isVisible: showVolumeSlider,\n    show: handleVolumeMouseEnter,\n    scheduleHide: handleVolumeMouseLeave,\n  } = useDelayedVisibility();\n  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);\n  const [desktopLyricsActive, setDesktopLyricsActive] = useState(false);\n  const { message: toastMessage, showMessage: setToastMessage } = useAutoDismissMessage();\n`,
  'transient UI state integration',
);

replaceExactlyOnce(
  `  // Volume hover timer buffer\n  const volumeTimeoutRef = React.useRef<any>(null);\n\n  const handleVolumeMouseEnter = () => {\n    if (volumeTimeoutRef.current) {\n      clearTimeout(volumeTimeoutRef.current);\n      volumeTimeoutRef.current = null;\n    }\n    setShowVolumeSlider(true);\n  };\n\n  const handleVolumeMouseLeave = () => {\n    volumeTimeoutRef.current = setTimeout(() => {\n      setShowVolumeSlider(false);\n    }, 800); // 800ms delay gives plenty of time to transition mouse cleanly\n  };\n\n  useEffect(() => {\n    return () => {\n      if (volumeTimeoutRef.current) {\n        clearTimeout(volumeTimeoutRef.current);\n      }\n    };\n  }, []);\n\n  // Auto clear toast\n  useEffect(() => {\n    if (toastMessage) {\n      const t = setTimeout(() => setToastMessage(null), 2500);\n      return () => clearTimeout(t);\n    }\n  }, [toastMessage]);\n\n`,
  '',
  'inline transient UI lifecycles',
);

for (const forbidden of [
  'volumeTimeoutRef',
  'setShowVolumeSlider',
  'useEffect(',
  'setTimeout(() => setToastMessage(null)',
]) {
  if (source.includes(forbidden)) throw new Error(`extracted transient UI lifecycle remains: ${forbidden}`);
}

fs.writeFileSync(filePath, source, 'utf8');
console.log('Applied U16 player transient UI hook patch.');
