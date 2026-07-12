# MVP-09 Parser-Driven Fixture Scanner

## Goal

MVP-09 refactors `fixtureLibraryScanner` so it reuses `virtualLibraryPathParser` as the single source for virtual-path semantics.

The scanner still consumes only fixture / virtual entries and still produces an in-memory `LocalJsonIndex` with `sourceKind: "fixture"`.

## What moved into `virtualLibraryPathParser`

The following decisions are now centralized in the parser:

- path normalization
- collection folder detection
- extension detection
- audio / video / image / subtitle classification
- cover candidate detection
- RJ extraction and normalization
- music album vs music folder vs RJ work classification
- disc number detection
- track number detection
- subtitle language and target stem detection
- special roles such as main / bonus / disc / cg / cover / lyrics

## What `fixtureLibraryScanner` now does

`fixtureLibraryScanner` is now a mapper and aggregator:

```text
FixtureLibraryEntry[]
  -> virtualLibraryPathParser.parse(...)
  -> group by parsed.collectionFolder
  -> map parsed entries to roots / collections / tracks / covers / subtitles
  -> return LocalJsonIndex
```

It no longer owns duplicate extension sets, RJ regex, subtitle language rules, cover basename rules, or collection type logic.

## Current boundary

This remains a fixture-only scanner.

```text
No real filesystem reads
No Electron IPC
No SQLite
No `library-index.json` writes
No HTMLAudio
No deletion / move / rename
No metadata network fetch
```

## Why this matters

The future real scanner should not re-implement another independent set of path rules. It should feed discovered paths into the same parser and then use the same mapping contract that the fixture scanner now exercises.

This reduces the risk of inconsistent behavior between:

```text
fixture scanner
virtual path tests
future dry-run scanner
future Electron scanner
```

## Validation

Run:

```bash
npm run verify:mvp09-parser-driven-scanner
npm run verify:all
npm run build
```
