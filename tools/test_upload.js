const fs = require('fs');
const fetch = global.fetch || require('node-fetch');
(async () => {
  try {
    const csv = fs.readFileSync(__dirname + '/../sample_transactions.csv', 'utf8');
    const res = await fetch('http://localhost:5000/api/csv-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent: csv, fileName: 'sample_transactions.csv' }),
    });
    const j = await res.json();
    console.log(JSON.stringify(j, null, 2));
  } catch (e) {
    console.error('Upload failed', e);
  }
})();
