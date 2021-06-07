import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [html(), importMetaAssets()],
};
