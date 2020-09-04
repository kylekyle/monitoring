import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      plugins: [terser()],
      file: `dist/monitoring-${version}.min.mjs`,
    }
  ],
};
