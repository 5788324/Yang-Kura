# Yang Kura

`Yang Kura` is a Windows local RJ / ASMR library manager.

## Status

Current stage:

```text
M0 + M1
```

The project is being initialized.  
No scanner, player, metadata fetcher, downloader integration, or Web service is implemented yet.

## Project Goals

```text
Scan local library root E:\arsm
Recognize RJ / BJ / VJ works
Build local SQLite index
Show works in desktop UI
Handle Unknown Inbox
Handle duplicate_rj separately
Open files / m3u with external player
Later support metadata reconcile and missing-file reports
```

## Tech Stack

```text
Python
Flet
SQLite
Windows desktop
```

## Important Boundaries

```text
arsm-downing is frozen and independent.
Yang Kura is the manager.
Downloader is external/plugin.
Player is external first.
No Web MVP.
No Android.
No file deletion/moving/renaming.
No auto-cleanup.
```

## First Run

After M0 is implemented:

```powershell
python main.py
```

After M1 is implemented:

```powershell
python tools\db_init.py
python tools\db_inspect.py
python -m pytest
```

## Required Reading for AI Agents

Before changing anything, read:

```text
AGENTS.md
PROJECT_ROADMAP.md
WORKLOG.md
DECISIONS.md
ARCHITECTURE.md
UI_GUIDE.md
SCHEMA.md
TASKS.md
```
