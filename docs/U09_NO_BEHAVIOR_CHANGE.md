# U09 No-Behavior-Change Contract

The extraction must preserve the existing full-player behavior exactly:

- Escape closes the surface;
- opening focuses the return button;
- closing restores the opening control when possible;
- vinyl motion follows play/progress/duration values;
- reduced-motion cancels animation and uses static visuals;
- cleanup removes listeners and animation frames.

No product command, storage key, IPC call, media path, queue transition or index operation is changed.
