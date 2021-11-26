import {NButton, NCheckbox, NInput, NProgress, NSpin} from 'naive-ui';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import {BasePhotoInfo, getPhotoListPage} from '../utils/human-anatomy-for-artist-crawler';
import PhotoDataset from '../utils/PhotoDataset';
import PhotoPoseLandmarks from '../utils/PhotoPoseLandmarks';

export default defineComponent({
    components: {
        NButton,
        NInput,
        NSpin,
        NCheckbox,
        NProgress,
    },
    setup() {
        const dataset = new PhotoDataset();
        const datasetLoading = ref(false);
        const datasetLength = ref(0);

        const photoListLoading = ref(false);
        const photoListPage = ref('1');
        const photoListNumOfPages = ref(0);
        const photoList = ref<BasePhotoInfo[]>([]);

        const processing = ref(false);
        const processingPercentage = ref(0);
        const detectResult = ref<PhotoPoseLandmarks[]>([]);

        onMounted(async function () {
            try {
                datasetLoading.value = true;
                await dataset.load();
                datasetLength.value = dataset.size;
            } finally {
                datasetLoading.value = false;
            }
        });

        async function loadPhotoListPage() {
            try {
                photoListLoading.value = true;
                photoList.value = [];
                await nextTick();

                const page = await getPhotoListPage(photoListPage.value);
                photoListNumOfPages.value = page.numOfPages;
                photoList.value = page.photos;
            } finally {
                photoListLoading.value = false;
            }
        }

        async function photoListPrevPage() {
            const num = Math.max(1, Number(photoListPage.value) - 1);
            if (Number(photoListPage.value) === num) {
                return;
            }
            photoListPage.value = num + '';
            await loadPhotoListPage();
        }

        async function photoListNextPage() {
            const num = Math.min(photoListNumOfPages.value, Number(photoListPage.value) + 1);
            if (Number(photoListPage.value) === num) {
                return;
            }
            photoListPage.value = num + '';
            await loadPhotoListPage();
        }

        async function processSelected() {
            try {
                processing.value = true;
                processingPercentage.value = 0;
                detectResult.value = [];
                await nextTick();

                const start = Date.now();

                const selected = photoList.value.filter(item => item.selected);
                for (let i = 0, len = selected.length; i < len; ++i) {
                    try {
                        const id = selected[i].id;
                        const result = new PhotoPoseLandmarks();
                        await result.load(id);
                        detectResult.value.push(result);
                        processingPercentage.value = Math.floor((i + 1) / len * 100);
                        await nextTick();
                    } catch (e) {
                        console.error(e);
                    }
                }

                const time = Date.now() - start;
                console.info(`Total time: ${time / 1000}s, Avg: ${time / 1000 / selected.length}s`);
            } finally {
                processing.value = false;
            }
        }

        async function addSelectedResultToDataset() {
            for (let result of detectResult.value) {
                if (result.selected) {
                    await dataset.add(result);
                }
            }
            datasetLength.value = dataset.size;
        }

        async function saveDatasetToFile() {
            try {
                datasetLoading.value = true;
                await dataset.writeToFile();
            } finally {
                datasetLoading.value = false;
            }
        }

        return {
            datasetLoading,
            datasetLength,

            photoListLoading,
            photoListNumOfPages,
            photoListPage,
            photoList,

            processing,
            processingPercentage,
            detectResult,

            loadPhotoListPage,
            photoListPrevPage,
            photoListNextPage,
            processSelected,

            addSelectedResultToDataset,
            saveDatasetToFile,
        };
    }
});