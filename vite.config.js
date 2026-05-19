import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function getDataDate() {
  const dataDir = join(process.cwd(), 'data', 'output');
  if (!existsSync(dataDir)) return new Date().toISOString();
  let latest = 0;
  for (const file of readdirSync(dataDir)) {
    const mtime = statSync(join(dataDir, file)).mtimeMs;
    if (mtime > latest) latest = mtime;
  }
  return latest ? new Date(latest).toISOString() : new Date().toISOString();
}

export default {
  server: {
    port: 35453,
    // data/ is a symlink to ../srd-data/dna/. Vite refuses to serve files outside
    // the project root unless their real location is in fs.allow.
    fs: {
      allow: ['.', '..']
    }
  },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DATA_DATE__: JSON.stringify(getDataDate()),
  }
};
