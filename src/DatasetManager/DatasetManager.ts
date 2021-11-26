import {NButton, NInput, NSpin} from 'naive-ui';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import PhotoDataset from '../utils/PhotoDataset';
import PhotoPoseLandmarks from '../utils/PhotoPoseLandmarks';

export default defineComponent({
    components: {
        NButton,
        NInput,
        NSpin,
    },
    setup() {
        const dataset = new PhotoDataset();
        const datasetLoading = ref(false);
        const datasetLength = ref(0);
        const numOfPages = ref(0);
        const pageNum = ref('1');
        const pageData = ref<PhotoPoseLandmarks[]>([]);
        const pageLoading = ref(false);

        onMounted(async function () {
            try {
                datasetLoading.value = true;
                await dataset.load();
                datasetLength.value = dataset.size;
                numOfPages.value = dataset.getNumOfPages();
            } finally {
                datasetLoading.value = false;
            }
            // await dataset.loadAllChunks();
            await loadPage();
        });

        async function loadPage() {
            try {
                pageLoading.value = true;
                pageData.value = [];
                await nextTick();
                pageData.value = await dataset.getPage(Number(pageNum.value));
            } finally {
                pageLoading.value = false;
            }
        }

        async function prevPage() {
            const num = Math.max(1, Number(pageNum.value) - 1);
            if (Number(pageNum.value) === num) {
                return;
            }
            pageNum.value = num + '';
            await loadPage();
        }

        async function nextPage() {
            const num = Math.min(numOfPages.value, Number(pageNum.value) + 1);
            if (Number(pageNum.value) === num) {
                return;
            }
            pageNum.value = num + '';
            await loadPage();
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
            numOfPages,
            pageNum,
            pageData,
            pageLoading,

            loadPage,
            prevPage,
            nextPage,

            saveDatasetToFile,
        };
    }
});