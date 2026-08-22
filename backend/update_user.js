import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const updateUser = async () => {
  try {
    const passwordHash = await bcrypt.hash('123456789', 10);
    const userId = '101';
    const name = 'Alazhar';
    const email = 'az@gmail.com';
    const role = 'Lead Explorer';
    const avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

    // 1. Remove Alex Morgan user
    await pool.query('DELETE FROM users WHERE email = ? OR id = ?', ['alex@example.com', 'usr_demo_101']);
    console.log('🗑️ Removed Alex Morgan user.');

    // 2. Insert or Update Alazhar user
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       email = VALUES(email),
       password_hash = VALUES(password_hash),
       role = VALUES(role),
       avatar = VALUES(avatar)`,
      [userId, name, email, passwordHash, role, avatar]
    );
    console.log(`✅ Created/Updated user "${name}" (${email}) with ID "${userId}".`);

    // 3. Update existing trips user reference
    await pool.query('UPDATE trips SET user_id = ?, created_user = ? WHERE user_id = ? OR created_user = ? OR user_id IS NULL', [
      userId,
      name,
      'usr_demo_101',
      'Alex Morgan',
    ]);
    console.log('✅ Updated trip user references to Alazhar.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    process.exit(1);
  }
};

updateUser();
