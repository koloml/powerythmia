import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import Unfonts from "unplugin-fonts/vite"

export default defineConfig({
  plugins: [
    sveltekit(),
    Unfonts({
      custom: {
        families: [
          {
            name: 'LazyFox1',
            src: '/src/assets/fonts/lazy-fox-1.ttf',
            local: 'LazyFox1'
          },
          {
            name: 'LazyFox2',
            src: '/src/assets/fonts/lazy-fox-2.ttf',
            local: 'LazyFox2'
          }
        ],
        injectTo: 'head-prepend',
        display: 'block'
      }
    })
  ]
});
