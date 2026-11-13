// node dump_json.js <data.js> <out.json>
const fs=require('fs');global.window=global;require(require('path').resolve(process.argv[2]));
const H=HL;fs.writeFileSync(process.argv[3],JSON.stringify({level:H.level,sessions:H.sessions.map(s=>({n:s.n,unit:s.unit,wb2:s.wb2}))}));
