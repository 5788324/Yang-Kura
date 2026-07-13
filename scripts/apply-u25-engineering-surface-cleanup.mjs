import fs from 'node:fs';

const hideOpeningTagById = (text, id) => {
  const pattern = new RegExp(`<section id="${id}"([^>]*)>`);
  const matches = text.match(new RegExp(pattern.source, 'g')) ?? [];
  if (matches.length !== 1) {
    throw new Error(`${id}: expected exactly one section, found ${matches.length}`);
  }
  return text.replace(pattern, (opening, rest) => {
    if (/\shidden(?:\s|>|=)/.test(opening) && /aria-hidden="true"/.test(opening)) return opening;
    return `<section id="${id}" hidden aria-hidden="true"${rest}>`;
  });
};

const hideMaintenancePrefixSections = (text) => {
  const prefixPattern = /<section id="(mvp(?:54|55|60|61|62|63|64|66|67|68|69|70)-[^"]+)"([^>]*)>/g;
  let count = 0;
  const next = text.replace(prefixPattern, (opening, id, rest) => {
    count += 1;
    if (/\shidden(?:\s|>|=)/.test(opening) && /aria-hidden="true"/.test(opening)) return opening;
    return `<section id="${id}" hidden aria-hidden="true"${rest}>`;
  });
  if (count < 8) throw new Error(`expected maintenance history sections, found only ${count}`);
  return next;
};

const dashboardPath = 'src/components/Dashboard.tsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
dashboard = hideOpeningTagById(dashboard, 'mvp71-home-user-facing-simplification');
fs.writeFileSync(dashboardPath, dashboard);

const settingsPath = 'src/components/SettingsPage.tsx';
let settings = fs.readFileSync(settingsPath, 'utf8');
for (const id of [
  'mvp124-mpv-stability-diagnostics',
  'mvp125-player-acceptance-checklist',
  'mvp123-mpv-windows-sample-check',
  'mvp44-settings-daily-flow',
  'mvp58-settings-personal-workflow',
  'mvp71-settings-user-facing-simplification',
  'mvp80-settings-daily-finalize',
  'mvp110-settings-daily-language',
  'mvp111-github-baseline-sync',
]) {
  settings = hideOpeningTagById(settings, id);
}
settings = hideMaintenancePrefixSections(settings);

const scannerMarker = '              {/* MVP-07 Scanner Contract UI Flow */}\n              <div className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">';
const scannerReplacement = '              {/* MVP-07 Scanner Contract UI Flow */}\n              <div hidden aria-hidden="true" className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">';
const scannerMatches = settings.split(scannerMarker).length - 1;
if (scannerMatches !== 1) throw new Error(`scanner contract block: expected one target, found ${scannerMatches}`);
settings = settings.replace(scannerMarker, scannerReplacement);

fs.writeFileSync(settingsPath, settings);
console.log('U25 engineering surface cleanup patch applied');
