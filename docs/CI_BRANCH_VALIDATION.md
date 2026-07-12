# Automatic Branch Validation

Every pull request targeting `main` runs a Windows validation job.

The job:

1. installs the locked npm dependency graph without lifecycle scripts;
2. runs every focused `scripts/verify-u*.mjs` UI verifier in filename order;
3. runs `npm run verify:stable` with an 8 GB Node heap;
4. runs the production renderer build.

The workflow is intentionally read-only. It does not package releases, download media, access a real library, write application userData, or use repository secrets.

This validation does not replace final Windows GUI acceptance for layout, playback hardware, Narrator, or real userData behavior. It provides a consistent automated gate so routine source validation no longer depends on manual local commands.
