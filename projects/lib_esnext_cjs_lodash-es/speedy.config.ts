import { defineConfig } from '@speedy-js/speedy-core';
import path from 'path';

export = defineConfig({
  input: {
    main: path.resolve(__dirname, '../../fixtures/lodash-es/lodash.js'),
  },
  sourceMap: false,
  minify: false,
  output: {
    path: 'dist',
    filename: 'speedy',
    format: 'cjs',
  },
});
