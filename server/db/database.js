const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Use PostgreSQL in production, SQLite locally
const usePostgres = !!process.env.DATABASE_URL;
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let config;
if (usePostgres) {
  config = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10, idleTimeoutMillis: 30000 },
    ssl: { rejectUnauthorized: false }
  };
  console.log('📦 Using PostgreSQL');
} else {
  config = {
    client: 'sqlite3',
    connection: { filename: path.join(dataDir, 'histology.db') },
    useNullAsDefault: true,
    pool: { afterCreate: (conn, cb) => conn.run('PRAGMA journal_mode = WAL;', cb) }
  };
  console.log('📦 Using SQLite (local dev)');
}

const db = knex(config);

async function initDB() {
  const has = (t) => db.schema.hasTable(t);

  if (!(await has('groups'))) await db.schema.createTable('groups', t => {
    t.increments('id'); t.string('name').notNullable().unique(); t.integer('course').notNullable();
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  if (!(await has('users'))) await db.schema.createTable('users', t => {
    t.increments('id'); t.string('name').notNullable(); t.string('email').notNullable().unique();
    t.string('password').notNullable(); t.string('role').notNullable().defaultTo('student');
    t.integer('group_id'); t.string('position'); t.string('avatar'); t.string('telegram'); t.string('moodle');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Add position col if missing (migration)
  const hasPosCol = await db.schema.hasColumn('users', 'position');
  if (!hasPosCol) await db.schema.table('users', t => t.string('position'));
  const hasAvatarCol = await db.schema.hasColumn('users', 'avatar');
  if (!hasAvatarCol) await db.schema.table('users', t => t.string('avatar'));
  const hasTelegramCol = await db.schema.hasColumn('users', 'telegram');
  if (!hasTelegramCol) await db.schema.table('users', t => t.string('telegram'));
  const hasMoodleCol = await db.schema.hasColumn('users', 'moodle');
  if (!hasMoodleCol) await db.schema.table('users', t => t.string('moodle'));

  if (!(await has('news'))) await db.schema.createTable('news', t => {
    t.increments('id'); t.string('title').notNullable(); t.text('content').notNullable();
    t.string('image'); t.integer('author_id');
    t.timestamp('created_at').defaultTo(db.fn.now()); t.timestamp('updated_at').defaultTo(db.fn.now());
  });

  if (!(await has('events'))) await db.schema.createTable('events', t => {
    t.increments('id'); t.string('title').notNullable(); t.text('description');
    t.string('event_date').notNullable(); t.string('event_type').defaultTo('lecture');
    t.string('zoom_url');
    t.integer('group_id'); t.integer('author_id'); t.timestamp('created_at').defaultTo(db.fn.now());
  });
  const hasEventZoom = await db.schema.hasColumn('events', 'zoom_url');
  if (!hasEventZoom) await db.schema.table('events', t => t.string('zoom_url'));

  if (!(await has('topics'))) await db.schema.createTable('topics', t => {
    t.increments('id'); t.string('name').notNullable(); t.text('description');
    t.integer('course'); t.integer('order_num').defaultTo(0);
  });

  if (!(await has('materials'))) await db.schema.createTable('materials', t => {
    t.increments('id'); t.string('title').notNullable(); t.text('description');
    t.string('file_url'); t.string('file_type').defaultTo('pdf');
    t.integer('topic_id'); t.integer('group_id'); t.integer('author_id');
    t.string('video_url');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  if (!(await has('atlas'))) await db.schema.createTable('atlas', t => {
    t.increments('id'); t.string('name').notNullable(); t.string('latin_name');
    t.text('description'); t.string('staining'); t.string('image_url').notNullable();
    t.integer('topic_id'); t.string('magnification'); t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Moodle links table
  if (!(await has('moodle_links'))) await db.schema.createTable('moodle_links', t => {
    t.increments('id'); t.string('title').notNullable(); t.string('url').notNullable();
    t.text('description'); t.integer('group_id'); t.integer('author_id');
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Group chats / messages
  if (!(await has('messages'))) await db.schema.createTable('messages', t => {
    t.increments('id'); t.integer('group_id').notNullable(); t.integer('author_id').notNullable();
    t.text('content').notNullable(); t.string('image_url'); t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Add image_url to messages if missing
  const hasMessageImage = await db.schema.hasColumn('messages', 'image_url');
  if (!hasMessageImage) await db.schema.table('messages', t => t.string('image_url'));

  // еАристо modules
  if (!(await has('aristo_modules'))) await db.schema.createTable('aristo_modules', t => {
    t.increments('id'); t.string('title').notNullable(); t.text('description');
    t.integer('topic_id'); t.integer('group_id'); t.integer('author_id');
    t.integer('order_num').defaultTo(0); t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // еАристо steps: presentation / test / practical
  if (!(await has('aristo_steps'))) await db.schema.createTable('aristo_steps', t => {
    t.increments('id'); t.integer('module_id').notNullable();
    t.string('step_type').notNullable(); // 'presentation' | 'test' | 'practical'
    t.string('title').notNullable(); t.text('content');
    t.string('file_url'); t.integer('order_num').defaultTo(0);
    t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // еАристо test questions
  if (!(await has('aristo_questions'))) await db.schema.createTable('aristo_questions', t => {
    t.increments('id'); t.integer('step_id').notNullable();
    t.text('question').notNullable(); t.string('option_a'); t.string('option_b');
    t.string('option_c'); t.string('option_d'); t.string('option_e');
    t.string('correct_answer');
    t.integer('order_num').defaultTo(0);
  });

  // еАристо student submissions
  if (!(await has('aristo_submissions'))) await db.schema.createTable('aristo_submissions', t => {
    t.increments('id'); t.integer('module_id').notNullable(); t.integer('step_id').notNullable();
    t.integer('student_id').notNullable(); t.string('submission_type'); // 'test_result' | 'photo'
    t.text('data'); // JSON for test answers, photo url for practical
    t.integer('score'); t.string('status').defaultTo('submitted'); // submitted | graded
    t.text('feedback'); t.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Add video_url to materials if missing
  const hasVideoUrl = await db.schema.hasColumn('materials', 'video_url');
  if (!hasVideoUrl) await db.schema.table('materials', t => t.string('video_url'));

  console.log('✅ Database ready');
}

module.exports = { db, initDB };
