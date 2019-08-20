import { exec } from 'child_process';

function execPromise(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (err, stdout: string) => {
            if (err) { reject(err); }
            resolve(stdout);
        });
    });
}

interface TestCase {
    cwd: string,
    bimo: TestCaseSetup,
    native: TestCaseSetup,
}

interface TestCaseSetup {
    prepare: string,
    read: string,
    write: string,
}

export async function run(test: TestCase) {
    await Promise.all([
        execPromise(test.bimo.prepare, test.cwd),
        execPromise(test.native.prepare, test.cwd),
    ]);

    // prepare
    await execPromise(test.native.write, test.cwd);

    // check reads
    expect(await execPromise(test.bimo.read, test.cwd)).toEqual(await execPromise(test.native.read, test.cwd));

    await execPromise(test.bimo.write, test.cwd);

    // check writes
    expect(await execPromise(test.bimo.read, test.cwd)).toEqual(await execPromise(test.native.read, test.cwd));
}