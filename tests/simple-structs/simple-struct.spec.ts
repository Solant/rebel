import { run } from '../utils';

describe('Simple struct', function () {
    it('should read and write properly', async () => {
        await run({
            cwd: __dirname,
            native: {
                prepare: 'g++ main.cpp',
                read: './a.out read',
                write: './a.out write',
            },
            bimo: {
                prepare: `npx ts-node ././../../cli.ts tests/simple-structs/plain.bimo --target=ts --output=tests/simple-structs/plain-compiled`,
                read: 'npx ts-node read.ts read',
                write: 'npx ts-node read.ts write',
            }
        })
    }, 30000);
});
