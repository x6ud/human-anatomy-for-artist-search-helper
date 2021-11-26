import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';
import string from 'vite-plugin-string';
import fileServer from './vite-plugins/file-server';
import requestProxyServer from './vite-plugins/request-proxy-server';
import requestArraybufferProxyServer from './vite-plugins/request-arraybuffer-proxy-server';

export default defineConfig({
    base: './',
    plugins: [
        vue(),
        string({
            include: [
                '**/*.vert',
                '**/*.frag',
                '**/*.obj',
            ],
            compress: false,
        }),
        fileServer('/file', '/public'),
        requestProxyServer('/proxy'),
        requestArraybufferProxyServer('/proxy-arraybuffer'),
    ],
    build: {
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
});
