// 같이하기 연결: Firebase Realtime Database로 "같은 가게에 있는 사람들"을 주고받는다.
// 게임 코드가 쓰는 room.presence / room.onPeers 모양을 그대로 흉내 낸다.
//   bar/players/<탭>  이름, 옷 색, 자리, 행동, 말 (가끔 바뀜)
//   bar/pos/<탭>      위치와 방향 (걸을 때 자주 바뀜, 작게 유지)
(function () {
  const POS_KEYS = ['x', 'z', 'ry'];
  const POS_EVERY = 200;   // 걸을 때 위치는 0.2초에 한 번
  const META_EVERY = 120;

  window.firebaseRoom = async function (cfg) {
    if (!window.firebase) throw new Error('Firebase SDK가 없습니다');
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    const cred = await firebase.auth().signInAnonymously();
    const uid = cred.user.uid;
    const me = uid.slice(0, 10) + '-' + Math.random().toString(36).slice(2, 8);
    const db = firebase.database();
    const metaRef = db.ref('bar/players/' + me);
    const posRef = db.ref('bar/pos/' + me);
    metaRef.onDisconnect().remove();
    posRef.onDisconnect().remove();

    // ---- 내 상태 보내기
    let cur = {}, lastMeta = '', lastPos = '', metaT = 0, posT = 0, metaTimer = null, posTimer = null;
    function flushMeta() {
      metaTimer = null; metaT = Date.now();
      const m = {}; for (const k in cur) if (!POS_KEYS.includes(k)) m[k] = cur[k];
      const j = JSON.stringify(m); if (j === lastMeta) return; lastMeta = j;
      metaRef.set({ uid, j, t: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
    }
    function flushPos() {
      posTimer = null; posT = Date.now();
      const p = { uid, x: +cur.x || 0, z: +cur.z || 0, ry: +cur.ry || 0 };
      const j = p.x + ',' + p.z + ',' + p.ry; if (j === lastPos) return; lastPos = j;
      posRef.set(p).catch(() => {});
    }
    function presence(patch) {
      for (const k in patch) { if (patch[k] === null) delete cur[k]; else cur[k] = patch[k]; }
      const now = Date.now();
      if (!metaTimer) metaTimer = setTimeout(flushMeta, Math.max(0, META_EVERY - (now - metaT)));
      if (!posTimer) posTimer = setTimeout(flushPos, Math.max(0, POS_EVERY - (now - posT)));
      return Promise.resolve();
    }
    // 오래 안 움직여도 살아 있다는 표시
    setInterval(() => { lastMeta = ''; flushMeta(); }, 60000);

    // ---- 다른 사람들 받기
    const metas = new Map(), poss = new Map(), peers = new Map();
    const handlers = [];
    function build(id) {
      const m = metas.get(id); if (!m) return null;
      let pres = {}; try { pres = JSON.parse(m.j || '{}') || {}; } catch (e) { pres = {}; }
      const p = poss.get(id); if (p) { pres.x = p.x; pres.z = p.z; pres.ry = p.ry; }
      return Object.freeze({ peer: id, by: null, isMe: id === me, sameTab: id === me, kind: 'viewer', guest: false, presence: Object.freeze(pres), updatedAt: Date.now() });
    }
    function emit(kind, id) {
      const before = peers.get(id);
      let ch = { joined: [], updated: [], left: [] };
      if (kind === 'left') { if (!before) return; peers.delete(id); ch.left.push(before); }
      else { const pr = build(id); if (!pr) return; peers.set(id, pr); (before ? ch.updated : ch.joined).push(pr); }
      ch.peers = Object.freeze([...peers.values()]);
      handlers.forEach(h => { try { h(ch); } catch (e) { console.warn(e); } });
    }
    const stale = v => v && typeof v.t === 'number' && Date.now() - v.t > 5 * 60 * 1000;
    const metaList = db.ref('bar/players'), posList = db.ref('bar/pos');
    metaList.on('child_added', s => { const v = s.val(); if (!v || stale(v)) return; metas.set(s.key, v); emit('up', s.key); });
    metaList.on('child_changed', s => { metas.set(s.key, s.val()); emit('up', s.key); });
    metaList.on('child_removed', s => { metas.delete(s.key); poss.delete(s.key); emit('left', s.key); });
    posList.on('child_added', s => { poss.set(s.key, s.val()); if (metas.has(s.key)) emit('up', s.key); });
    posList.on('child_changed', s => { poss.set(s.key, s.val()); if (metas.has(s.key)) emit('up', s.key); });

    return {
      presence,
      onPeers(fn) { handlers.push(fn); setTimeout(() => { const all = [...peers.values()]; fn({ peers: Object.freeze(all), joined: all, updated: [], left: [] }); }, 0); return () => { const i = handlers.indexOf(fn); if (i >= 0) handlers.splice(i, 1); }; },
      peers: () => Object.freeze([...peers.values()]),
      connected: () => true,
    };
  };
})();
