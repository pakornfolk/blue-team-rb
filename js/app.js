
import { supabase, isSupabaseConfigured } from './supabase.js';
import { readDemo, seedSports } from './data.js';
import { $, escapeHTML, toast, categoryLabel } from './utils.js';
import { icon, sportIcon } from './icons.js';

let sports = [], athletes = [], activeSport = null, activeCategory = 'all', realtimeChannel = null;

async function loadData() {
  if (isSupabaseConfigured) {
    const [{ data: s, error: se }, { data: a, error: ae }] = await Promise.all([
      supabase.from('sports').select('*').eq('active', true).order('sort_order'),
      supabase.from('athletes').select('*').order('created_at', { ascending: false })
    ]);

    if (se || ae) {
      console.error(se || ae);
      toast('โหลดข้อมูลไม่สำเร็จ กรุณาตรวจสอบ Supabase');
      return;
    }

    sports = s || [];
    athletes = a || [];

    if (realtimeChannel) await supabase.removeChannel(realtimeChannel);

    realtimeChannel = supabase.channel('public-roster')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'athletes' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sports' }, loadData)
      .subscribe();

  } else {
    const d = readDemo();
    sports = d.sports;
    athletes = d.athletes;
  }

  renderSports();
  $('#athlete-count').textContent = athletes.length;
  $('#sport-count').textContent = sports.length;
}

function renderSports() {
  const q = $('#sport-search').value.trim().toLowerCase();

  const list = sports.filter(s =>
    (activeCategory === 'all' || s.category === activeCategory) &&
    (`${s.name} ${s.note || ''}`).toLowerCase().includes(q)
  );

  $('#visible-count').textContent = list.length;

  $('#sports-grid').innerHTML = list.length
    ? list.map(s => `
      <button class="sport-card" data-sport="${escapeHTML(s.id)}">
        <span class="card-topline">
          <span>${categoryLabel(s.category)}</span>
          <span class="card-arrow">${icon('arrow-up-right', 18)}</span>
        </span>
        <span class="sport-icon">${sportIcon(s, 27)}</span>
        <strong>${escapeHTML(s.name)}</strong>
        <small>${escapeHTML(s.note || 'ดูรายชื่อนักกีฬา')}</small>
        <span class="card-bottom">
          <span>${(s.divisions || []).length} รุ่น / ระดับ</span>
          <b>ดูรายชื่อ ${icon('arrow-right', 14)}</b>
        </span>
      </button>
    `).join('')
    : '<div class="empty-state">ไม่พบประเภทกีฬาที่ค้นหา</div>';

  $('#sports-grid').querySelectorAll('[data-sport]').forEach(btn =>
    btn.addEventListener('click', () => openSport(btn.dataset.sport))
  );
}

function openSport(id) {
  activeSport = sports.find(s => String(s.id) === String(id));
  if (!activeSport) return;

  $('#modal-icon').innerHTML = sportIcon(activeSport, 32);
  $('#modal-title').textContent = activeSport.name;
  $('#modal-note').textContent = activeSport.note || '';
  $('#athlete-search').value = '';

  const filter = $('#grade-filter');

  filter.innerHTML = '<option value="all">ทุกระดับที่แข่งขันได้</option>' +
    [...new Set(activeSport.divisions || [])]
      .map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`)
      .join('');

  filter.value = 'all';

  $('#line-link').href = activeSport.line_url || '#';
  $('#line-link').classList.toggle('disabled', !activeSport.line_url);
  $('#line-link').setAttribute('aria-disabled', String(!activeSport.line_url));

  renderAthletes();

  $('#sport-modal').classList.add('open');
  $('#sport-modal').setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function renderAthletes() {
  if (!activeSport) return;

  const q = $('#athlete-search').value.trim().toLowerCase();
  const grade = $('#grade-filter').value;

  const rows = athletes.filter(a =>
    String(a.sport_id) === String(activeSport.id) &&
    (!grade || grade === 'all' || a.grade === grade) &&
    (`${a.name} ${a.room || ''} ${a.event_label || ''}`)
      .toLowerCase().includes(q)
  );

  const groups = {};

  rows.forEach(a => {
    const g = a.grade || 'ไม่ระบุระดับ';
    (groups[g] ??= []).push(a);
  });

  const preferred = activeSport.divisions?.length
    ? activeSport.divisions
    : Object.keys(groups);

  const order = [
    ...preferred,
    ...Object.keys(groups).filter(g => !preferred.includes(g))
  ];

  $('#athlete-groups').innerHTML = rows.length
    ? order.filter(g => groups[g]).map(g => `
      <section class="grade-group">
        <div class="grade-heading">
          <b>${escapeHTML(g)}</b>
          <span>${groups[g].length} คน</span>
        </div>

        <div class="athlete-list">
          ${groups[g].map((a, i) => `
            <article class="athlete-row">

              <span class="athlete-number">
                ${String(i + 1).padStart(2, '0')}
              </span>

              <span class="athlete-avatar">
                <i class="fa-solid fa-user" aria-hidden="true"></i>
              </span>

              <span class="athlete-info">
                <b>${escapeHTML(a.name)}</b>
                <small>
                  ${[
                    a.room ? `ห้อง ${a.room}` : '',
                    a.event_label || '',
                    a.note || ''
                  ].filter(Boolean).map(escapeHTML).join(' · ') || 'นักกีฬา BLUE TEAM'}
                </small>
              </span>

            </article>
          `).join('')}
        </div>
      </section>
    `).join('')
    : `
      <div class="empty-state">
        ยังไม่มีรายชื่อนักกีฬาในประเภทนี้
        <small>รอผู้ดูแลประกาศรายชื่ออย่างเป็นทางการ</small>
      </div>
    `;
}

function closeModal() {
  $('#sport-modal').classList.remove('open');
  $('#sport-modal').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  activeSport = null;
}

$('#sport-search').addEventListener('input', renderSports);

$('#category-filters').addEventListener('click', e => {
  const b = e.target.closest('[data-category]');
  if (!b) return;

  activeCategory = b.dataset.category;

  $('#category-filters').querySelectorAll('.chip').forEach(x =>
    x.classList.toggle('active', x === b)
  );

  renderSports();
});

$('#modal-close').addEventListener('click', closeModal);

$('#sport-modal').addEventListener('click', e => {
  if (e.target === $('#sport-modal')) closeModal();
});

$('#athlete-search').addEventListener('input', renderAthletes);
$('#grade-filter').addEventListener('change', renderAthletes);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

$('#year').textContent = new Date().getFullYear();

loadData();
