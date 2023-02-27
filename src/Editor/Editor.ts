import {NButton, NInput, NProgress, NSpin} from 'naive-ui';
import {computed, defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import {getPhotoListPage} from '../utils/human-anatomy-for-artist-crawler';
import PhotoDataset from '../utils/PhotoDataset';
import PhotoPoseLandmarks from '../utils/PhotoPoseLandmarks';

export default defineComponent({
    components: {
        NButton,
        NInput,
        NSpin,
        NProgress,
    },
    setup() {
        const dataset = new PhotoDataset();
        const datasetLoading = ref(false);
        const datasetLength = ref(0);

        const totalPages = ref(0);
        const pageStart = ref('1');
        const pageEnd = ref('1');

        let photosPerPage = 60;
        const processing = ref(false);
        const stop = ref(false);
        const total = ref(0);
        const progress = ref(0);
        const percent = computed(function () {
            return Math.round(progress.value / total.value * 100);
        });
        const progressText = computed(function () {
            return `${progress.value} / ${total.value}`;
        });
        const remainingSecs = ref(0);
        const remaining = computed(function () {
            function padZero(val: number) {
                return val < 10 ? '0' + val : val + '';
            }

            let dt = Math.round(remainingSecs.value);
            const secs = dt % 60;
            dt = Math.floor(dt / 60);
            const mins = dt % 60;
            dt = Math.floor(dt / 60);
            const hours = dt;
            return `${padZero(hours)}:${padZero(mins)}:${padZero(secs)}`;
        });

        const detectResult = ref<PhotoPoseLandmarks[]>([]);

        onMounted(async function () {
            try {
                datasetLoading.value = true;
                await dataset.load();
                await dataset.loadAllChunks();
                datasetLength.value = dataset.size;

                const page = await getPhotoListPage(1);
                totalPages.value = page.numOfPages;
                pageEnd.value = page.numOfPages + '';
                photosPerPage = page.photos.length || photosPerPage;
            } finally {
                datasetLoading.value = false;
            }
        });

        let tid: any = 0;

        function startCountdown() {
            if (!tid) {
                tid = setInterval(function () {
                    remainingSecs.value = Math.max(0, remainingSecs.value - 1);
                }, 1000);
            }
        }

        function stopCountdown() {
            if (tid) {
                clearInterval(tid);
                tid = 0;
            }
        }

        onBeforeUnmount(function () {
            stopCountdown();
        });

        async function process() {
            try {
                processing.value = true;
                total.value = 0;
                progress.value = 0;
                remainingSecs.value = 0;
                stop.value = false;
                const start = Number(pageStart.value);
                const end = Number(pageEnd.value);
                total.value = photosPerPage * (end - start + 1);
                remainingSecs.value = 15 * total.value;
                startCountdown();
                let avgTime = 15000;
                for (let pageNum = end; pageNum >= start; --pageNum) {
                    if (stop.value) {
                        break;
                    }
                    const page = await getPhotoListPage(pageNum);
                    if (page.photos.length < photosPerPage) {
                        total.value -= (photosPerPage - page.photos.length);
                    }
                    for (let photo of page.photos) {
                        if (await dataset.has(photo.id)) {
                            // skip
                        } else {
                            console.log(`Processing #${photo.id} in page ${pageNum}`);
                            const startTime = Date.now();
                            const result = new PhotoPoseLandmarks();
                            await result.loadByWorker(photo.id);
                            detectResult.value.push(result);
                            if (result.normalized?.length) {
                                await dataset.add(result);
                                await dataset.writeToFile();
                                datasetLength.value += 1;
                                let dt = Date.now() - startTime;
                                if (progress.value > 1) {
                                    avgTime = (avgTime * progress.value + dt) / (progress.value + 1);
                                }
                            }
                        }
                        progress.value += 1;
                        if (stop.value || total.value === progress.value) {
                            break;
                        }
                        remainingSecs.value = Math.round(avgTime / 1000 * (total.value - progress.value));
                    }
                }
            } catch (e) {
                console.error(e);
                alert('An error occurred: ' + e);
            }
            stopCountdown();
            processing.value = false;
        }

        return {
            dataset,
            datasetLoading,
            datasetLength,

            totalPages,
            pageStart,
            pageEnd,

            processing,
            stop,
            total,
            progress,
            percent,
            progressText,
            remainingSecs,
            remaining,

            detectResult,

            process,
        };
    }
});
