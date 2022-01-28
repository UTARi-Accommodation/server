import { minify } from 'terser';
import fs from 'fs';

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

const getAllJavaScriptFiles = (dir) =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getAllJavaScriptFiles(path);
        }
        const extension = path.split('.').pop();
        return extension ? (extension === 'js' ? [path] : []) : [];
    });

const readCode = (files) =>
    new Promise((resolve, reject) => {
        let fetchData = '';
        fs.createReadStream(files)
            .on('data', (data) => {
                fetchData = data.toString();
            })
            .on('end', () => resolve(fetchData))
            .on('error', reject);
    });

const getAllJavaScriptCodes = (files) =>
    files.map(async (file) => ({
        file,
        code: await readCode(file),
    }));

const main = async (dir) => {
    const files = getAllJavaScriptFiles(dir);
    if (files.length === 0) {
        console.log('No JavaScript file in build folder');
        process.exit(0);
    }
    (
        await getAllJavaScriptCodes(files).reduce(
            async (prev, curr) => (await prev).concat(await curr),
            Promise.resolve([])
        )
    ).forEach(async ({ code, file }) => {
        const minified = await minify(code, config);
        fs.writeFile(file, minified.code, (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
    console.log('Backend Terser done its job!');
};

main('build');
