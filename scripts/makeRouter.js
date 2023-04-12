const fs = require('fs');
const { join } = require('path');

const name = process.argv[2];

if (!name) {
    console.error('Usage: npm run make:router <ROUTER NAME>');
    process.exit(1);
}

const makeRouter = name => {
    const path = join(__dirname, `../src/server/api/routers/${name}.ts`);
    if (fs.existsSync(path)) {
        console.error(`Router ${name} already exists`);
        process.exit(1);
    }
    fs.writeFileSync(
        path,
        `import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';
    
const ${name} = createTRPCRouter({});
    
export default ${name};
`
    );
    console.log(`Router ${name} successfully created. Don't forget to add it to the root router !`);
};

makeRouter(name);
