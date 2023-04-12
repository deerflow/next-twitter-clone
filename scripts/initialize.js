const { execSync } = require('child_process');

const projectName = process.argv[2];

if (!projectName) {
    console.error('Usage : npm run initialize <PROJECT NAME>');
    process.exit(1);
}

execSync(`cp .env.example .env`);
execSync(`npm i`);
execSync(`gh repo create ${projectName} --private`);
execSync(`git remote add origin https://github.com/deerflow/${projectName}`);
execSync(`git add .`);
execSync(`git commit -m "init"`);
execSync(`git push -u origin main`);
execSync(`cd .. && mv t3-boilerplate ${projectName}`);
