

(() => {
    
    
    
    const ADMIN = true;

    const RAR = {
        common:    { name: 'Обычный',     color: '#9fb3a8', next: 'rare',      up: 0.6 },
        rare:      { name: 'Редкий',      color: '#4aa8ff', next: 'epic',      up: 0.4 },
        epic:      { name: 'Эпический',   color: '#b45cff', next: 'legendary', up: 0.2 },
        legendary: { name: 'Легендарный', color: '#ffb938', next: 'mythic', up: 0.08 },
        mythic:    { name: 'Мифический',  color: '#ff4fd8' }
    };
    
    const SKINS = [
        { id: 'emerald',  name: 'Изумруд', r: 'common',    h: 150, base: true },
        { id: 'graphite', name: 'Графит',  r: 'common',    h: 150, s: 0.1 },
        { id: 'wine',     name: 'Бордо',   r: 'common',    h: 350 },
        { id: 'ocean',    name: 'Океан',   r: 'rare',      h: 205 },
        { id: 'lime',     name: 'Лайм',    r: 'rare',      h: 82 },
        { id: 'sunset',   name: 'Закат',   r: 'rare',      h: 22 },
        { id: 'amethyst', name: 'Аметист', r: 'epic',      h: 275 },
        { id: 'sakura',   name: 'Сакура',  r: 'epic',      h: 322 },
        { id: 'gold',     name: 'Золото',  r: 'legendary', h: 45 },
        { id: 'aurora',   name: 'Аврора',  r: 'legendary', h: 165, anim: true },
        
        { id: 'infinity', name: 'Бесконечность', r: 'mythic', h: 268, anim: true, fx: true }
    ];
    
    const CASES = {
        basic:   { name: 'Обычный кейс',  icon: '📦', w: { common: 69.9, rare: 25, epic: 4.5, legendary: 0.5, mythic: 0.1 } },
        premium: { name: 'Премиум кейс',  icon: '🎁', w: { common: 15, rare: 50, epic: 27,  legendary: 7, mythic: 1 } }
    };
    
    const DAILY = [{ basic: 1 }, { basic: 1 }, { basic: 1 }, { basic: 2 }, { basic: 1 }, { basic: 1 }, { premium: 1 }];

    
    const KEY = 'burmaldator-v1';
    const def = () => ({ streak: 0, best: 0, last: '', claimed: '', cases: { basic: 1, premium: 0 }, inv: {}, skin: 'emerald' });
    const load = () => { try { return { ...def(), ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return def(); } };
    let s = load();
    if (ADMIN) {
        SKINS.forEach(k => { if (!k.base) s.inv[k.id] = 99; });
        s.cases = { basic: 99, premium: 99 };
    }
    const save = () => { if (ADMIN) return; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {  } };

    
    const $ = id => document.getElementById(id);
    const root = document.documentElement;
    const byId = id => SKINS.find(k => k.id === id);
    const have = id => byId(id).base || (s.inv[id] || 0) > 0;
    const give = id => { s.inv[id] = (s.inv[id] || 0) + 1; };
    const take = id => { s.inv[id]--; };
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const roll = w => { let x = Math.random() * 100; for (const r in w) if ((x -= w[r]) < 0) return r; return 'common'; };
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const today = () => ymd(new Date());
    const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };
    const isReady = () => s.last === today() && s.claimed !== today();
    let tab = 'daily', msg = '', sel = null, busy = false, tt;

    function toast(text) {
        const t = $('toast');
        t.textContent = text;
        t.classList.add('show');
        clearTimeout(tt);
        tt = setTimeout(() => t.classList.remove('show'), 3200);
    }

    
    function paint() {
        const k = byId(s.skin) || SKINS[0], h = k.h, m = k.s ?? 1;
        const c = (hh, sat, l, a = 1) => `hsl(${hh} ${Math.min(100, sat * m)}% ${l}% / ${a})`;
        const v = {
            '--bg-base': c(h, 60, 3), '--accent': c(h, 53, 31), '--accent-light': c(h, 43, 49),
            '--glass': c(h, 100, 93, 0.08), '--glass-border': c(h, 100, 93, 0.18),
            '--field': c(h, 60, 5, 0.38), '--res': c(h, 60, 3, 0.5),
            '--text': c(h, 28, 93), '--text-dim': c(h, 12, 64),
            '--g1': c(h, 53, 31, 0.2), '--g2': c(h + 24, 53, 31, 0.16),
            '--o1': c(h, 57, 49, 0.75), '--o2': c(h + 24, 56, 40, 0.65),
            '--a': c(h, 53, 40, 0.9), '--hr': (h - 150) + 'deg', '--sat': m
        };
        for (const n in v) root.style.setProperty(n, v[n]);
        root.toggleAttribute('data-anim', !!k.anim);
        root.toggleAttribute('data-fx', !!k.fx);
    }
    const sw = k => k.fx
        ? 'radial-gradient(circle,#fff8 1px,transparent 1.4px) 0 0/8px 8px,conic-gradient(from 45deg,#ff4fd8,#8a5cff,#35e0ff,#6dff9c,#ffd24a,#ff4fd8)'
        : k.anim
        ? 'conic-gradient(from 0deg,#44ad78,#4aa8ff,#b45cff,#ff6fb5,#ffb938,#44ad78)'
        : `linear-gradient(135deg,hsl(${k.h} ${50 * (k.s ?? 1)}% 45%),hsl(${k.h + 24} ${55 * (k.s ?? 1)}% 24%))`;
    const card = (k, o = {}) =>
        `<${o.tag || 'div'} class="sk ${k.r} ${o.cls || ''}" style="--rc:${RAR[k.r].color}" ${o.attr || ''}>` +
        `<i style="background:${sw(k)}"></i><b>${k.name}</b><small>${RAR[k.r].name}</small>` +
        `${o.n > 1 ? `<span class="n">×${o.n}</span>` : ''}</${o.tag || 'div'}>`;

    
    function check() { 
        if (s.streak && s.last !== today() && s.last !== yesterday()) { s.streak = 0; save(); }
    }
    function used() { 
        check();
        if (s.last === today()) return;
        s.streak = s.last === yesterday() ? s.streak + 1 : 1;
        s.last = today();
        s.best = Math.max(s.best, s.streak);
        save(); hud();
        toast(`🔥 Серия: ${s.streak}. Награда за сегодня ждёт тебя!`);
    }
    function claim() {
        if (!isReady()) return;
        const r = DAILY[(s.streak - 1) % 7];
        for (const k in r) s.cases[k] += r[k];
        s.claimed = today();
        save();
        toast('Награда получена — кейсы в разделе «Кейсы»');
        render();
    }

    
    
    function reveal(final, frame) {
        busy = true; msg = ''; render();
        let i = 0;
        const t = setInterval(() => {
            if (++i < 14) { const el = $('reveal'); if (el) el.innerHTML = frame(); return; }
            clearInterval(t); busy = false; msg = final; render();
        }, 90);
    }
    function openCase(id) {
        if (busy || !s.cases[id]) return;
        const rar = roll(CASES[id].w);
        const k = rnd(SKINS.filter(x => x.r === rar && !x.base));
        s.cases[id]--; give(k.id); save();
        reveal(`<div class="res">Тебе выпал скин!</div>${card(k)}`,
            () => { const x = rnd(SKINS); return `<b style="color:${RAR[x.r].color}">${x.name}</b>`; });
    }
    function upgrade() {
        if (busy || !sel || !have(sel)) return;
        const k = byId(sel), R = RAR[k.r];
        take(k.id);
        let html;
        if (Math.random() < R.up) {
            const n = rnd(SKINS.filter(x => x.r === R.next));
            give(n.id);
            html = `<div class="res">✅ Успех! Скин улучшен</div>${card(n)}`;
        } else {
            html = `<div class="res warn">💥 Не повезло — «${k.name}» потерян</div>`;
        }
        if (s.skin === k.id && !have(k.id)) { s.skin = 'emerald'; paint(); }
        if (!have(sel)) sel = null;
        save();
        reveal(html, () => '⚡ Улучшаем…');
    }

    
    const TABS = [['daily', '🔥 Награды'], ['cases', '📦 Кейсы'], ['skins', '🎨 Скины'], ['up', '⚡ Улучшение']];
    const ico = r => r.premium ? '🎁' : '📦' + (r.basic > 1 ? '×' + r.basic : '');
    const VIEWS = {
        daily() {
            const lit = s.last === today(), claimed = s.claimed === today();
            const pos = lit ? (s.streak - 1) % 7 + 1 : s.streak % 7 + 1;
            const days = DAILY.map((r, i) => {
                const done = i + 1 < pos || (i + 1 === pos && claimed);
                return `<div class="day ${done ? 'done' : i + 1 === pos ? 'cur' : ''}">День ${i + 1}<em>${done ? '✓' : ico(r)}</em></div>`;
            }).join('');
            const hint = isReady() ? 'Награда за сегодня готова!'
                : claimed ? 'Награда получена. Возвращайся завтра, чтобы не потерять огонёк.'
                : 'Посчитай что-нибудь в калькуляторе — огонёк загорится и откроется награда.';
            return `<div class="streak-big"><span class="flame ${lit ? 'lit' : ''}">🔥</span><b>${s.streak}</b>` +
                `<small>дней подряд · рекорд ${s.best}</small></div><div class="week">${days}</div>` +
                `<p class="hint">${hint}</p><button class="btn" data-act="claim" ${isReady() ? '' : 'disabled'}>Забрать награду</button>`;
        },
        cases() {
            return `<div class="reveal" id="reveal">${msg}</div>` + Object.entries(CASES).map(([id, c]) =>
                `<div class="case"><span class="ico">${c.icon}</span><div><b>${c.name}</b> <small>× ${s.cases[id]}</small>` +
                `<div class="chances">${Object.entries(c.w).map(([r, p]) => `<span style="color:${RAR[r].color}">${RAR[r].name} ${p}%</span>`).join('')}</div></div>` +
                `<button class="btn sm" data-open="${id}" ${s.cases[id] && !busy ? '' : 'disabled'}>Открыть</button></div>`).join('') +
                '<p class="hint">Кейсы дают за ежедневный вход. Седьмой день серии — премиум кейс.</p>';
        },
        skins() {
            return `<p class="hint">Коллекция: ${SKINS.filter(k => have(k.id)).length}/${SKINS.length}. Нажми на скин, чтобы применить.</p><div class="grid">` +
                SKINS.map(k => have(k.id)
                    ? card(k, { tag: 'button', cls: s.skin === k.id ? 'on' : '', attr: `data-skin="${k.id}"`, n: s.inv[k.id] })
                    : `<div class="sk lock" style="--rc:${RAR[k.r].color}"><i>🔒</i><b>???</b><small>${RAR[k.r].name}</small></div>`).join('') + '</div>';
        },
        up() {
            const list = SKINS.filter(k => !k.base && RAR[k.r].next && have(k.id));
            const k = sel && have(sel) ? byId(sel) : null;
            let info = '<span class="hint">Выбери скин, который хочешь улучшить.</span>';
            if (k) {
                const R = RAR[k.r];
                info = `<b>${k.name}</b> → <b style="color:${RAR[R.next].color}">${RAR[RAR[k.r].next].name}</b><br>` +
                    `Шанс успеха: <b>${Math.round(R.up * 100)}%</b><br><small class="warn">Если не повезёт, скин пропадёт.</small>`;
            }
            return `<div class="reveal" id="reveal">${msg}</div>` +
                (list.length
                    ? `<div class="grid">${list.map(x => card(x, { tag: 'button', cls: sel === x.id ? 'on' : '', attr: `data-sel="${x.id}"`, n: s.inv[x.id] })).join('')}</div>`
                    : '<p class="hint">Пока нечего улучшать. Забери награду или открой кейс.</p>') +
                `<div class="upinfo">${info}</div><button class="btn" data-act="up" ${k && !busy ? '' : 'disabled'}>Улучшить</button>`;
        }
    };
    function hud() {
        check();
        $('streak-n').textContent = s.streak;
        $('hud-streak').classList.toggle('ready', isReady());
        document.querySelector('#hud-streak .flame').classList.toggle('lit', s.last === today());
    }
    function render() {
        check();
        $('tabs').innerHTML = TABS.map(([id, t]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}">${t}</button>`).join('');
        $('hub-body').innerHTML = VIEWS[tab]();
        hud();
    }
    function openHub(t) { tab = t; msg = ''; $('hub').hidden = false; render(); }
    const closeHub = () => { $('hub').hidden = true; };

    
    
    const OPS = [['+', '+', 'Сложение'], ['-', '−', 'Вычитание'], ['*', '×', 'Умножение'], ['/', '÷', 'Деление']];
    const opSelect = $('operation');
    const dd = document.createElement('div');
    dd.className = 'dd';
    dd.innerHTML = '<div class="dd-btn" tabindex="0" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-label="Операция">' +
        '<span class="dd-sym"></span><svg class="dd-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1.5l5 5 5-5"/></svg></div>' +
        '<ul class="dd-list" role="listbox">' + OPS.map(([v, g, n], i) => `<li role="option" data-v="${v}" style="--i:${i}"><b>${g}</b><span>${n}</span></li>`).join('') + '</ul>';
    opSelect.before(dd);
    opSelect.style.display = 'none';
    const ddBtn = dd.firstElementChild, ddItems = [...dd.querySelectorAll('li')];
    let ddIdx = 0;
    function ddSet(v) {
        opSelect.value = v;
        opSelect.dispatchEvent(new Event('change'));
        ddIdx = OPS.findIndex(o => o[0] === v);
        dd.querySelector('.dd-sym').textContent = OPS[ddIdx][1];
        ddItems.forEach((li, i) => li.setAttribute('aria-selected', i === ddIdx));
    }
    const ddOpen = o => { dd.classList.toggle('open', o); ddBtn.setAttribute('aria-expanded', o); };
    ddBtn.onclick = () => ddOpen(!dd.classList.contains('open'));
    dd.querySelector('.dd-list').addEventListener('click', e => {
        const li = e.target.closest('li');
        if (li) { ddSet(li.dataset.v); ddOpen(false); }
    });
    ddBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ddOpen(!dd.classList.contains('open')); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            ddSet(OPS[(ddIdx + (e.key === 'ArrowDown' ? 1 : OPS.length - 1)) % OPS.length][0]);
        } else if (e.key === 'Escape') ddOpen(false);
    });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) ddOpen(false); });
    ddSet(opSelect.value);

    
    const stars = document.createElement('div');
    stars.className = 'stars';
    document.body.prepend(stars);

    
    $('=').addEventListener('click', used);
    $('hud-streak').onclick = () => openHub('daily');
    $('hud-skins').onclick = () => openHub('skins');
    $('hub-close').onclick = closeHub;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHub(); });
    $('hub').addEventListener('click', e => {
        if (e.target.id === 'hub') return closeHub();
        const b = e.target.closest('button');
        if (!b) return;
        const d = b.dataset;
        if (d.tab) { if (!busy) { tab = d.tab; msg = ''; render(); } }
        else if (d.open) openCase(d.open);
        else if (d.skin) { s.skin = d.skin; save(); paint(); render(); }
        else if (d.sel) { sel = d.sel; msg = ''; render(); }
        else if (d.act === 'claim') claim();
        else if (d.act === 'up') upgrade();
    });

    paint();
    hud();
})();
