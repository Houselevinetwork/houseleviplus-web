/**
 * Final migration — fixes gallery_images to match actual R2 bucket structure
 *
 * Actual R2:   pub-f3f3a2f286664ab89a91655c80b0cbf9.r2.dev/lie-or-die-amref-edition/file.jpg
 * MongoDB has: pub-86b552dafa204cbf92ca954b24de5d35.r2.dev/home/lie-or-die/file.jpg
 *
 * Strategy: rebuild publicUrl from the actual r2Key stored in each document.
 * The r2Key tells us the real object path. We just prepend the correct base URL.
 *
 * Run with:
 *   cd api
 *   npx ts-node -r tsconfig-paths/register src/scripts/fix-gallery-urls.ts
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI =
  process.env.MONGODB_URI  ||
  process.env.MONGO_URI    ||
  process.env.DATABASE_URL ||
  'mongodb://localhost:27017/houselevi';

// The correct public base URL for the home bucket
const CORRECT_BASE = 'https://pub-f3f3a2f286664ab89a91655c80b0cbf9.r2.dev';

const imageSchema = new mongoose.Schema({
  publicUrl: String,
  r2Key:     String,
  eventId:   mongoose.Schema.Types.ObjectId,
}, { collection: 'gallery_images' });

const eventSchema = new mongoose.Schema({
  name:          String,
  slug:          String,
  uploadStatus:  String,
  imageCount:    Number,
}, { collection: 'gallery_events' });

const GalleryImage = mongoose.model('MigImage', imageSchema);
const GalleryEvent = mongoose.model('MigEvent', eventSchema);

async function migrate() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  // ── Show all events ──────────────────────────────────────────────────────
  const events = await GalleryEvent.find();
  console.log(`📋 Gallery events in MongoDB (${events.length}):`);
  for (const ev of events) {
    const count = await GalleryImage.countDocuments({ eventId: ev._id });
    console.log(`   - "${ev.name}" (slug: ${ev.slug}) → ${count} images, status: ${ev.uploadStatus}`);
  }

  // ── Show sample images ───────────────────────────────────────────────────
  console.log('\n📸 Sample image records:');
  const samples = await GalleryImage.find().limit(3);
  for (const s of samples) {
    console.log(`   r2Key:     ${s.r2Key}`);
    console.log(`   publicUrl: ${s.publicUrl}`);
    console.log('');
  }

  // ── Fix: rebuild publicUrl from r2Key using correct base URL ─────────────
  // The r2Key is the ground truth — it's what was actually uploaded to R2.
  // We rebuild publicUrl as: CORRECT_BASE + '/' + r2Key
  // This works regardless of what wrong URL was stored before.

  const allImages = await GalleryImage.find();
  console.log(`\n🔧 Fixing ${allImages.length} image records...`);

  let fixed   = 0;
  let skipped = 0;

  for (const img of allImages) {
    if (!img.r2Key) { skipped++; continue; }

    // Build the correct URL from the r2Key
    const correctUrl = `${CORRECT_BASE}/${img.r2Key}`;

    if (img.publicUrl === correctUrl) {
      skipped++;
      continue;
    }

    await GalleryImage.updateOne(
      { _id: img._id },
      { $set: { publicUrl: correctUrl } },
    );
    fixed++;

    if (fixed <= 3 || fixed % 100 === 0) {
      console.log(`  [${fixed}] r2Key:   ${img.r2Key}`);
      console.log(`         URL now: ${correctUrl}`);
      console.log('');
    }
  }

  console.log(`\n✅ Migration complete:`);
  console.log(`   Fixed:   ${fixed} images`);
  console.log(`   Skipped: ${skipped} (already correct)`);

  // ── Verify first image is accessible ─────────────────────────────────────
  const first = await GalleryImage.findOne();
  if (first) {
    console.log(`\n🔗 Test this URL in your browser:`);
    console.log(`   ${CORRECT_BASE}/${first.r2Key}`);
    console.log('\n   If it shows a photo → gallery is fixed!');
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
