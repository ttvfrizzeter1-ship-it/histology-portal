const { db, initDB } = require('../server/db/database');

const TOPIC_NAME = 'Епітеліальна тканина';

const MATERIALS = [
  {
    title: 'Модуль 1: Лекції ОПП Медицина (навігація по темах)',
    description:
      'Сторінка кафедри з переліком лекцій. У модулі є тема "Введення до вчення про тканини. Епітеліальні тканини".',
    file_url: 'https://histology.pdmu.edu.ua/educational/masters/medicine/lecture/oc/modul-1',
    file_type: 'doc',
    video_url: null,
  },
  {
    title: 'Навчальний посібник: епітеліальна тканина (розділ 3.1)',
    description:
      'Костиленко Ю.П., Шепітько В.І. У посібнику окремо виділено розділ "3.1. Епітеліальна тканина".',
    file_url:
      'https://histology.pdmu.edu.ua/storage/educational_masters_dentistry_additional_materials/files/qIBsr8dcv7DZ8g5rCMMoDPC2gGljIiOORDbe1eqz.pdf',
    file_type: 'pdf',
    video_url: null,
  },
  {
    title: 'Лекційний матеріал: епітелій дихальних шляхів',
    description:
      'Матеріал із прикладами багаторядного війчастого та багатошарового плоского епітелію (глотка, гортань, бронхи).',
    file_url:
      'https://histology.pdmu.edu.ua/storage/educational_masters_pediatrics_lecture_oc/files/4tUPDMOfxM1pFBZYUUP3TKnEjWgf0evL8M3g4s6w.pdf',
    file_type: 'pdf',
    video_url: null,
  },
  {
    title: 'Термінологія: Type I. Epithelial tissues',
    description:
      'Англомовний довідник кафедри з класифікацією та ключовими термінами епітеліальних тканин.',
    file_url:
      'https://histology.pdmu.edu.ua/storage/educational_forenger_students_masters_dentistry_additional_materials/files/9i0qeRZ0aa2AhS8S1h2JmtLZOnH6eMfp4YmWuSc4.pdf',
    file_type: 'pdf',
    video_url: null,
  },
  {
    title: 'Силабус (Стоматологія): перелік питань з епітелію',
    description:
      'Силабус кафедри з темами 3-10: епітеліальні тканини, класифікація, покривний та залозистий епітелій.',
    file_url:
      'https://histology.pdmu.edu.ua/educational/masters/dentistry/syllabus/oc/silabus-dlya-studentiv-specialnist-stomatologiya-sntn',
    file_type: 'doc',
    video_url: null,
  },
  {
    title: 'Силабус (Медична психологія): лекція про епітелій',
    description:
      'Тема лекції: "Епітеліальні тканини. Залозистий епітелій". Окреслено морфофункціональні особливості та класифікацію.',
    file_url:
      'https://histology.pdmu.edu.ua/educational/masters/medical-psychology/syllabus/oc/silabus-dlya-zdobuvachiv-vishchoyi-osviti-z-opp-medichna-psihologiya',
    file_type: 'doc',
    video_url: null,
  },
  {
    title: 'Навчальні матеріали кафедри (розділ Освіта)',
    description:
      'Загальний розділ з освітніми матеріалами кафедри для доступу до актуальних навчальних блоків і додаткових джерел.',
    file_url: 'https://histology.pdmu.edu.ua/educational',
    file_type: 'doc',
    video_url: null,
  },
  {
    title: 'Сторінка для здобувачів вищої освіти',
    description:
      'Розділ для студентів із переходом до матеріалів за рівнями підготовки та програмами навчання.',
    file_url: 'https://histology.pdmu.edu.ua/educational/students',
    file_type: 'doc',
    video_url: null,
  },
  {
    title: 'Додатково: навчальний процес кафедри (відео-сторінка ПДМУ)',
    description:
      'Огляд сучасних підходів до навчання на кафедрі гістології, цитології та ембріології ПДМУ.',
    file_url:
      'https://www.pdmu.edu.ua/video/navchalniy-proces-na-kafedri-gistologiyi-citologiyi-ta-embriologiyi-z-vikoristannyam-suchasnih-tehnologiy',
    file_type: 'video',
    video_url: null,
  },
];

const ATLAS_ITEMS = [
  {
    name: 'Одношаровий плоский епітелій (ендотелій)',
    latin_name: 'Epithelium simplex squamosum',
    description:
      'Тонкий шар плоских клітин із сплощеними ядрами. Орієнтир: вистилання просвіту судин, мінімальна товщина цитоплазми.',
    staining: 'Г/Е',
    magnification: '×400',
    image_url: '/slides/slide7.png',
  },
  {
    name: 'Одношаровий кубічний епітелій (ниркові канальці)',
    latin_name: 'Epithelium simplex cuboideum',
    description:
      'Клітини приблизно однакові за висотою і шириною, округлі ядра в центрі. Типова локалізація: канальці нирки.',
    staining: 'Г/Е',
    magnification: '×400',
    image_url: '/slides/slide6.jpg',
  },
  {
    name: 'Одношаровий призматичний епітелій (тонка кишка)',
    latin_name: 'Epithelium simplex columnare',
    description:
      'Високі призматичні клітини, часто видно келихоподібні клітини та щіточкову облямівку. Характерний для слизової тонкої кишки.',
    staining: 'Г/Е',
    magnification: '×200',
    image_url: '/topic-banners/epithelial.jpg',
  },
  {
    name: 'Багаторядний війчастий епітелій (трахея)',
    latin_name: 'Epithelium pseudostratificatum ciliatum',
    description:
      'Ядра на різних рівнях, війки на апікальній поверхні, наявні келихоподібні клітини. Типовий респіраторний епітелій.',
    staining: 'Г/Е',
    magnification: '×200',
    image_url: '/slides/slide3.jpg',
  },
  {
    name: 'Багатошаровий плоский незроговілий епітелій (стравохід)',
    latin_name: 'Epithelium stratificatum squamosum noncornificatum',
    description:
      'Кілька шарів клітин, поверхневі клітини сплощені, без рогового шару. Локалізація: стравохід, ротова порожнина.',
    staining: 'Г/Е',
    magnification: '×200',
    image_url: '/slides/slide4.jpg',
  },
  {
    name: 'Багатошаровий плоский зроговілий епітелій (шкіра)',
    latin_name: 'Epithelium stratificatum squamosum cornificatum',
    description:
      'Виражений роговий шар, під ним шари багатошарового плоского епітелію. Захисна механічна та барʼєрна функція.',
    staining: 'Г/Е',
    magnification: '×100',
    image_url: '/slides/slide5.jpg',
  },
  {
    name: 'Перехідний епітелій (сечовий міхур)',
    latin_name: 'Epithelium transitionale (urothelium)',
    description:
      'Змінна товщина епітелію, великі куполоподібні поверхневі клітини (umbrella cells), адаптація до розтягнення.',
    staining: 'Г/Е',
    magnification: '×200',
    image_url: '/slides/slide2.jpg',
  },
  {
    name: 'Залозистий епітелій (екзокринна залоза)',
    latin_name: 'Epithelium glandulare',
    description:
      'Секреторні відділи та вивідні протоки, клітини з полярністю і секреторною активністю. Орієнтир на ацинуси/тубули.',
    staining: 'Г/Е',
    magnification: '×400',
    image_url: '/slides/slide1.jpg',
  },
];

async function getOrCreateTopic() {
  let topic = await db('topics')
    .whereRaw('LOWER(name) = LOWER(?)', [TOPIC_NAME])
    .first();

  if (!topic) {
    const [id] = await db('topics').insert({
      name: TOPIC_NAME,
      description: 'Будова, класифікація та функції епітеліальних тканин',
      course: 2,
      order_num: 1,
    });
    topic = await db('topics').where({ id }).first();
  }

  return topic;
}

async function resolveAuthorId() {
  const teacher = await db('users').where({ role: 'teacher' }).orderBy('id', 'asc').first();
  return teacher?.id || null;
}

async function upsertMaterials(topicId, authorId) {
  let inserted = 0;
  let updated = 0;

  for (const material of MATERIALS) {
    const existing = await db('materials')
      .where({ topic_id: topicId, title: material.title })
      .first();

    const payload = {
      title: material.title,
      description: material.description,
      file_url: material.file_url,
      file_type: material.file_type,
      topic_id: topicId,
      group_id: null,
      author_id: authorId,
      video_url: material.video_url,
    };

    if (existing) {
      await db('materials').where({ id: existing.id }).update(payload);
      updated += 1;
    } else {
      await db('materials').insert(payload);
      inserted += 1;
    }
  }

  return { inserted, updated };
}

async function upsertAtlas(topicId) {
  let inserted = 0;
  let updated = 0;

  for (const item of ATLAS_ITEMS) {
    const existing = await db('atlas').where({ topic_id: topicId, name: item.name }).first();
    const payload = { ...item, topic_id: topicId };

    if (existing) {
      await db('atlas').where({ id: existing.id }).update(payload);
      updated += 1;
    } else {
      await db('atlas').insert(payload);
      inserted += 1;
    }
  }

  return { inserted, updated };
}

async function run() {
  await initDB();

  const topic = await getOrCreateTopic();
  const authorId = await resolveAuthorId();

  const materialsResult = await upsertMaterials(topic.id, authorId);
  const atlasResult = await upsertAtlas(topic.id);

  const materialCount = await db('materials').where({ topic_id: topic.id }).count({ c: 'id' }).first();
  const atlasCount = await db('atlas').where({ topic_id: topic.id }).count({ c: 'id' }).first();

  console.log(`Topic: ${topic.name} (id=${topic.id})`);
  console.log(`Materials: +${materialsResult.inserted}, updated ${materialsResult.updated}, total ${materialCount.c}`);
  console.log(`Atlas: +${atlasResult.inserted}, updated ${atlasResult.updated}, total ${atlasCount.c}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
