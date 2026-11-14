/* Robo Bi – nhân vật robot hát vè (CES · Anh – Trung – Kids). Nhân vật gốc, vẽ bằng SVG.
   Dùng: ROBOT48.svg('sing') → chuỗi SVG · ROBOT48.img('sing') → Image (cache) · ROBOT48.EXPR → danh sách biểu cảm.
   Biểu cảm: hello, sing, happy, wink, wow, cheer, sleepy. Tùy chọn: {head:true} chỉ vẽ đầu, {mic:false}. */
(function (G) {
  const INK = '#3b2a1f', SKIN = '#FFD166', EAR = '#F2994A', VIS = '#2B3A55', GLOW = '#7FE8D8', BODY = '#2F9E94', PINK = '#FF8FA3';
  const arc = (x, y, w, up) => `<path d="M${x - w},${y} Q${x},${y + (up ? -w * 1.5 : w * 1.5)} ${x + w},${y}" fill="none" stroke="${GLOW}" stroke-width="5.5" stroke-linecap="round"/>`;
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GLOW}"/><circle cx="${x - r * .35}" cy="${y - r * .4}" r="${r * .32}" fill="#fff"/>`;
  const bar = (x, y, w) => `<path d="M${x - w},${y} H${x + w}" stroke="${GLOW}" stroke-width="5.5" stroke-linecap="round"/>`;
  const star = (x, y, r) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p += `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)} `; } return `<polygon points="${p}" fill="#FFE27A" stroke="${GLOW}" stroke-width="1.5" stroke-linejoin="round"/>`; };
  const smile = (open) => open
    ? `<path d="M84,104 Q100,126 116,104 Z" fill="#FF6B81" stroke="${GLOW}" stroke-width="3.5" stroke-linejoin="round"/><path d="M92,113 Q100,120 108,113 Q100,110 92,113Z" fill="#FFB3C1"/>`
    : `<path d="M88,104 Q100,116 112,104" fill="none" stroke="${GLOW}" stroke-width="5" stroke-linecap="round"/>`;
  const face = {
    hello: () => dot(80, 84, 8) + dot(120, 84, 8) + smile(false),
    sing: () => dot(80, 82, 8) + dot(120, 82, 8) + `<ellipse cx="100" cy="108" rx="11" ry="10" fill="#FF6B81" stroke="${GLOW}" stroke-width="3.5"/><ellipse cx="100" cy="113" rx="6" ry="4" fill="#FFB3C1"/>`,
    happy: () => arc(80, 88, 10, true) + arc(120, 88, 10, true) + smile(true),
    wink: () => dot(80, 84, 8) + arc(120, 88, 10, true) + smile(true),
    wow: () => dot(80, 82, 11) + dot(120, 82, 11) + `<circle cx="100" cy="109" r="7" fill="#FF6B81" stroke="${GLOW}" stroke-width="3"/>`,
    cheer: () => star(80, 84, 13) + star(120, 84, 13) + smile(true),
    sleepy: () => bar(80, 88, 10) + bar(120, 88, 10) + `<path d="M92,108 Q100,112 108,108" fill="none" stroke="${GLOW}" stroke-width="4.5" stroke-linecap="round"/>`
  };
  // cánh tay: [trái, phải] – mỗi tay là đường cong từ vai tới bàn tay
  const POSE = {
    hello: [[64, 156, 40, 176, 36, 196], [136, 156, 160, 140, 170, 112]],
    sing: [[64, 156, 40, 150, 44, 128], [136, 156, 150, 176, 150, 196]],
    happy: [[64, 156, 40, 176, 38, 196], [136, 156, 160, 176, 162, 196]],
    wink: [[64, 156, 40, 176, 38, 196], [136, 156, 164, 150, 160, 126]],
    wow: [[64, 156, 38, 160, 30, 176], [136, 156, 162, 160, 170, 176]],
    cheer: [[64, 156, 36, 140, 30, 104], [136, 156, 164, 140, 170, 104]],
    sleepy: [[64, 160, 52, 180, 56, 198], [136, 160, 148, 180, 144, 198]]
  };
  const arm = (p, left) => `<path d="M${p[0]},${p[1]} Q${p[2]},${p[3]} ${p[4]},${p[5]}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="M${p[0]},${p[1]} Q${p[2]},${p[3]} ${p[4]},${p[5]}" fill="none" stroke="${EAR}" stroke-width="8" stroke-linecap="round"/><circle cx="${p[4]}" cy="${p[5]}" r="9" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
  const note = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s * 1.7})" fill="${c}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><ellipse cx="0" cy="0" rx="7" ry="5.2" transform="rotate(-20)"/><path d="M5.6,-2 V-26 Q14,-22 14,-14" fill="none" stroke-width="3.2" stroke-linecap="round"/></g>`;
  const NOTES = { sing: [[168, 70, 1, '#F2C94C'], [186, 40, .8, '#FF8FA3'], [14, 60, .9, '#7FE8D8']], cheer: [[176, 80, .8, '#F2C94C'], [18, 76, .8, '#FF8FA3']], happy: [[176, 74, .85, '#7FE8D8']], hello: [[24, 70, .8, '#F2C94C']], wink: [[22, 74, .8, '#FF8FA3']], wow: [], sleepy: [] };

  function svg(expr, o) {
    o = o || {}; expr = face[expr] ? expr : 'happy'; const head = !!o.head, mic = o.mic !== false && !head && expr === 'sing';
    const tilt = expr === 'sleepy' ? ' transform="rotate(-6 100 140)"' : '';
    const z = expr === 'sleepy' ? `<text x="150" y="44" font-family="system-ui,sans-serif" font-weight="800" font-size="26" fill="${EAR}">z</text><text x="166" y="24" font-family="system-ui,sans-serif" font-weight="800" font-size="18" fill="${EAR}">z</text>` : '';
    const notes = o.notes === false ? '' : (NOTES[expr] || []).map(n => note(...n)).join('');
    const [L, R] = POSE[expr];
    const micSvg = mic ? `<g><rect x="36" y="112" width="12" height="26" rx="6" fill="#444" stroke="${INK}" stroke-width="3" transform="rotate(-12 42 125)"/><circle cx="44" cy="108" r="12" fill="#bbb" stroke="${INK}" stroke-width="3.5"/><circle cx="44" cy="108" r="6" fill="#888"/></g>` : '';
    const bodyP = head ? '' : `
      <rect x="76" y="212" width="18" height="16" rx="6" fill="${EAR}" stroke="${INK}" stroke-width="4"/><rect x="106" y="212" width="18" height="16" rx="6" fill="${EAR}" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="85" cy="232" rx="15" ry="7" fill="${INK}"/><ellipse cx="115" cy="232" rx="15" ry="7" fill="${INK}"/>
      ${arm(L, true)}${arm(R, false)}
      <rect x="62" y="142" width="76" height="72" rx="24" fill="${BODY}" stroke="${INK}" stroke-width="5"/>
      <path d="M100,196 C84,184 82,170 91,166 C96,164 100,168 100,168 C100,168 104,164 109,166 C118,170 116,184 100,196Z" fill="#FFE27A" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
    const vb = head ? '14 0 172 150' : '0 0 200 242';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${head ? 172 : 200}" height="${head ? 150 : 242}">
      ${notes}${z}${bodyP}
      <g${tilt}>
        <line x1="100" y1="22" x2="100" y2="44" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="16" r="9" fill="${EAR}" stroke="${INK}" stroke-width="4.5"/><circle cx="97" cy="13" r="3" fill="#fff"/>
        <rect x="24" y="72" width="20" height="36" rx="10" fill="${EAR}" stroke="${INK}" stroke-width="4.5"/><rect x="156" y="72" width="20" height="36" rx="10" fill="${EAR}" stroke="${INK}" stroke-width="4.5"/>
        <rect x="38" y="40" width="124" height="100" rx="38" fill="${SKIN}" stroke="${INK}" stroke-width="5.5"/>
        <rect x="52" y="54" width="96" height="68" rx="26" fill="${VIS}"/>
        <path d="M62,64 Q70,59 82,60" fill="none" stroke="#ffffff55" stroke-width="4" stroke-linecap="round"/>
        ${face[expr]()}
        <circle cx="64" cy="108" r="6.5" fill="${PINK}" opacity=".85"/><circle cx="136" cy="108" r="6.5" fill="${PINK}" opacity=".85"/>
      </g>${micSvg}</svg>`;
  }
  const cache = {};
  function img(expr, o) { const k = expr + JSON.stringify(o || {}); if (!cache[k]) { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(expr, o)); cache[k] = i; } return cache[k]; }
  G.ROBOT48 = { svg, img, EXPR: Object.keys(face), ASPECT: 242 / 200 };
})(typeof window !== 'undefined' ? window : globalThis);
