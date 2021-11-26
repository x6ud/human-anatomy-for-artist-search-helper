import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('./Search/Search.vue')
        },
        {
            path: '/editor',
            component: () => import('./Editor/Editor.vue')
        },
        {
            path: '/ds-manager',
            component: () => import('./DatasetManager/DatasetManager.vue')
        },
    ]
});

export default router;
