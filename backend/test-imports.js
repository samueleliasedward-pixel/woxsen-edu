console.log('1. Testing imports...');

try {
  console.log('2. Importing app...');
  const appModule = await import('./src/app.js');
  console.log('✅ app imported:', Object.keys(appModule));
} catch (error) {
  console.error('❌ app import failed:', error.message);
  console.error('Full error:', error);
}

try {
  console.log('3. Importing db...');
  const dbModule = await import('./src/config/db.js');
  console.log('✅ db imported:', Object.keys(dbModule));
} catch (error) {
  console.error('❌ db import failed:', error.message);
  console.error('Full error:', error);
}

try {
  console.log('4. Importing env...');
  const envModule = await import('./src/config/env.js');
  console.log('✅ env imported:', Object.keys(envModule));
} catch (error) {
  console.error('❌ env import failed:', error.message);
  console.error('Full error:', error);
}

try {
  console.log('5. Importing logger...');
  const loggerModule = await import('./src/utils/logger.js');
  console.log('✅ logger imported:', Object.keys(loggerModule));
} catch (error) {
  console.error('❌ logger import failed:', error.message);
  console.error('Full error:', error);
}

try {
  console.log('6. Importing reminder job...');
  const jobModule = await import('./src/jobs/reminder.job.js');
  console.log('✅ reminder job imported:', Object.keys(jobModule));
} catch (error) {
  console.error('❌ reminder job import failed:', error.message);
  console.error('Full error:', error);
}
