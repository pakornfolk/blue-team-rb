
import { supabase, isSupabaseConfigured } from './supabase.js';
import { $, escapeHTML, toast, categoryLabel } from './utils.js';
import { sportIcon } from './icons.js';

let sports = [];
let athletes = [];
let user = null;

// ========================================
// LOAD DATA FROM SUPABASE
// ========================================

async function refresh() {
  if (!isSupabaseConfigured || !supabase) {
    toast('ไม่พบการเชื่อมต่อ Supabase');
    return;
  }

  const [
    { data: s, error: se },
    { data: a, error: ae }
  ] = await Promise.all([
    supabase.from('sports')
      .select('*')
      .order('sort_order'),

    supabase.from('athletes')
      .select('*')
      .order('created_at', { ascending: false })
  ]);

  if (se || ae) {
    console.error(se || ae);
    toast('โหลดข้อมูลไม่สำเร็จ: ' + (se || ae).message);
    return;
  }

  sports = s || [];
  athletes = a || [];

  render();
}

// ========================================
// RENDER DASHBOARD
// ========================================

function render() {
  $('#admin-sport-count').textContent = sports.length;
  $('#admin-athlete-count').textContent = athletes.length;
  $('#connection-mode').textContent = 'LIVE';

  $('#admin-sport-filter').innerHTML =
    '<option value="all">ทุกกีฬา</option>' +
    sports.map(s => `
      <option value="${escapeHTML(s.id)}">
        ${escapeHTML(s.name)}
      </option>
    `).join('');

  $('#athlete-sport').innerHTML =
    sports.map(s => `
      <option value="${escapeHTML(s.id)}">
        ${escapeHTML(s.name)}
      </option>
    `).join('');

  renderAthletes();
  renderSports();
}

// ========================================
// ATHLETE TABLE
// ========================================

function renderAthletes() {
  const q = $('#admin-search').value.trim().toLowerCase();
  const sid = $('#admin-sport-filter').value;
  const grade = $('#admin-grade-filter').value;

  const rows = athletes.filter(a =>
    (!q || (a.name || '').toLowerCase().includes(q)) &&
    (sid === 'all' || String(a.sport_id) === sid) &&
    (grade === 'all' || a.grade === grade)
  );

  $('#athlete-table').innerHTML = rows.length
    ? rows.map(a => {
        const s = sports.find(
          x => String(x.id) === String(a.sport_id)
        );

        return `
          <tr>
            <td>
              <b>${escapeHTML(a.name)}</b>
              <small>${escapeHTML(a.event_label || '')}</small>
            </td>

            <td>${escapeHTML(s?.name || 'ไม่พบกีฬา')}</td>
            <td>${escapeHTML(a.grade || '-')}</td>
            <td>${escapeHTML(a.room || '-')}</td>

            <td>
              <div class="row-actions">
                <button data-edit="${escapeHTML(a.id)}">
                  แก้ไข
                </button>

                <button
                  class="delete-action"
                  data-delete="${escapeHTML(a.id)}">
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="5" class="empty-cell">
          ไม่พบรายชื่อนักกีฬา
        </td>
      </tr>
    `;
}

// ========================================
// SPORTS TABLE
// ========================================

function renderSports() {
  $('#sports-table').innerHTML = sports.length
    ? sports.map(s => `
        <tr>
          <td>
            <b>
              ${sportIcon(s, 19)}
              ${escapeHTML(s.name)}
            </b>
          </td>

          <td>${categoryLabel(s.category)}</td>

          <td>${escapeHTML(s.note || '-')}</td>

          <td>
            ${
              s.line_url
                ? '<span class="has-link">ตั้งค่าแล้ว</span>'
                : '<span class="no-link">ยังไม่ตั้งค่า</span>'
            }
          </td>

          <td>
            <button data-edit-sport="${escapeHTML(s.id)}">
              แก้ไข
            </button>
          </td>
        </tr>
      `).join('')
    : `
      <tr>
        <td colspan="5" class="empty-cell">
          ไม่พบข้อมูลกีฬา
        </td>
      </tr>
    `;
}

// ========================================
// LOGIN & AUTHENTICATION
// ========================================

function showDashboard() {
  $('#login-panel').classList.add('hidden');
  $('#dashboard').classList.remove('hidden');

  refresh();
}

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();

  if (!isSupabaseConfigured || !supabase) {
    toast('ยังไม่ได้ตั้งค่า Supabase');
    return;
  }

  const email = $('#email').value.trim();
  const password = $('#password').value;

  const button = $('#login-form').querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;
  button.textContent = 'กำลังเข้าสู่ระบบ...';

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      toast('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
      return;
    }

    user = data.user;

    const { data: profile, error: profileError } =
      await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (profileError) {
      console.error(profileError);
      await supabase.auth.signOut();
      toast('ตรวจสอบสิทธิ์ผู้ดูแลไม่สำเร็จ');
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      toast('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล');
      return;
    }

    showDashboard();
    toast('เข้าสู่ระบบสำเร็จ');

  } catch (error) {
    console.error(error);
    toast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');

  } finally {
    button.disabled = false;
    button.innerHTML = 'เข้าสู่ระบบ <span>→</span>';
  }
});

// ========================================
// LOGOUT
// ========================================

$('#logout').addEventListener('click', async () => {
  if (!confirm('ต้องการออกจากระบบหรือไม่?')) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    toast('ออกจากระบบไม่สำเร็จ');
    return;
  }

  location.reload();
});

// ========================================
// CHECK EXISTING SESSION
// ========================================

async function checkSession() {
  if (!isSupabaseConfigured || !supabase) {
    $('#login-description').textContent =
      'ไม่สามารถเชื่อมต่อ Supabase ได้ กรุณาตรวจสอบการตั้งค่า';

    return;
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!data.session) return;

    user = data.session.user;

    const { data: profile, error: profileError } =
      await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    if (profile) {
      showDashboard();
    } else {
      await supabase.auth.signOut();
      toast('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแล');
    }

  } catch (error) {
    console.error(error);
    toast('ตรวจสอบสถานะ Login ไม่สำเร็จ');
  }
}

// ========================================
// ATHLETE GRADE OPTIONS
// ========================================

function updateAthleteGrades(selected = '') {
  const sport = sports.find(
    s => String(s.id) === $('#athlete-sport').value
  );

  const values = sport?.divisions || [];

  $('#athlete-grade').innerHTML = values.map(g => `
    <option value="${escapeHTML(g)}">
      ${escapeHTML(g)}
    </option>
  `).join('');

  if (values.includes(selected)) {
    $('#athlete-grade').value = selected;
  }
}

$('#athlete-sport').addEventListener('change', () => {
  updateAthleteGrades();
});

// ========================================
// OPEN / CLOSE ATHLETE FORM
// ========================================

function openAthlete(a = null) {
  if (!sports.length) {
    toast('ยังไม่มีประเภทกีฬา');
    return;
  }

  $('#athlete-form').reset();

  $('#athlete-id').value = a?.id || '';

  $('#form-title').textContent = a
    ? 'แก้ไขข้อมูลนักกีฬา'
    : 'เพิ่มนักกีฬา';

  if (a) {
    $('#athlete-name').value = a.name;
    $('#athlete-sport').value = a.sport_id;

    updateAthleteGrades(a.grade);

    $('#athlete-room').value = a.room || '';
    $('#athlete-event').value = a.event_label || '';
    $('#athlete-note').value = a.note || '';

  } else {
    updateAthleteGrades();
  }

  $('#athlete-form-modal').classList.add('open');
}

function closeAthlete() {
  $('#athlete-form-modal').classList.remove('open');
}

$('#add-athlete').addEventListener('click', () => {
  openAthlete();
});

$('#form-close').addEventListener('click', closeAthlete);
$('#cancel-form').addEventListener('click', closeAthlete);

// ========================================
// SAVE ATHLETE
// ========================================

$('#athlete-form').addEventListener('submit', async e => {
  e.preventDefault();

  const id = $('#athlete-id').value;

  const row = {
    name: $('#athlete-name').value.trim(),
    sport_id: $('#athlete-sport').value,
    grade: $('#athlete-grade').value,
    room: $('#athlete-room').value.trim(),
    event_label: $('#athlete-event').value.trim(),
    note: $('#athlete-note').value.trim()
  };

  if (!row.sport_id || !row.grade || !row.name) {
    toast('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const button = $('#athlete-form').querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;

  try {
    const result = id
      ? await supabase.from('athletes').update(row).eq('id', id)
      : await supabase.from('athletes').insert(row);

    if (result.error) {
      toast('บันทึกไม่สำเร็จ: ' + result.error.message);
      return;
    }

    closeAthlete();
    await refresh();

    toast('บันทึกข้อมูลเรียบร้อย');

  } catch (error) {
    console.error(error);
    toast('เกิดข้อผิดพลาดในการบันทึก');

  } finally {
    button.disabled = false;
  }
});

// ========================================
// EDIT / DELETE ATHLETE
// ========================================

$('#athlete-table').addEventListener('click', async e => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-delete]');

  if (edit) {
    const a = athletes.find(
      x => String(x.id) === edit.dataset.edit
    );

    if (a) openAthlete(a);
  }

  if (del) {
    const a = athletes.find(
      x => String(x.id) === del.dataset.delete
    );

    if (!a) return;

    if (!confirm(`ยืนยันลบรายชื่อ ${a.name} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', a.id);

      if (error) {
        toast('ลบไม่สำเร็จ: ' + error.message);
        return;
      }

      await refresh();
      toast('ลบรายชื่อเรียบร้อย');

    } catch (error) {
      console.error(error);
      toast('เกิดข้อผิดพลาดในการลบ');
    }
  }
});

// ========================================
// ATHLETE FILTERS
// ========================================

$('#admin-search').addEventListener('input', renderAthletes);

$('#admin-sport-filter').addEventListener(
  'change',
  renderAthletes
);

$('#admin-grade-filter').addEventListener(
  'change',
  renderAthletes
);

// ========================================
// DASHBOARD TABS
// ========================================

$('#dashboard').addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');

  if (!tab) return;

  document.querySelectorAll('.tab').forEach(x => {
    x.classList.toggle('active', x === tab);
  });

  const sportsTab = tab.dataset.tab === 'sports';

  $('#athletes-panel').classList.toggle(
    'hidden',
    sportsTab
  );

  $('#sports-panel').classList.toggle(
    'hidden',
    !sportsTab
  );

  $('#admin-section-title').textContent = sportsTab
    ? 'จัดการกีฬา'
    : 'รายชื่อนักกีฬา';

  $('#add-athlete').classList.toggle(
    'hidden',
    sportsTab
  );
});

// ========================================
// EDIT SPORT
// ========================================

function openSportEdit(s) {
  $('#edit-sport-id').value = s.id;
  $('#edit-sport-name').value = s.name;
  $('#edit-sport-note').value = s.note || '';
  $('#edit-sport-line').value = s.line_url || '';

  $('#sport-form-modal').classList.add('open');
}

$('#sports-table').addEventListener('click', e => {
  const button = e.target.closest('[data-edit-sport]');

  if (!button) return;

  const sport = sports.find(
    s => String(s.id) === button.dataset.editSport
  );

  if (sport) openSportEdit(sport);
});

// ========================================
// CLOSE SPORT FORM
// ========================================

function closeSportForm() {
  $('#sport-form-modal').classList.remove('open');
}

$('#sport-form-close').addEventListener(
  'click',
  closeSportForm
);

$('#cancel-sport-form').addEventListener(
  'click',
  closeSportForm
);

// ========================================
// SAVE SPORT
// ========================================

$('#sport-form').addEventListener('submit', async e => {
  e.preventDefault();

  const id = $('#edit-sport-id').value;

  const row = {
    name: $('#edit-sport-name').value.trim(),
    note: $('#edit-sport-note').value.trim(),
    line_url: $('#edit-sport-line').value.trim() || null
  };

  if (!id || !row.name) {
    toast('กรุณากรอกชื่อกีฬา');
    return;
  }

  const button = $('#sport-form').querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;

  try {
    const { error } = await supabase
      .from('sports')
      .update(row)
      .eq('id', id);

    if (error) {
      toast('บันทึกไม่สำเร็จ: ' + error.message);
      return;
    }

    closeSportForm();

    await refresh();

    toast('อัปเดตข้อมูลกีฬาเรียบร้อย');

  } catch (error) {
    console.error(error);
    toast('เกิดข้อผิดพลาดในการบันทึก');

  } finally {
    button.disabled = false;
  }
});

// ========================================
// START ADMIN
// ========================================

checkSession();
