document.addEventListener('DOMContentLoaded', async function() {
    console.log("Planner JS: v16.0 (PC Telegram Download Fix)");

    let map = null;
    let supabase = null;
    let currentUser = null;
    let waypoints = []; 
    let routeLayer = null; 
    let currentRouteId = null; 

    // --- 1. КАРТА ---
    try {
        const container = L.DomUtil.get('map');
        if(container != null){ container._leaflet_id = null; }

        map = L.map('map', {
            zoomControl: false, attributionControl: false,
            preferCanvas: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false 
        }).setView([55.75, 37.61], 6);

        L.control.zoom({position: 'topright'}).addTo(map);
        // useCORS и crossOrigin критичны для скриншотов
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { crossOrigin: 'anonymous' }).addTo(map);
        map.on('click', async (e) => { await addPoint(e.latlng.lat, e.latlng.lng); });

    } catch (e) { console.error("Ошибка карты:", e); }

    // --- 2. SUPABASE ---
    const SUPABASE_URL = 'https://dytfkjgaurzunloekhxd.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dGZramdhdXJ6dW5sb2VraHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTYwMDgsImV4cCI6MjA4Mzg3MjAwOH0.rM57ha_nnfZTVAVlm0k14JpKNZoeZXcM4QJOjQ7yvdY';

    try {
        if(window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data: { session } } = await supabase.auth.getSession();
            if (session) handleLoginSuccess(session.user);
        }
    } catch(e) { console.error("Supabase error:", e); }

    // --- 3. UI ---
    const listEl = document.getElementById('list-content');
    if(listEl) {
        new Sortable(listEl, {
            handle: '.drag-handle', animation: 150, ghostClass: 'sortable-ghost',
            onEnd: (evt) => moveWaypoint(evt.oldIndex, evt.newIndex)
        });
    }

    // --- 4. КНОПКИ ---
    const bind = (id, fn) => { const el = document.getElementById(id); if(el) el.onclick = fn; };

    bind('btn-pro-auth', () => document.getElementById('auth-modal').style.display='flex');
    bind('btn-close-auth', () => document.getElementById('auth-modal').style.display='none');
    bind('btn-login-action', handleAuth);
    bind('btn-save-modal', openSaveModal);
    bind('btn-save-confirm', saveAsNew); 
    bind('btn-save-update', saveUpdate);
    bind('btn-routes', openRoutesModal);
    bind('btn-close-routes', () => document.getElementById('routes-modal').style.display='none');
    bind('btn-logout', async () => { if(supabase) await supabase.auth.signOut(); location.reload(); });
    bind('btn-add-search', addBySearch);
    
    // ЭКСПОРТ
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        // Логика кнопок:
        // Если ширина < 900px (мобилки, планшеты, узкие окна ТГ) -> JPG
        // Если > 900px (Полноценный десктоп сайт) -> PDF
        if (window.innerWidth < 900) {
            exportBtn.onclick = saveAsJPG;
            exportBtn.title = "Скачать JPG";
            exportBtn.innerHTML = '<i class="fa-solid fa-image"></i>'; 
        } else {
            exportBtn.onclick = generatePDF;
            exportBtn.title = "Скачать PDF";
            exportBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';
        }
    }

    bind('btn-share-img', saveAsJPG); 
    bind('btn-mobile-settings', () => { document.getElementById('settings-panel').classList.add('active'); });
    bind('btn-apply-settings', () => { document.getElementById('settings-panel').classList.remove('active'); });

    bind('fab-toggle-view', () => {
        document.body.classList.toggle('show-map');
        const fabIcon = document.querySelector('#fab-toggle-view i');
        if (document.body.classList.contains('show-map')) {
            fabIcon.classList.remove('fa-map'); fabIcon.classList.add('fa-list');
            setTimeout(() => map.invalidateSize(), 100);
        } else {
            fabIcon.classList.remove('fa-list'); fabIcon.classList.add('fa-map');
        }
    });

    const searchInp = document.getElementById('city-search');
    if(searchInp) {
        let timer;
        searchInp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => addBySearch(), 1500); });
        searchInp.addEventListener('keypress', (e) => { if(e.key==='Enter') addBySearch(); });
    }

    ['g-consumption','g-fuel','g-people'].forEach(id => { const el = document.getElementById(id); if(el) el.oninput = updateVisuals; });
    ['g-stay','g-food','g-excursions','g-souvenirs'].forEach(id => { const el = document.getElementById(id); if(el) el.oninput = function() { sync(this.id.split('-')[1], this.value); } });


    // ================== ЛОГИКА ==================

    function v(id) { const el = document.getElementById(id); return el ? (parseFloat(el.value)||0) : 0; }
    function setText(id, t) { const e = document.getElementById(id); if(e) e.innerText = t; }
    function sync(k,val) { waypoints.forEach((p,i)=>{if(i>0)p.costs[k]=parseInt(val)||0}); updateVisuals(); }

    function getNoun(n, one, two, five) {
        n = Math.abs(n) % 100; if (n >= 5 && n <= 20) return five;
        n %= 10; if (n === 1) return one; if (n >= 2 && n <= 4) return two; return five;
    }

    async function addPoint(lat, lng, manualName = null) {
        const id = Date.now();
        const pt = {
            id, lat, lng, name: manualName || "...", days: 1, dist: 0,
            costs: { stay: v('g-stay'), food: v('g-food'), exc: v('g-excursions'), souv: v('g-souvenirs') },
            marker: L.marker([lat, lng], {draggable: true}).addTo(map)
        };

        pt.marker.on('dragend', async (e) => {
            const pos = e.target.getLatLng(); pt.lat=pos.lat; pt.lng=pos.lng;
            pt.name = await getAddress(pos.lat, pos.lng); e.target.bindPopup(pt.name).openPopup();
            updateRoute();
            const inp = document.getElementById(`nm-${id}`); if(inp) inp.value=pt.name;
        });

        waypoints.push(pt);
        renderList(); 

        if (!manualName) {
            pt.name = await getAddress(lat, lng);
            const inp = document.getElementById(`nm-${id}`); if(inp) inp.value=pt.name;
        }
        pt.marker.bindPopup(pt.name).openPopup();
        if(waypoints.length > 1) await updateRoute();
        updateVisuals();
    }

    async function addBySearch() {
        const q = document.getElementById('city-search').value;
        if(!q) return;
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&accept-language=ru`);
            const d = await r.json();
            if (d[0]) {
                map.setView([d[0].lat, d[0].lon], 10);
                await addPoint(parseFloat(d[0].lat), parseFloat(d[0].lon), d[0].display_name.split(',')[0]);
                document.getElementById('city-search').value = '';
            } 
        } catch(e) {}
    }

    async function getAddress(lat, lng) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`);
            const d = await r.json();
            return d.address.city || d.address.town || d.address.village || `Точка`;
        } catch { return 'Координаты'; }
    }

    function moveWaypoint(oldI, newI) { 
        const item = waypoints.splice(oldI, 1)[0]; waypoints.splice(newI, 0, item); 
        updateRoute().then(renderList); 
    }

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
            const div = document.createElement('div');
            div.className = `waypoint-card ${isStart?'start':'point'}`;
            div.setAttribute('data-id', p.id);

            let h = `<div class="card-header-row">
                        <div class="name-wrapper"><span class="drag-handle">⋮⋮</span><input id="nm-${p.id}" class="city-name-input" value="${p.name}" autocomplete="off"></div>
                        <button class="btn-del" data-idx="${i}" title="Удалить">×</button>
                     </div>`;
            
            if(!isStart) {
                h = `<div class="road-info">🚗 <span id="ds-${p.id}">0</span> км | ⛽ <span id="fl-${p.id}">0</span> ₽</div>` + h;
                h += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                        <label style="margin:0;">СУТОК:</label>
                        <input type="number" value="${p.days}" style="width:60px; padding:6px; text-align:center;" class="inp-days" data-idx="${i}">
                      </div>
                      <div class="wp-inputs-grid">
                        <div><label>ЖИЛЬЕ</label><input type="number" value="${p.costs.stay}" class="inp-cost" data-idx="${i}" data-k="stay"></div>
                        <div><label>ЕДА</label><input type="number" value="${p.costs.food}" class="inp-cost" data-idx="${i}" data-k="food"></div>
                        <div><label>ЭКСКУРСИЯ</label><input type="number" value="${p.costs.exc}" class="inp-cost" data-idx="${i}" data-k="exc"></div>
                        <div><label>СУВЕНИРЫ</label><input type="number" value="${p.costs.souv}" class="inp-cost" data-idx="${i}" data-k="souv"></div>
                      </div>
                      <div class="stage-summary"><div class="stage-total-line">Этап: <span id="st-${p.id}">0</span> ₽</div></div>`;
            } else { h += `<div style="font-size:10px; color:#666; margin-left:10px;">Начало маршрута</div>`; }
            div.innerHTML = h; c.appendChild(div);
        });

        document.querySelectorAll('.btn-del').forEach(b => b.onclick = () => { 
            map.removeLayer(waypoints[b.dataset.idx].marker); waypoints.splice(b.dataset.idx, 1); updateRoute().then(renderList); 
        });
        document.querySelectorAll('.city-name-input').forEach(inp => inp.onchange = function() { 
            const id = this.id.split('-')[1]; const pt = waypoints.find(w=>w.id==id); 
            if(pt){ pt.name=this.value; pt.marker.bindPopup(this.value); }
        });
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

            setText(`ds-${p.id}`, p.dist.toFixed(1)); setText(`fl-${p.id}`, Math.round(fuel));
            setText(`st-${p.id}`, Math.round(sum).toLocaleString());
        });

        const nStr = getNoun(N, 'ночь', 'ночи', 'ночей');
        setText('total-sum', Math.round(T).toLocaleString() + ' ₽');
        setText('total-km', `${Km.toFixed(1)} км (🌙 ${N} ${nStr})`);
        setText('s-fuel', Math.round(C.f)); setText('s-stay', Math.round(C.s));
        setText('s-food', Math.round(C.fo)); setText('s-exc', Math.round(C.e)); setText('s-souv', Math.round(C.sv));
    }

    async function handleAuth() {
        if(!supabase) return;
        const e = document.getElementById('auth-email').value;
        const p = document.getElementById('auth-pass').value;
        let { data, error } = await supabase.auth.signInWithPassword({ email:e, password:p });
        if(error) {
            if(confirm("Не удалось войти. Создать новый аккаунт?")) {
                const { data:d2, error:e2 } = await supabase.auth.signUp({ email:e, password:p });
                if(!e2) { alert("Регистрация успешна!"); handleLoginSuccess(d2.user); } else alert(e2.message);
            }
        } else handleLoginSuccess(data.user);
    }

    function handleLoginSuccess(u) {
        currentUser = u;
        const modal = document.getElementById('auth-modal'); if(modal) modal.style.display='none';
        const btnPro = document.getElementById('btn-pro-auth'); if(btnPro) btnPro.style.display='none';
        const panel = document.getElementById('user-panel'); if(panel) panel.style.display='flex';
    }

    function openSaveModal() {
        if(!currentUser) { document.getElementById('auth-modal').style.display='flex'; return; }
        document.getElementById('save-modal').style.display='flex';
        if(currentRouteId) {
            document.getElementById('btn-save-update').style.display = 'block';
            document.getElementById('btn-save-confirm').innerText = 'СОХРАНИТЬ КАК НОВЫЙ';
        } else {
            document.getElementById('btn-save-update').style.display = 'none';
            document.getElementById('btn-save-confirm').innerText = 'СОХРАНИТЬ';
        }
    }

    function getCleanData() {
        return waypoints.map(wp => ({
            id: wp.id, lat: wp.lat, lng: wp.lng, name: wp.name,
            days: wp.days, dist: wp.dist, costs: wp.costs
        }));
    }

    async function saveAsNew() {
        const name = document.getElementById('route-name-inp').value || `Маршрут ${new Date().toLocaleDateString()}`;
        if (!currentUser) return;
        const { count } = await supabase.from('routes').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id);
        if(count >= 20) { alert("Лимит (20) превышен"); return; }
        const { data, error } = await supabase.from('routes').insert({ user_id: currentUser.id, name, data: getCleanData() }).select();
        if(!error) {
            currentRouteId = data[0].id; alert("Сохранено!");
            document.getElementById('save-modal').style.display='none';
        } else alert("Ошибка: " + error.message);
    }

    async function saveUpdate() {
        const name = document.getElementById('route-name-inp').value;
        const { error } = await supabase.from('routes').update({ data: getCleanData(), name }).eq('id', currentRouteId);
        if(!error) { alert("Обновлено!"); document.getElementById('save-modal').style.display='none'; } else alert(error.message);
    }

    async function openRoutesModal() {
        document.getElementById('routes-modal').style.display='flex';
        const list = document.getElementById('routes-list-container'); list.innerHTML = 'Загрузка...';
        const { data } = await supabase.from('routes').select('*').eq('user_id', currentUser.id).order('created_at', {ascending: false});
        list.innerHTML = '';
        if(data && data.length) {
            data.forEach(r => {
                const el = document.createElement('div'); el.className = 'route-item';
                el.innerHTML = `
                    <div class="route-info"><div class="route-name">${r.name}</div><div class="route-date">${new Date(r.created_at).toLocaleDateString()}</div></div>
                    <div class="route-actions">
                        <button class="btn-load-route" data-id="${r.id}">Загрузить</button>
                        <button class="btn-del-route" data-id="${r.id}"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
                el.querySelector('.btn-load-route').onclick = () => loadRoute(r);
                el.querySelector('.btn-del-route').onclick = () => deleteRoute(r.id);
                list.appendChild(el);
            });
        } else list.innerHTML = 'Нет маршрутов';
    }

    async function deleteRoute(id) {
        if(confirm("Удалить?")) { await supabase.from('routes').delete().eq('id', id); openRoutesModal(); }
    }

    function loadRoute(r) {
        map.eachLayer(l => { if(l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l); });
        if(routeLayer) map.removeLayer(routeLayer);
        waypoints = r.data; currentRouteId = r.id; 
        document.getElementById('routes-modal').style.display='none';
        document.getElementById('route-name-inp').value = r.name;
        waypoints.forEach(p => {
            p.marker = L.marker([p.lat, p.lng], {draggable: true}).addTo(map);
            p.marker.bindPopup(p.name);
            p.marker.on('dragend', async (e) => {
                const pos = e.target.getLatLng(); p.lat=pos.lat; p.lng=pos.lng;
                p.name = await getAddress(pos.lat, pos.lng); e.target.bindPopup(p.name).openPopup();
                updateRoute(); 
            });
        });
        updateRoute(); renderList();
    }

    function getTableData() {
        let tDays=0, tDist=0, tFuel=0, tStay=0, tFood=0, tExc=0, tSouv=0, gTotal=0;
        const ppl = v('g-people')||1, rate = v('g-consumption'), price = v('g-fuel');
        const body = waypoints.map((p, i) => {
            if(i===0) return [`1. ${p.name}`, '-', '-', '-', '-', '-', '-', '-', '-'];
            const fuel = Math.round((p.dist/100)*rate*price);
            const stay = (parseInt(p.costs.stay)||0)*(parseInt(p.days)||1);
            const food = (parseInt(p.costs.food)||0)*ppl*(parseInt(p.days)||1);
            const exc = (parseInt(p.costs.exc)||0)*ppl;
            const souv = parseInt(p.costs.souv)||0;
            const rowT = fuel+stay+food+exc+souv;
            tDays+=(parseInt(p.days)||1); tDist+=parseFloat(p.dist);
            tFuel+=fuel; tStay+=stay; tFood+=food; tExc+=exc; tSouv+=souv; gTotal+=rowT;
            return [`${i+1}. ${p.name}`, p.days, p.dist.toFixed(0), fuel, stay, food, exc, souv, rowT];
        });
        return { body, footer: ['ВСЕГО', tDays, tDist.toFixed(0), tFuel, tStay, tFood, tExc, tSouv, gTotal], grandTotal: gTotal };
    }

    async function prepareMapForCapture() {
        window.scrollTo(0, 0);
        if (waypoints.length > 0) {
            const group = new L.featureGroup(waypoints.map(p => p.marker));
            if (routeLayer) group.addLayer(routeLayer);
            map.fitBounds(group.getBounds(), { padding: [50, 50], animate: false });
        }
        // Даем карте прогрузиться чуть дольше для ТГ Desktop
        await new Promise(r => setTimeout(r, 1200));
        return document.getElementById('map');
    }

    async function loadCyrillicFont(doc) {
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const response = await fetch(fontUrl);
        const blob = await response.blob();
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => {
                doc.addFileToVFS('Roboto.ttf', reader.result.split(',')[1]);
                doc.addFont('Roboto.ttf', 'Roboto', 'normal'); doc.setFont('Roboto');
                resolve();
            };
            reader.readAsDataURL(blob);
        });
    }

    // --- PDF ГЕНЕРАТОР (Desktop) ---
    async function generatePDF() {
        if(!currentUser) { document.getElementById('auth-modal').style.display='flex'; return; }
        const btn = document.getElementById('btn-export');
        const oldT = btn.innerHTML; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4'); 
            const pageW = doc.internal.pageSize.getWidth();
            const margin = 10;

            await loadCyrillicFont(doc);
            const mapEl = await prepareMapForCapture();
            
            const mapCanvas = await html2canvas(mapEl, { useCORS: true, scale: 2, allowTaint: true, scrollX: 0, scrollY: 0, backgroundColor: '#ffffff' });
            const mapImg = mapCanvas.toDataURL('image/png');
            
            const imgProps = doc.getImageProperties(mapImg);
            const imgW = pageW - (margin*2);
            const imgH = (imgProps.height * imgW) / imgProps.width;
            doc.addImage(mapImg, 'PNG', margin, margin, imgW, imgH);

            const { body, footer, grandTotal } = getTableData();

            doc.autoTable({
                head: [['Город', 'Дни', 'Км', 'Бензин', 'Жилье', 'Еда', 'Досуг', 'Сув.', 'Итого']],
                body: body,
                foot: [footer],
                startY: margin + imgH + 10,
                theme: 'grid',
                styles: { font: 'Roboto', fontSize: 10, halign: 'center', cellPadding: 2, textColor: 0, lineColor: 200, lineWidth: 0.1 },
                headStyles: { fillColor: [255, 87, 34], textColor: 255, fontStyle: 'bold' },
                footStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: 'bold' },
                columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
                margin: { left: margin, right: margin }
            });

            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12); doc.setTextColor(0); doc.setFont('Roboto');
            doc.text(`Бюджет: ${grandTotal.toLocaleString()} RUB`, pageW - margin, finalY, { align: 'right' });
            
            doc.save('travel-in-lens.ru.pdf');
        } catch(e) { console.error(e); alert("Ошибка PDF: "+e.message); }
        finally { btn.innerHTML = oldT; }
    }

    // --- JPG ГЕНЕРАТОР (Smart Logic) ---
    async function saveAsJPG() {
        const btn = document.activeElement; 
        const oldIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
            // 1. ОПРЕДЕЛЯЕМ УСТРОЙСТВО
            const ua = navigator.userAgent;
            // Ищем признаки реальных мобильных ОС (iOS, Android)
            const isMobileOS = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
            
            // Получаем карту
            const mapEl = document.getElementById('map');
            // Важно: ждем прогрузки тайлов (особенно для ТГ Desktop)
            await new Promise(r => setTimeout(r, 800));

            // Генерируем с чуть большим скейлом (1.5), чтобы и на ПК было норм, и на мобиле не вылетало
            const mapCanvas = await html2canvas(mapEl, { 
                useCORS: true,       
                scale: 1.5,
                allowTaint: false,
                backgroundColor: '#ffffff',
                ignoreElements: (el) => el.classList.contains('leaflet-control-zoom')
            });

            const { body, footer, grandTotal } = getTableData();
            const name = document.getElementById('route-name-inp').value || "Маршрут";

            // Собираем HTML отчет
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

                // РАЗВИЛКА ЛОГИКИ

                if (isMobileOS) {
                    // === СЦЕНАРИЙ ДЛЯ ТЕЛЕФОНОВ ===
                    // Пытаемся "Поделиться"
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                files: [file],
                                title: 'Маршрут',
                                text: `Бюджет: ${grandTotal.toLocaleString()} ₽`
                            });
                            return; 
                        } catch (err) { /* Отмена пользователем - игнор */ }
                    }
                    // Если share не сработал (WebView, Старый Андроид) -> Fallback POPUP
                    showImagePopup(finalCanvas.toDataURL('image/jpeg', 0.9));

                } else {
                    // === СЦЕНАРИЙ ДЛЯ ПК (И ТГ ДЕСКТОП) ===
                    // Просто скачиваем файл. Никаких Share.
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

    function showImagePopup(base64Img) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.8)'; overlay.style.zIndex = '9999';
        overlay.style.display = 'flex'; overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';

        const msg = document.createElement('div');
        msg.innerHTML = "Нажмите на картинку и держите, чтобы сохранить";
        msg.style.color = '#fff'; msg.style.marginBottom = '10px'; msg.style.textAlign='center';

        const img = document.createElement('img');
        img.src = base64Img;
        img.style.maxWidth = '90%'; img.style.maxHeight = '80%';
        img.style.border = '2px solid #fff';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = "Закрыть";
        closeBtn.style.marginTop = '15px'; closeBtn.style.padding = '10px 20px';
        closeBtn.style.background = '#FF5722'; closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none'; closeBtn.style.borderRadius = '5px';
        closeBtn.onclick = () => document.body.removeChild(overlay);

        overlay.appendChild(msg);
        overlay.appendChild(img);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);
    }
});