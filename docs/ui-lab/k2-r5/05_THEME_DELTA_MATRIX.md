# K2-R5 Theme Delta Matrix

日期：2026-09-23

| Dimension | Midnight Glass | Studio Graphite | Aurora Dream | Implementation Rule |
|---|---|---|---|---|
| Intent | listening | managing | long-form immersion | semantic only |
| User default | yes | no | no | persisted preference |
| Engineering baseline | no | yes | no | build Studio primitives first |
| Content surface | solid | solid | solid | no scroll blur |
| Floating surface | glass | solid | light glass | token |
| Density | 40 | 32 | 48 | fixed row-height profile |
| Player geometry | floating | docked | floating | approved layoutVariant #1 |
| Detail emphasis | standard | standard | subtitle-first for RJ | approved layoutVariant #2 |
| Ambient background | subtle | none | artwork-derived | approved layoutVariant #3 |
| Navigation | responsive Sidebar/Rail | same | same | never theme-specific |
| Home structure | 4 rails | same | same | no route/layout fork |
| Music IA | full | full | full | content-model invariant |
| ASMR IA | full | full | full | content-model invariant |
| Card radius | 12–16 | 4–8 | 16–20 | token |
| Motion | 200ms | 120ms | 280–320ms | token |
| Background crossfade | limited | none | up to 600ms | static layers only |
| Zebra rows | off | subtle optional | off | style token |
| Glass in data list | forbidden | forbidden | forbidden | hard gate |
| Cover glow | minimal/none | none | ambient only | no per-card glow |
| Theme-specific JSX | forbidden | forbidden | forbidden | L1–L3 |
| Theme-specific business logic | forbidden | forbidden | forbidden | all layers |

## Layout Branch Budget

Allowed only:

1. Player floating / docked；
2. Detail standard / subtitle-first；
3. Ambient none / subtle / artwork-derived。

Any fourth theme-specific layout branch requires Design System review.
