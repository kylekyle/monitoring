import { version } from './package.json';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy'


export default {
  input: 'src/index.js',
  output: [
    {
      plugins: [terser()],
      file: `dist/monitoring-latest.min.mjs`,
    }
  ],
  plugins: [
    copy({
      targets: [
        {
          src: 'src/index.d.ts',
          dest: 'dist',
          rename: 'monitoring-latest.d.ts'
        }
      ]
    })
  ]
}
