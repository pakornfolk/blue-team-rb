export const grades = ['ม.1', 'ม.2-3', 'ม.4-5'];
export const seedSports = [
 {id:'football',name:'ฟุตบอล',category:'team',icon:'circle-dot',note:'รอประกาศรายละเอียดรุ่นการแข่งขัน',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:1},
 {id:'basketball',name:'บาสเกตบอล',category:'team',icon:'circle-dot',note:'ม.1 ไม่สามารถลงแข่งขันได้',divisions:['ม.2-3','ม.4-5'],sort_order:2},
 {id:'takraw',name:'เซปักตะกร้อ',category:'team',icon:'circle-dot',note:'ม.1 ไม่สามารถลงแข่งขันได้',divisions:['ม.2-3','ม.4-5'],sort_order:3},
 {id:'volleyball',name:'วอลเลย์บอล',category:'team',icon:'circle-dot',note:'รวมทุกระดับ ไม่มีแบ่งแยก',divisions:['รวมทุกระดับ'],sort_order:4},
 {id:'table-tennis',name:'เทเบิลเทนนิส',category:'individual',icon:'table-tennis',note:'ประเภทเดี่ยว',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:5},
 {id:'badminton',name:'แบดมินตัน',category:'individual',icon:'activity',note:'ประเภทเดี่ยว / คู่',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:6},
 {id:'run-50',name:'กรีฑา 50 เมตร',category:'athletics',icon:'timer',note:'วิ่งระยะ 50 เมตร',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:7},
 {id:'run-100',name:'กรีฑา 100 เมตร',category:'athletics',icon:'timer',note:'วิ่งระยะ 100 เมตร',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:8},
 {id:'run-200',name:'กรีฑา 200 เมตร',category:'athletics',icon:'timer',note:'วิ่งระยะ 200 เมตร',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:9},
 {id:'relay-4x50',name:'กรีฑา 4×50 เมตร',category:'athletics',icon:'route',note:'วิ่งผลัด 4×50 เมตร',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:10},
 {id:'relay-8x25',name:'กรีฑา 8×25 เมตร',category:'athletics',icon:'route',note:'วิ่งผลัด 8×25 เมตร',divisions:['ม.1','ม.2-3','ม.4-5'],sort_order:11},
 {id:'swim-25',name:'ว่ายน้ำ 25 เมตร',category:'aquatics',icon:'waves',note:'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',divisions:['ม.1-ม.3','ม.4-ม.5'],sort_order:12},
 {id:'swim-50',name:'ว่ายน้ำ 50 เมตร',category:'aquatics',icon:'waves',note:'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',divisions:['ม.1-ม.3','ม.4-ม.5'],sort_order:13},
 {id:'swim-relay-4x25',name:'ว่ายน้ำ 4×25 เมตร',category:'aquatics',icon:'waves',note:'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',divisions:['ม.1-ม.3','ม.4-ม.5'],sort_order:14},
 {id:'swim-medley',name:'ว่ายน้ำ 4×25 เมตร ผลัดผสม',category:'aquatics',icon:'waves',note:'แบ่งรุ่น ม.1–ม.3 และ ม.4–ม.5',divisions:['ม.1-ม.3','ม.4-ม.5'],sort_order:15},
 {id:'swim-4x25-m1',name:'ว่ายน้ำ 4×25 เมตร (ม.1)',category:'aquatics',icon:'waves',note:'สำหรับนักเรียนระดับ ม.1',divisions:['ม.1'],sort_order:16}
];
const KEY='blue-team-demo-v1';
export function readDemo(){try{const raw=JSON.parse(localStorage.getItem(KEY));return raw||{sports:seedSports.map(s=>({...s,line_url:''})),athletes:[]};}catch{return {sports:seedSports.map(s=>({...s,line_url:''})),athletes:[]};}}
export function writeDemo(data){localStorage.setItem(KEY,JSON.stringify(data));}
export function resetDemo(){localStorage.removeItem(KEY);}
