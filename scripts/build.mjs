import {mkdir, copyFile} from 'node:fs/promises';
await mkdir('public', {recursive: true});
await copyFile('notlinear-v2-standalone.html', 'public/index.html');
