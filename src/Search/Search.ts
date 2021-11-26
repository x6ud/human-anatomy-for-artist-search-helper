import {WarningOutlined, SearchOutlined} from '@vicons/antd';
import {NButton, NIcon, NSelect} from 'naive-ui';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import {BodyPart} from '../component/SkeletonModelCanvas/model/BodyPart';
import SkeletonModel from '../component/SkeletonModelCanvas/model/SkeletonModel';
import SkeletonModelCanvas from '../component/SkeletonModelCanvas/SkeletonModelCanvas.vue';
import {isMouseSupported, isWebGL2Supported} from '../utils/browser-support';
import DataLoader from './impl/DataLoader';
import ChestMatcher from './impl/matcher/ChestMatcher';
import CrotchMatcher from './impl/matcher/CrotchMatcher';
import ElbowMatcher from './impl/matcher/ElbowMatcher';
import FaceMatcher from './impl/matcher/FaceMatcher';
import HipMatcher from './impl/matcher/HipMatcher';
import KneeMatcher from './impl/matcher/KneeMatcher';
import PoseMatcher from './impl/matcher/PoseMatcher';
import ShoulderMatcher from './impl/matcher/ShoulderMatcher';
import {search, SearchResult} from './impl/search';

const matchers: {
    [name: string]: {
        matcher: PoseMatcher,
        highlights: BodyPart[],
    }
} = {
    'Face': {
        matcher: new FaceMatcher(),
        highlights: [BodyPart.head]
    },
    'Chest': {
        matcher: new ChestMatcher(),
        highlights: [BodyPart.trunk]
    },
    'Left Shoulder': {
        matcher: new ShoulderMatcher(true),
        highlights: [BodyPart.trunk, BodyPart.leftUpperArm]
    },
    'Right Shoulder': {
        matcher: new ShoulderMatcher(false),
        highlights: [BodyPart.trunk, BodyPart.rightUpperArm]
    },
    'Left Elbow': {
        matcher: new ElbowMatcher(true),
        highlights: [BodyPart.leftUpperArm, BodyPart.leftLowerArm]
    },
    'Right Elbow': {
        matcher: new ElbowMatcher(false),
        highlights: [BodyPart.rightUpperArm, BodyPart.rightLowerArm]
    },
    'Crotch': {
        matcher: new CrotchMatcher(),
        highlights: [BodyPart.trunk]
    },
    'Left Hip': {
        matcher: new HipMatcher(true),
        highlights: [BodyPart.trunk, BodyPart.leftThigh]
    },
    'Right Hip': {
        matcher: new HipMatcher(false),
        highlights: [BodyPart.trunk, BodyPart.rightThigh]
    },
    'Left Knee': {
        matcher: new KneeMatcher(true),
        highlights: [BodyPart.leftThigh, BodyPart.leftCalf]
    },
    'Right Knee': {
        matcher: new KneeMatcher(false),
        highlights: [BodyPart.rightThigh, BodyPart.rightCalf]
    },
};

export default defineComponent({
    components: {
        NButton,
        NSelect,
        NIcon,

        WarningOutlined,
        SearchOutlined,

        SkeletonModelCanvas,
    },
    setup() {
        const supportWebGL2 = isWebGL2Supported();
        const supportMouse = isMouseSupported();

        const dataLoader = new DataLoader();
        const model = new SkeletonModel();
        const loadingData = ref(false);

        const bodyPartOptions = Object.keys(matchers).map(option => ({value: option, label: option}));
        const bodyPart = ref<BodyPart>();

        const searchResultsContainerDom = ref<HTMLElement>();
        const searchResults = ref<SearchResult[]>([]);

        onMounted(async function () {
            try {
                loadingData.value = true;
                await dataLoader.load(function (progress, total) {
                });
            } finally {
                loadingData.value = false;
            }
        });

        async function onSearch() {
            searchResults.value = [];
            searchResultsContainerDom.value!.scrollTop = 0;
            await nextTick();
            searchResults.value = search(
                model,
                dataLoader.chunks,
                matchers[bodyPart.value!].matcher
            );
        }

        return {
            supportWebGL2,
            supportMouse,

            model,
            matchers,
            loadingData,

            bodyPartOptions,
            bodyPart,

            searchResultsContainerDom,
            searchResults,

            onSearch,
        };
    }
});