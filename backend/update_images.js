import { pool } from './db.js';

const CITY_PHOTOS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1565967511849-76a61a516170?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1473951574080-01fe45ec8643?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80',
];

const updateDestinationImages = async () => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM destinations');
    console.log(`Updating photos for ${rows.length} destinations in MySQL...`);

    for (let i = 0; i < rows.length; i++) {
      const dest = rows[i];
      // Generate consistent hash based on destination ID/name
      let hash = 0;
      const str = dest.id + dest.name;
      for (let c = 0; c < str.length; c++) {
        hash = (hash << 5) - hash + str.charCodeAt(c);
        hash |= 0;
      }
      const photoIdx = Math.abs(hash) % CITY_PHOTOS.length;
      const selectedPhoto = CITY_PHOTOS[photoIdx];

      await pool.query('UPDATE destinations SET image = ? WHERE id = ?', [selectedPhoto, dest.id]);
    }

    // Also update activities images
    const [actRows] = await pool.query('SELECT id, name, city_id FROM activities');
    console.log(`Updating photos for ${actRows.length} activities in MySQL...`);

    for (let j = 0; j < actRows.length; j++) {
      const act = actRows[j];
      let hash = 0;
      const str = act.id + act.name;
      for (let c = 0; c < str.length; c++) {
        hash = (hash << 5) - hash + str.charCodeAt(c);
        hash |= 0;
      }
      const photoIdx = Math.abs(hash + j) % CITY_PHOTOS.length;
      const selectedPhoto = CITY_PHOTOS[photoIdx];

      await pool.query('UPDATE activities SET image = ? WHERE id = ?', [selectedPhoto, act.id]);
    }

    console.log('✅ All destination and activity photos updated with unique high-quality travel images!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating destination photos:', error);
    process.exit(1);
  }
};

updateDestinationImages();
