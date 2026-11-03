export const $ = (selector, root=document) => root.querySelector(selector);
export const escapeHTML = (value='') => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
export const categoryLabel = c => ({team:'กีฬาทีม',individual:'กีฬาบุคคล',athletics:'กรีฑา',aquatics:'ว่ายน้ำ'}[c]||'กีฬา');
export const makeId = () => globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
