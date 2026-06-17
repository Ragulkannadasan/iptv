import { downloadPlaylist } from './src/services/api';
import { parseM3U } from './src/utils/m3uParser';

async function test() {
  console.log('Fetching playlist...');
  const text = await downloadPlaylist();
  console.log(`Downloaded ${text.length} characters.`);
  
  console.log('Parsing M3U...');
  const start = Date.now();
  const channels = parseM3U(text);
  const end = Date.now();
  
  console.log(`Parsed ${channels.length} channels in ${end - start}ms.`);
  console.log('First 3 channels:', JSON.stringify(channels.slice(0, 3), null, 2));
}

test().catch(console.error);
