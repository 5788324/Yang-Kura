# U13 Supported Theme Contract

## Purpose

Yang-Kura exposes three selectable themes: `dark`, `acrylic-mist`, and `ocean-drops`. Before U13, `ThemeType` and Settings already reflected those three options, while `index.css` still carried unreachable `light` and `forest-cabin` theme implementations. Persisted legacy or malformed settings were also trusted without validating `currentTheme`.

## Changes

- `SUPPORTED_THEME_IDS` is the ordered source of truth for the three product themes;
- `DEFAULT_THEME_ID` remains `acrylic-mist`, matching the clean-profile default;
- `normalizeThemeType` preserves supported values and migrates all unsupported values to the default;
- `settingsPathPrivacyService.sanitizeSettings` now normalizes persisted theme values during localStorage hydration and updates;
- the existing Settings theme option list is verified against the supported contract;
- unreachable `.theme-light` and `.theme-forest-cabin` CSS, dropdown overrides, and light-only scrollbar overrides are removed.

## Migration behavior

Existing users with a supported theme keep their selection unchanged. Profiles containing old values such as `light`, `forest-cabin`, missing values, or arbitrary strings are normalized synchronously to `acrylic-mist` before the root theme class is rendered. The sanitized value is written back through the existing `useLocalStorage` path.

## Boundaries

U13 does not redesign any theme, change the three supported color palettes, add a new theme, alter media behavior, change routing, or touch Electron, importer, downloader, playback, index, or metadata flows.

## Verification

`scripts/verify-u13-theme-contract.mjs` executes the normalization functions, checks the supported order and fallback, verifies Settings integration, rejects legacy theme UI/CSS markers, and confirms project-state documentation. The normal Windows PR gate still runs dependency audit, all focused verifiers, the complete stable regression chain, and the production build.
