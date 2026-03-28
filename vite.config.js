import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getDataDate() {
  const dataDir = join(process.cwd(), 'data');
  let latest = 0;
  for (const file of readdirSync(dataDir)) {
    const mtime = statSync(join(dataDir, file)).mtimeMs;
    if (mtime > latest) latest = mtime;
  }
  return latest ? new Date(latest).toISOString() : new Date().toISOString();
}

export default {
  server: {
    port: 35453
  },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __DATA_DATE__: JSON.stringify(getDataDate()),
  }
};
