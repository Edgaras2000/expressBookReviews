const https = require('https');
const fs = require('fs');
const url = 'https://api.github.com/repos/Edgaras2000/expressBookReviews';

const options = {
  headers: {
    'User-Agent': 'GitHub-Repo-Checker'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.setEncoding('utf8');
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const parent = json.parent ? json.parent.full_name : null;
      const content = `curl -s https://api.github.com/repos/Edgaras2000/expressBookReviews | jq '.parent.full_name'\n${parent}`;
      fs.writeFileSync('githubrepo', content, 'utf8');
      console.log(content);
    } catch (error) {
      console.error('ERROR PARSING JSON:', error.message);
      console.error(data.slice(0, 300));
      process.exit(1);
    }
  });
}).on('error', (err) => {
  console.error('REQUEST ERROR:', err.message);
  process.exit(1);
});
