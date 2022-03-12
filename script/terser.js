import { minify } from 'terser';
import fs from 'fs';
import { getAllFilesAndCode, getAllFiles } from 'utari-common';

const config = {
    compress: {
        dead_code: true,
        drop_console: false,
        drop_debugger: true,
        keep_classnames: false,
        keep_fargs: false,
        keep_fnames: false,
        keep_infinity: false,
    },
    mangle: {
        eval: false,
        keep_classnames: false,
        keep_fnames: false,
        toplevel: false,
        safari10: false,
    },
    module: true,
    output: {
        comments: false,
    },
};

(async (dir) => {
    const files = getAllFiles(dir, (extension) => extension === 'js');
    if (files.length === 0) {
        console.log('No JavaScript file in build folder');
        process.exit(0);
    }
    await Promise.all(
        (
            await getAllFilesAndCode(files).reduce(
                async (prev, curr) => (await prev).concat(await curr),
                Promise.resolve([])
            )
        ).map(async ({ code, file }) => {
            const minified = await minify(code, config);
            fs.writeFile(file, minified.code, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        })
    );
    console.log('Backend Terser done its job!');
})('build');
