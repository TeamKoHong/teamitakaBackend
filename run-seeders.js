const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/models');

async function runSeeders() {
  try {
    console.log('🌱 Starting seeding process...\n');
    
    const seedersPath = path.join(__dirname, 'src', 'seeders');
    const seederFiles = fs.readdirSync(seedersPath)
      .filter(file => file.endsWith('.js'))
      .sort(); // Alphabetical order ensures our numbered files run correctly

    for (const file of seederFiles) {
      console.log(`📄 Running seeder: ${file}`);
      const seeder = require(path.join(seedersPath, file));
      
      if (typeof seeder.up === 'function') {
        await seeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✅ ${file} completed\n`);
      } else {
        console.log(`⚠️  ${file} has no 'up' function, skipping\n`);
      }
    }

    console.log('🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
