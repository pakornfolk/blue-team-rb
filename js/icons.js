
export function icon(name, size = 20) {
  const icons = {
    'arrow-up-right': 'fa-arrow-up-right',
    'arrow-right': 'fa-arrow-right',
    'arrow-left': 'fa-arrow-left',
    'arrow-down': 'fa-arrow-down',
    'search': 'fa-magnifying-glass',
    'close': 'fa-xmark',
    'check': 'fa-check',
    'users': 'fa-users',
    'trophy': 'fa-trophy',
    'settings': 'fa-gear',
    'plus': 'fa-plus',
    'edit': 'fa-pen',
    'trash': 'fa-trash'
  };

  const faIcon = icons[name] || 'fa-circle';

  return `
    <i class="fa-solid ${faIcon}"
       style="font-size:${Number(size)}px"
       aria-hidden="true"></i>
  `;
}

export function sportIcon(sport, size = 27) {
  const name = (sport.name || '').toLowerCase();

  let faIcon = 'fa-medal';

  if (name.includes('ฟุตบอล')) {
    faIcon = 'fa-futbol';
  }
  else if (name.includes('บาสเกตบอล')) {
    faIcon = 'fa-basketball';
  }
  else if (name.includes('เซปักตะกร้อ')) {
    faIcon = 'fa-volleyball';
  }
  else if (name.includes('วอลเลย์บอล')) {
    faIcon = 'fa-volleyball';
  }
  else if (name.includes('เทเบิลเทนนิส')) {
    faIcon = 'fa-table-tennis-paddle-ball';
  }
  else if (name.includes('แบดมินตัน')) {
    faIcon = 'fa-feather';
  }
  else if (name.includes('กรีฑา')) {
    faIcon = 'fa-person-running';
  }
  else if (name.includes('ว่ายน้ำ')) {
    faIcon = 'fa-person-swimming';
  }

  return `
    <i class="fa-solid ${faIcon}"
       style="font-size:${Number(size)}px"
       aria-hidden="true"></i>
  `;
}
