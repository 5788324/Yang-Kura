import fs from 'node:fs';

// One-time exact source repair for the U26 maintenance wrapper.
const path = 'src/components/SettingsPage.tsx';
let source = fs.readFileSync(path, 'utf8');
const from = `              )}
                  </div>
                </details>`;
const to = `              )}
                  </div>
                  </div>
                </details>`;
const count = source.split(from).length - 1;
if (count !== 1) throw new Error(`U26 details closing: expected one target, found ${count}`);
source = source.replace(from, to);
fs.writeFileSync(path, source);
console.log('U26 details closing fixed');
