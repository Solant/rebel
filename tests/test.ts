import { dirname } from 'path';
import { file } from 'find';
import { execSync } from 'child_process';

const filesPromise = (pattern: string | RegExp, root: string): Promise<string[]> => {
    return new Promise((res) => {
        file(pattern, root, (files) => res(files));
    });
};

describe('Read write tests with different formats', () => {
    it('should read and write successfully', async () => {
        const files = await filesPromise('test.sh', __dirname);
        files.forEach((file) => {
            const a = execSync(`sh ${file}`, {
                encoding: 'utf-8',
                cwd: dirname(file),
            });
        });
    });
});
