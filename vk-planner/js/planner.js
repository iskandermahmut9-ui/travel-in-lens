document.addEventListener('DOMContentLoaded', async function() {
    console.log("Planner JS: VK Mini App Ready");

    try {
        if (window.vkBridge) {
            vkBridge.send('VKWebAppInit');
            vkBridge.subscribe((e) => {
                if (e.detail.type === 'VKWebAppUpdateConfig') {
                    const scheme = e.detail.data.scheme ? e.detail.data.scheme : 'client_light';
                    if (scheme === 'space_gray' || scheme === 'vkcom_dark' || scheme === 'client_dark') {
                        document.body.classList.remove('vk-light'); document.body.classList.add('vk-dark');
                    } else {
                        document.body.classList.remove('vk-dark'); document.body.classList.add('vk-light');
                    }
                }
            });

            setTimeout(async () => {
                const btn = document.getElementById('btn-pro-auth');
                if(!btn) return; // Теперь кнопка в HTML есть, и скрипт пойдет дальше
                try {
                    btn.innerText = 'ВК: ПРОВЕРКА...';
                    const vkUser = await vkBridge.send('VKWebAppGetUserInfo');
                    if (vkUser && vkUser.id && supabase) {
                        btn.innerText = 'БАЗА: ВХОД...';
                        const vkEmail = `vk_${vkUser.id}@travel-in-lens.ru`;
                        // МЕНЯЕМ ПАРОЛЬ НА НОВЫЙ БЕЗОПАСНЫЙ
                        const vkPass = `vktravel_${vkUser.id}_secure`; 
                        
                        let { data, error } = await supabase.auth.signInWithPassword({ email: vkEmail, password: vkPass });
                        if (error) {
                            let { data: regData, error: regError } = await supabase.auth.signUp({ email: vkEmail, password: vkPass });
                            if (!regError && regData.user) handleLoginSuccess(regData.user);
                            else { showToast("Ошибка: " + regError.message); btn.innerText = 'ПРОФИЛЬ'; }
                        } else handleLoginSuccess(data.user);
                    }
                } catch (authErr) { console.log("Ошибка ВК:", authErr); btn.innerText = 'ПРОФИЛЬ'; }
            }, 1000);
        }
    } catch (e) { console.log("VK Bridge не загружен", e); }

    let map = null, supabase = null, currentUser = null, waypoints = [], routeLayer = null, currentRouteId = null; 
    
    if (window.innerWidth <= 900) document.getElementById('settings-panel').classList.add('active');

    window.showToast = function(msg) {
        const container = document.getElementById('toast-container'); if(!container) return;
        const toast = document.createElement('div'); toast.className = 'toast'; toast.innerText = msg;
        container.appendChild(toast); setTimeout(() => toast.remove(), 3000);
    };

    window.showCustomConfirm = function(msg, onYes) {
        document.getElementById('confirm-text').innerText = msg;
        document.getElementById('confirm-modal').style.display = 'flex';
        document.getElementById('btn-confirm-yes').onclick = () => { document.getElementById('confirm-modal').style.display = 'none'; onYes(); };
        document.getElementById('btn-confirm-no').onclick = () => document.getElementById('confirm-modal').style.display = 'none';
    };

    async function showVKAd() {
        if (window.vkBridge) {
            try { await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" }); } 
            catch (e) { console.log("Реклама не показана:", e); }
        }
    }

    try {
        const container = L.DomUtil.get('map'); if(container != null) container._leaflet_id = null;
        map = L.map('map', { zoomControl: false, attributionControl: false }).setView([55.75, 37.61], 6);
        L.control.zoom({position: 'topright'}).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { crossOrigin: 'anonymous' }).addTo(map);
        map.on('click', async (e) => { await addPoint(e.latlng.lat, e.latlng.lng); });
    } catch (e) { console.error("Ошибка карты:", e); }

    const SUPABASE_URL = 'https://dytfkjgaurzunloekhxd.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dGZramdhdXJ6dW5sb2VraHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTYwMDgsImV4cCI6MjA4Mzg3MjAwOH0.rM57ha_nnfZTVAVlm0k14JpKNZoeZXcM4QJOjQ7yvdY';

    try {
        if(window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data: { session } } = await supabase.auth.getSession();
            if (session) handleLoginSuccess(session.user);
        }
    } catch(e) { console.error("Supabase error:", e); }

    const listEl = document.getElementById('list-content');
    if(listEl) new Sortable(listEl, { handle: '.drag-handle', animation: 150, onEnd: (evt) => moveWaypoint(evt.oldIndex, evt.newIndex) });

    const bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };
    // --- ЗАЩИТА ОТ XSS (САНИТАЙЗЕР) ---
    function escapeHTML(str) {
        if (!str) return '';
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }
    bind('btn-login-action', handleAuth);
    bind('btn-save-modal', openSaveModal);
    bind('btn-save-confirm', saveAsNew); 
    bind('btn-save-update', saveUpdate);
    bind('btn-routes', openRoutesModal);
    bind('btn-close-routes', () => document.getElementById('routes-modal').style.display='none');
    bind('btn-add-search', addBySearch);
    bind('btn-export', saveAsJPG);
    bind('btn-share-vk', shareToVKStory);
    bind('btn-mobile-settings', () => document.getElementById('settings-panel').classList.add('active'));
    
    bind('btn-apply-settings', () => { 
        document.getElementById('settings-panel').classList.remove('active'); 
        updateVisuals();
        if(window.innerWidth > 900) showToast("Настройки применены!");
    });

    bind('fab-toggle-view', () => {
        const isMapShown = document.body.classList.contains('show-map');
        const fabIcon = document.querySelector('#fab-toggle-view i');
        if (isMapShown) {
            document.body.classList.remove('show-map');
            if(fabIcon) { fabIcon.classList.remove('fa-list'); fabIcon.classList.add('fa-map'); }
        } else {
            document.body.classList.add('show-map');
            if(fabIcon) { fabIcon.classList.remove('fa-map'); fabIcon.classList.add('fa-list'); }
            setTimeout(() => { if(map) map.invalidateSize(); }, 300);
        }
    });

    const searchInp = document.getElementById('city-search');
    if(searchInp) searchInp.addEventListener('keypress', (e) => { if(e.key==='Enter') addBySearch(); });

    ['g-consumption','g-fuel','g-people'].forEach(id => { const el = document.getElementById(id); if(el) el.oninput = updateVisuals; });
    ['g-stay','g-food','g-excursions','g-souvenirs'].forEach(id => { const el = document.getElementById(id); if(el) el.oninput = function() { sync(this.id.split('-')[1], this.value); } });

    function v(id) { const el = document.getElementById(id); return el ? (parseFloat(el.value)||0) : 0; }
    function setText(id, t) { const e = document.getElementById(id); if(e) e.innerText = t; }
    function sync(k,val) { waypoints.forEach((p,i)=>{if(i>0)p.costs[k]=parseInt(val)||0}); updateVisuals(); }

    async function addPoint(lat, lng, manualName = null) {
        const id = Date.now();
        const pt = { id, lat, lng, name: manualName || "...", days: 1, dist: 0, costs: { stay: v('g-stay'), food: v('g-food'), exc: v('g-excursions'), souv: v('g-souvenirs') }, marker: L.marker([lat, lng], {draggable: true}).addTo(map) };

        pt.marker.on('dragend', async (e) => {
            const pos = e.target.getLatLng(); pt.lat=pos.lat; pt.lng=pos.lng;
            pt.name = await getAddress(pos.lat, pos.lng); e.target.bindPopup(pt.name).openPopup();
            updateRoute(); const inp = document.getElementById(`nm-${id}`); if(inp) inp.value=pt.name;
        });

        waypoints.push(pt); renderList(); 
        if (!manualName) { pt.name = await getAddress(lat, lng); const inp = document.getElementById(`nm-${id}`); if(inp) inp.value=pt.name; }
        pt.marker.bindPopup(pt.name).openPopup();
        if(waypoints.length > 1) await updateRoute();
        updateVisuals();
    }

    async function addBySearch() {
        const q = document.getElementById('city-search').value.trim(); if(!q) return;
        document.getElementById('city-search').value = '';
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&accept-language=ru`);
            const d = await r.json();
            if (d[0]) {
                map.setView([d[0].lat, d[0].lon], 10);
                await addPoint(parseFloat(d[0].lat), parseFloat(d[0].lon), d[0].display_name.split(',')[0]);
            } else showToast("Город не найден");
        } catch(e) { showToast("Ошибка сети. Проверьте интернет."); }
    }

    async function getAddress(lat, lng) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`);
            const d = await r.json();
            return d.address.city || d.address.town || d.address.village || `Точка`;
        } catch { return 'Координаты'; }
    }

    function moveWaypoint(oldI, newI) { const item = waypoints.splice(oldI, 1)[0]; waypoints.splice(newI, 0, item); updateRoute().then(renderList); }

    async function updateRoute() {
        if(waypoints.length < 2) { if(routeLayer) map.removeLayer(routeLayer); return; }
        const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
        try {
            const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
            const d = await r.json();
            if(d.routes && d.routes[0]) {
                if(routeLayer) map.removeLayer(routeLayer);
                routeLayer = L.geoJSON(d.routes[0].geometry, {color: '#f26322', weight: 5}).addTo(map);
                d.routes[0].legs.forEach((leg, i) => { if(waypoints[i+1]) waypoints[i+1].dist = leg.distance / 1000; });
                updateVisuals();
            }
        } catch(e) { console.log("Ошибка роутинга", e); }
    }

    function renderList() {
        const c = document.getElementById('list-content'); if(!c) return; c.innerHTML = '';
        waypoints.forEach((p, i) => {
            const isStart = i === 0;
            const div = document.createElement('div'); div.className = `waypoint-card ${isStart?'start':'point'}`; div.setAttribute('data-id', p.id);
            let h = `<div class="card-header-row"><div class="name-wrapper"><span class="drag-handle">⋮⋮</span><input id="nm-${p.id}" class="city-name-input" value="${p.name}" autocomplete="off"></div><button class="btn-del" data-idx="${i}" title="Удалить">×</button></div>`;
            if(!isStart) {
                h = `<div class="road-info">🚗 <span id="ds-${p.id}">0</span> км | ⛽ <span id="fl-${p.id}">0</span> ₽</div>` + h;
                h += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;"><label style="margin:0;">СУТОК:</label><input type="number" value="${p.days}" style="width:60px; padding:6px; text-align:center;" class="inp-days" data-idx="${i}"></div>
                      <div class="wp-inputs-grid">
                        <div><label>ЖИЛЬЕ</label><input type="number" value="${p.costs.stay}" class="inp-cost" data-idx="${i}" data-k="stay"></div>
                        <div><label>ЕДА</label><input type="number" value="${p.costs.food}" class="inp-cost" data-idx="${i}" data-k="food"></div>
                        <div><label>ЭКСКУРСИЯ</label><input type="number" value="${p.costs.exc}" class="inp-cost" data-idx="${i}" data-k="exc"></div>
                        <div><label>СУВЕНИРЫ</label><input type="number" value="${p.costs.souv}" class="inp-cost" data-idx="${i}" data-k="souv"></div>
                      </div><div class="stage-summary"><div class="stage-total-line">Этап: <span id="st-${p.id}">0</span> ₽</div></div>`;
            } else { h += `<div style="font-size:10px; color:#666; margin-left:10px;">Начало маршрута</div>`; }
            div.innerHTML = h; c.appendChild(div);
        });
        document.querySelectorAll('.btn-del').forEach(b => b.onclick = () => { map.removeLayer(waypoints[b.dataset.idx].marker); waypoints.splice(b.dataset.idx, 1); updateRoute().then(renderList); });
        document.querySelectorAll('.city-name-input').forEach(inp => inp.onchange = function() { const id = this.id.split('-')[1]; const pt = waypoints.find(w=>w.id==id); if(pt){ pt.name=this.value; pt.marker.bindPopup(this.value); } });
        document.querySelectorAll('.inp-days').forEach(inp => inp.oninput = function() { waypoints[this.dataset.idx].days = parseInt(this.value)||1; updateVisuals(); });
        document.querySelectorAll('.inp-cost').forEach(inp => inp.oninput = function() { waypoints[this.dataset.idx].costs[this.dataset.k] = parseInt(this.value)||0; updateVisuals(); });
        updateVisuals();
    }

    function updateVisuals() {
        const ppl = v('g-people')||1, rate = v('g-consumption'), price = v('g-fuel');
        let T = 0, Km = 0, N = 0, C = {f:0, s:0, fo:0, e:0, sv:0};
        waypoints.forEach((p, i) => {
            if (i === 0) return;
            const fuel = (p.dist/100)*rate*price;
            const cStay = (parseInt(p.costs.stay)||0)*(parseInt(p.days)||1);
            const cFood = (parseInt(p.costs.food)||0)*ppl*(parseInt(p.days)||1);
            const cExc = (parseInt(p.costs.exc)||0)*ppl;
            const cSouv = (parseInt(p.costs.souv)||0)*1;
            const sum = fuel+cStay+cFood+cExc+cSouv;
            T+=sum; Km+=parseFloat(p.dist); N+=parseInt(p.days);
            C.f+=fuel; C.s+=cStay; C.fo+=cFood; C.e+=cExc; C.sv+=cSouv;
            setText(`ds-${p.id}`, p.dist.toFixed(1)); setText(`fl-${p.id}`, Math.round(fuel)); setText(`st-${p.id}`, Math.round(sum).toLocaleString());
        });
        setText('total-sum', Math.round(T).toLocaleString() + ' ₽');
        setText('total-km', `${Km.toFixed(1)} км (🌙 ${N})`);
        setText('s-fuel', Math.round(C.f)); setText('s-stay', Math.round(C.s));
        setText('s-food', Math.round(C.fo)); setText('s-exc', Math.round(C.e)); setText('s-souv', Math.round(C.sv));
    }

    async function handleAuth() {
        if(!supabase) return;
        const e = document.getElementById('auth-email').value, p = document.getElementById('auth-pass').value;
        let { data, error } = await supabase.auth.signInWithPassword({ email:e, password:p });
        if(error) {
            if(confirm("Создать новый аккаунт?")) {
                const { data:d2, error:e2 } = await supabase.auth.signUp({ email:e, password:p });
                if(!e2) { showToast("Успешно!"); handleLoginSuccess(d2.user); } else showToast(e2.message);
            }
        } else handleLoginSuccess(data.user);
    }

    function handleLoginSuccess(u) {
        currentUser = u;
        // Скрываем модалку, если она была открыта
        const modal = document.getElementById('auth-modal'); if(modal) modal.style.display='none';
        // Показываем панель инструментов
        const panel = document.getElementById('user-panel'); if(panel) panel.style.display='flex';
        // ОБЯЗАТЕЛЬНО скрываем кнопку PRO ВХОД
        const btn = document.getElementById('btn-pro-auth'); if(btn) btn.style.display = 'none';
    }

    function openSaveModal() {
        if(!currentUser) { document.getElementById('auth-modal').style.display='flex'; return; }
        document.getElementById('save-modal').style.display='flex';
        if(currentRouteId) { document.getElementById('btn-save-update').style.display = 'block'; document.getElementById('btn-save-confirm').innerText = 'СОХРАНИТЬ КАК НОВЫЙ'; } 
        else { document.getElementById('btn-save-update').style.display = 'none'; document.getElementById('btn-save-confirm').innerText = 'СОХРАНИТЬ'; }
    }

    function getCleanData() { return waypoints.map(wp => ({ id: wp.id, lat: wp.lat, lng: wp.lng, name: wp.name, days: wp.days, dist: wp.dist, costs: wp.costs })); }

    async function saveAsNew() {
        const name = document.getElementById('route-name-inp').value || `Маршрут ${new Date().toLocaleDateString()}`;
        if (!currentUser) return;
        if (waypoints.length === 0) { showToast("Сначала добавьте города!"); return; }
        const btn = document.getElementById('btn-save-confirm'); const originalText = btn.innerText;
        btn.innerText = 'СОХРАНЕНИЕ...'; btn.disabled = true; btn.style.opacity = '0.5';
        try {
            const { count } = await supabase.from('routes').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
            if(count >= 20) { showToast("Лимит превышен"); return; }
            const { data, error } = await supabase.from('routes').insert({ user_id: currentUser.id, name, data: getCleanData() }).select();
            if(!error) { currentRouteId = data[0].id; showToast("Сохранено!"); document.getElementById('save-modal').style.display='none'; } 
            else showToast("Ошибка базы: " + error.message);
        } catch (e) { showToast("Сетевая ошибка."); } 
        finally { btn.innerText = originalText; btn.disabled = false; btn.style.opacity = '1'; }
    }

    async function saveUpdate() {
        const name = document.getElementById('route-name-inp').value;
        if (waypoints.length === 0) return;
        const btn = document.getElementById('btn-save-update'); const originalText = btn.innerText;
        btn.innerText = 'ОБНОВЛЕНИЕ...'; btn.disabled = true; btn.style.opacity = '0.5';
        try {
            const { error } = await supabase.from('routes').update({ data: getCleanData(), name }).eq('id', currentRouteId);
            if(!error) { showToast("Обновлено!"); document.getElementById('save-modal').style.display='none'; } else showToast(error.message);
        } catch (e) { showToast("Сетевая ошибка."); } 
        finally { btn.innerText = originalText; btn.disabled = false; btn.style.opacity = '1'; }
    }

    async function openRoutesModal() {
    document.getElementById('routes-modal').style.display='flex';
    const list = document.getElementById('routes-list-container'); 
    list.innerHTML = 'Загрузка...';
    
    const { data } = await supabase.from('routes').select('*').eq('user_id', currentUser.id).order('created_at', {ascending: false});
    list.innerHTML = '';
    
    if(data && data.length) {
        data.forEach(r => {
            const el = document.createElement('div'); 
            el.className = 'route-item';
            
            // В строке ниже мы добавили escapeHTML(r.name) вместо просто r.name
            el.innerHTML = `
                <div class="route-info">
                    <div class="route-name">${escapeHTML(r.name)}</div>
                    <div class="route-date">${new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div class="route-actions">
                    <button class="btn-load-route" data-id="${r.id}">Загрузить</button>
                    <button class="btn-del-route" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
                </div>`;
                
            el.querySelector('.btn-load-route').onclick = () => loadRoute(r);
            el.querySelector('.btn-del-route').onclick = () => deleteRoute(r.id);
            list.appendChild(el);
        });
    } else {
        list.innerHTML = 'Нет маршрутов';
    }
}

    async function deleteRoute(id) { showCustomConfirm("Удалить этот маршрут навсегда?", async () => { await supabase.from('routes').delete().eq('id', id); openRoutesModal(); }); }

    function loadRoute(r) {
        map.eachLayer(l => { if(l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l); });
        if(routeLayer) map.removeLayer(routeLayer);
        waypoints = r.data; currentRouteId = r.id; document.getElementById('routes-modal').style.display='none';
        document.getElementById('route-name-inp').value = r.name;
        waypoints.forEach(p => {
            p.marker = L.marker([p.lat, p.lng], {draggable: true}).addTo(map); p.marker.bindPopup(p.name);
            p.marker.on('dragend', async (e) => { const pos = e.target.getLatLng(); p.lat=pos.lat; p.lng=pos.lng; p.name = await getAddress(pos.lat, pos.lng); e.target.bindPopup(p.name).openPopup(); updateRoute(); });
        });
        updateRoute(); renderList();
    }

    function getTableData() {
        let tDays=0, tDist=0, tFuel=0, tStay=0, tFood=0, tExc=0, tSouv=0, gTotal=0;
        const ppl = v('g-people')||1, rate = v('g-consumption'), price = v('g-fuel');
        const body = waypoints.map((p, i) => {
            if(i===0) return [`1. ${p.name}`, '-', '-', '-', '-', '-', '-', '-', '-'];
            const fuel = Math.round((p.dist/100)*rate*price), stay = (parseInt(p.costs.stay)||0)*(parseInt(p.days)||1);
            const food = (parseInt(p.costs.food)||0)*ppl*(parseInt(p.days)||1), exc = (parseInt(p.costs.exc)||0)*ppl, souv = parseInt(p.costs.souv)||0;
            const rowT = fuel+stay+food+exc+souv;
            tDays+=(parseInt(p.days)||1); tDist+=parseFloat(p.dist); tFuel+=fuel; tStay+=stay; tFood+=food; tExc+=exc; tSouv+=souv; gTotal+=rowT;
            return [`${i+1}. ${p.name}`, p.days, p.dist.toFixed(0), fuel, stay, food, exc, souv, rowT];
        });
        return { body, footer: ['ВСЕГО', tDays, tDist.toFixed(0), tFuel, tStay, tFood, tExc, tSouv, gTotal], grandTotal: gTotal };
    }

   async function saveAsJPG() {
        const btn = document.activeElement; 
        const oldIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const ua = navigator.userAgent;
            const isMobileOS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            
            const mapEl = document.getElementById('map');
            await new Promise(r => setTimeout(r, 800));

            const mapCanvas = await html2canvas(mapEl, { 
                useCORS: true,       
                scale: 1.5,
                allowTaint: false,
                backgroundColor: '#ffffff',
                ignoreElements: (el) => el.classList.contains('leaflet-control-zoom')
            });

            const { body, footer, grandTotal } = getTableData();
            const name = document.getElementById('route-name-inp').value || "Маршрут";

            const reportDiv = document.createElement('div');
            reportDiv.style.position = 'fixed'; reportDiv.style.left = '0'; reportDiv.style.top = '0'; reportDiv.style.zIndex = '-999';
            reportDiv.style.width = '800px'; reportDiv.style.background = '#fff'; reportDiv.style.fontFamily = 'Arial, sans-serif';
            
            reportDiv.innerHTML = `
                <div style="padding:20px;">
                    <h2 style="margin:0 0 15px;">${name}</h2>
                    <img src="${mapCanvas.toDataURL('image/jpeg', 0.8)}" style="width:100%; border:1px solid #ddd; margin-bottom:20px;">
                    <table style="width:100%; border-collapse: collapse; font-size:14px; color:#000;">
                        <tr style="background:#FF5722; color:white;">
                            <th style="padding:10px; text-align:left;">Город</th>
                            <th style="padding:10px;">Дни</th><th style="padding:10px;">Км</th>
                            <th style="padding:10px;">Итого</th>
                        </tr>
                        ${body.map((row, i) => `
                            <tr style="background:${i%2===0?'#fff':'#f9f9f9'}; border-bottom:1px solid #eee;">
                                <td style="padding:8px; font-weight:bold;">${row[0]}</td>
                                <td style="padding:8px; text-align:center;">${row[1]}</td>
                                <td style="padding:8px; text-align:center;">${row[2]}</td>
                                <td style="padding:8px; text-align:right;">${row[8]} ₽</td>
                            </tr>
                        `).join('')}
                        <tr style="background:#333; color:white; font-weight:bold;">
                            <td style="padding:10px;">ВСЕГО</td>
                            <td style="padding:10px; text-align:center;">${footer[1]}</td>
                            <td style="padding:10px; text-align:center;">${footer[2]}</td>
                            <td style="padding:10px; text-align:right;">${grandTotal.toLocaleString()} ₽</td>
                        </tr>
                    </table>
                    <div style="margin-top:20px; text-align:right; color:#888; font-size:12px;">travel-in-lens.ru</div>
                </div>
            `;
            document.body.appendChild(reportDiv);

            const finalCanvas = await html2canvas(reportDiv, { scale: 1 });
            document.body.removeChild(reportDiv);

            const fileName = "travel-in-lens.ru.jpg";

            finalCanvas.toBlob(async (blob) => {
                if(!blob) { alert("Ошибка: Память переполнена"); return; }
                const file = new File([blob], fileName, { type: "image/jpeg" });

                if (isMobileOS) {
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Маршрут',
                                text: `Бюджет: ${grandTotal.toLocaleString()} ₽`
                            });
                            return; 
                        } catch (err) {}
                    }
                    showImagePopup(finalCanvas.toDataURL('image/jpeg', 0.9));
                } else {
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = URL.createObjectURL(blob);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

            }, 'image/jpeg', 0.85);

        } catch (e) {
            alert("Ошибка сохранения: " + e.message);
        } finally {
            btn.innerHTML = oldIcon;
        }
    }

    async function shareToVKStory() {
        if(!currentUser) { showToast("Авторизуйтесь в PRO!"); document.getElementById('auth-modal').style.display='flex'; return; }
        
        await showVKAd(); await new Promise(r => setTimeout(r, 500));

        const btn = document.getElementById('btn-share-vk'); if(!btn) return;
        const oldIcon = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const mapEl = document.getElementById('map');
            const wasMapHidden = !document.body.classList.contains('show-map');
            if (window.innerWidth <= 900 && wasMapHidden) {
                document.body.classList.add('show-map'); setTimeout(() => map.invalidateSize(), 100); await new Promise(r => setTimeout(r, 1000)); 
            } else await new Promise(r => setTimeout(r, 500)); 

            if (waypoints.length > 0) {
                const group = new L.featureGroup(waypoints.map(p => p.marker));
                if (routeLayer) group.addLayer(routeLayer);
                map.fitBounds(group.getBounds(), { padding: [30, 30], animate: false }); await new Promise(r => setTimeout(r, 1000)); 
            }

            const mapCanvas = await html2canvas(mapEl, { useCORS: true, scale: 2, backgroundColor: '#ffffff', allowTaint: false, ignoreElements: (el) => el.classList.contains('leaflet-control-zoom') });
            if (window.innerWidth <= 900 && wasMapHidden) document.body.classList.remove('show-map');

            const { body, footer, grandTotal } = getTableData();
            const name = document.getElementById('route-name-inp').value || "Маршрут путешествия";

            const storyDiv = document.createElement('div');
            storyDiv.style.position = 'absolute'; storyDiv.style.left = '-9999px'; storyDiv.style.top = '0'; storyDiv.style.width = '1080px'; storyDiv.style.height = '1920px'; 
            storyDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif'; storyDiv.style.background = '#121212'; storyDiv.style.color = '#ffffff';
            
            const imgData = mapCanvas.toDataURL('image/jpeg', 0.85);
            const expensesRow = footer[3] === '-' && footer[4] === '-' && footer[5] === '-' && footer[6] === '-' && footer[7] === '-' ? '' : `<div style="display: flex; justify-content: space-around; font-size: 32px; font-weight: bold; color: #FF5722; margin-bottom: 50px;">${footer[3] !== '-' ? `<div><span style="color:#888; font-size: 38px; margin-right:8px;">⛽</span> ${footer[3]} ₽</div>` : ''}${footer[4] !== '-' ? `<div><span style="color:#888; font-size: 38px; margin-right:8px;">🏠</span> ${footer[4]} ₽</div>` : ''}${footer[5] !== '-' ? `<div><span style="color:#888; font-size: 38px; margin-right:8px;">🍔</span> ${footer[5]} ₽</div>` : ''}${footer[6] !== '-' ? `<div><span style="color:#888; font-size: 38px; margin-right:8px;">🎫</span> ${footer[6]} ₽</div>` : ''}${footer[7] !== '-' ? `<div><span style="color:#888; font-size: 38px; margin-right:8px;">🎁</span> ${footer[7]} ₽</div>` : ''}</div>`;
            const waypointRows = body.length === 0 ? '<div style="text-align:center; color:#888; padding: 20px 0;">Маршрут пока пуст</div>' : body.slice(0, 6).map(row => `<div style="display: flex; align-items: center; justify-content: space-between; font-size: 36px; padding: 25px 0; border-bottom: 1px solid #2a2a2a;"><div style="display: flex; align-items: center; max-width: 75%;"><span style="font-size: 28px; color: #FF5722; margin-right: 20px;"><i class="fa-solid fa-location-dot"></i></span><span style="font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${row[0]}</span></div><span style="color: #FF5722; font-weight: 900; font-size: 40px;">${row[8]} ₽</span></div>`).join('');

            storyDiv.innerHTML = `<div style="padding: 100px 70px; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; justify-content: start; text-align: left;"><div style="font-size: 60px; font-weight: 900; line-height: 1.1; text-transform: uppercase; margin-bottom: 30px;">${name}</div><div style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.05); padding: 15px 30px; border-radius: 50px; border: 1px solid #333; margin-bottom: 60px;"><span style="font-size: 32px; color: #aaa; margin-right: 15px;">Бюджет</span><span style="font-size: 48px; font-weight: 900; color: #FF5722;">${grandTotal.toLocaleString()} ₽</span></div><div style="width: 100%; height: 600px; background: #fff url('${imgData}') no-repeat center center; background-size: contain; border-radius: 40px; border: 4px solid #333; margin-bottom: 60px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);"></div>${expensesRow}<div style="background: rgba(255, 255, 255, 0.03); border-radius: 30px; padding: 40px 50px; border: 2px solid #333;"><div style="font-size: 28px; font-weight: bold; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px;">Остановки</div>${waypointRows}${body.length > 6 ? `<div style="text-align:center; color:#888; margin-top:30px; font-size: 28px; font-style: italic;">и еще ${body.length - 6} точек...</div>` : ''}</div><div style="margin-top: auto; text-align: center; font-size: 32px; font-weight: bold; color: #666; padding-top: 50px;">Спланировано в приложении<br><span style="color:#FF5722">ПУТЕШЕСТВИЕ В ОБЪЕКТИВЕ</span></div></div>`;
            document.body.appendChild(storyDiv);

            const finalCanvas = await html2canvas(storyDiv, { scale: 1, backgroundColor: null, windowWidth: 1080, windowHeight: 1920, useCORS: true, logging: false });
            document.body.removeChild(storyDiv); const base64Img = finalCanvas.toDataURL('image/jpeg', 0.9);

            if (window.vkBridge) await vkBridge.send("VKWebAppShowStoryBox", { background_type: "image", blob: base64Img, attachment: { text: "open", type: "url", url: "https://vk.com/app54486894" } });
            else showToast("Публикация доступна только внутри ВК");
        } catch (e) { console.error(e); showToast("Ошибка создания истории"); } 
        finally { btn.innerHTML = oldIcon; }
    }
});