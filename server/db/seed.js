const { db, initDB } = require('./database');
const bcrypt = require('bcryptjs');

async function seed() {
  await initDB();
  console.log('🌱 Seeding...');

  // Groups
  const groupData = [
    { name: 'МЕД-201', course: 2 }, { name: 'МЕД-202', course: 2 },
    { name: 'МЕД-203', course: 2 }, { name: 'МЕД-301', course: 3 },
    { name: 'МЕД-302', course: 3 }, { name: 'МЕД-401', course: 4 },
    { name: 'МЕД-7', course: 2 },
  ];
  for (const g of groupData) {
    const ex = await db('groups').where('name', g.name).first();
    if (!ex) await db('groups').insert(g);
  }
  console.log('✅ Groups');

  const hash = bcrypt.hashSync('pdmu2024', 10);
  const teachers = [
    { name: 'Стецук Євген Валерійович', email: 'ye.stetsuk@pdmu.edu.ua', position: 'Завідувач кафедри, к.м.н., доцент' },
    { name: 'Шепітько Володимир Іванович', email: 'v.shepitko@pdmu.edu.ua', position: 'Професор кафедри, д.м.н.' },
    { name: 'Борута Наталія Володимирівна', email: 'n.boruta@pdmu.edu.ua', position: 'Завуч, модератор, к.б.н., доцент' },
    { name: 'Пелипенко Лариса Борисівна', email: 'l.pelypenko@pdmu.edu.ua', position: 'К.м.н., доцент' },
    { name: 'Вільхова Олена Вікторівна', email: 'o.vilkhova@pdmu.edu.ua', position: 'К.м.н., доцент' },
    { name: 'Лисаченко Ольга Дмитрівна', email: 'o.lysachenko@pdmu.edu.ua', position: 'К.б.н., доцент' },
    { name: 'Волошина Олена Валеріївна', email: 'o.voloshyna@pdmu.edu.ua', position: 'Ph.D, доцент' },
    { name: 'Рудь Марія Володимирівна', email: 'm.rud@pdmu.edu.ua', position: 'Викладач' },
    { name: 'Левченко Ольга Анатоліївна', email: 'o.levchenko@pdmu.edu.ua', position: 'Викладач' },
    { name: 'Штепа Катерина Вікторівна', email: 'k.shtepa@pdmu.edu.ua', position: 'Аспірант' },
    { name: 'Данилів Оксана Дмитрівна', email: 'o.danyliv@pdmu.edu.ua', position: 'Старший лаборант' },
  ];

  await db('users').where('role', 'teacher').delete();
  for (const t of teachers) {
    await db('users').insert({ name: t.name, email: t.email, password: hash, role: 'teacher', position: t.position, group_id: null });
  }
  console.log('✅ Teachers');

  // Demo student (no group - teacher assigns)
  const ex = await db('users').where('email', 'student@pdmu.edu.ua').first();
  if (!ex) await db('users').insert({ name: 'Іван Студент', email: 'student@pdmu.edu.ua', password: bcrypt.hashSync('student123', 10), role: 'student', group_id: null });
  console.log('✅ Demo student');

  // Topics only (no demo news/events/materials/atlas)
  const topicsData = [
    { name: 'Епітеліальна тканина', description: 'Будова та функції епітелію', course: 2, order_num: 1 },
    { name: 'Сполучна тканина', description: 'Власна сполучна тканина, хрящова, кісткова', course: 2, order_num: 2 },
    { name: "М'язова тканина", description: 'Гладка, поперечно-смугаста, серцева', course: 2, order_num: 3 },
    { name: 'Нервова тканина', description: 'Нейрони, нейроглія, синапси', course: 2, order_num: 4 },
    { name: 'Кров та лімфа', description: 'Формені елементи крові', course: 2, order_num: 5 },
    { name: 'Серцево-судинна система', description: 'Гістологія серця та судин', course: 3, order_num: 1 },
    { name: 'Травна система', description: 'Гістологія органів травлення', course: 3, order_num: 2 },
  ];
  for (const t of topicsData) {
    const ex = await db('topics').where('name', t.name).first();
    if (!ex) await db('topics').insert(t);
  }
  console.log('✅ Topics');

  console.log('\n🎉 Done! Portal is empty — add content via admin panel.');
  console.log('   Teachers: ye.stetsuk@pdmu.edu.ua / pdmu2024');
  console.log('   Student demo: student@pdmu.edu.ua / student123');
}

if (require.main === module) {
  seed().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { seed };
