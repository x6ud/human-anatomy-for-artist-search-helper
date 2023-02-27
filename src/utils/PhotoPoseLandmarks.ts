import {detectPose} from './detect-pose';
import {detectPoseWorker} from './detect-pose-worker';
import {drawLandmarks} from './draw-landmarks';
import {getPhotoInfo} from './human-anatomy-for-artist-crawler';
import {proxyGetImage} from './proxy';

export default class PhotoPoseLandmarks {

    id: string = '';
    url: string = '';
    width: number = 0;
    height: number = 0;
    normalized: [number, number, number][] = [];
    world: [number, number, number][] = [];
    visibility: number[] = [];
    selected: boolean = false;
    landmarksImage: string = '';

    async load(id: string) {
        const photo = await getPhotoInfo(id);
        this.id = id;
        console.info(`Loading #${id}`);
        const url = this.url = photo.url;
        const image = await proxyGetImage(url);
        this.width = image.width;
        this.height = image.height;
        const pose = await detectPose(image);
        this.normalized = pose.normalizedLandmarks.map(landmark => landmark.point);
        this.world = pose.worldLandmarks.map(landmark => landmark.point);
        this.visibility = pose.normalizedLandmarks.map(landmark => landmark.visibility);
        this.selected = !!this.normalized.length;
        if (this.normalized.length) {
            this.landmarksImage = drawLandmarks(image, this.normalized, this.visibility);
        }
    }

    async loadByWorker(id: string) {
        const photo = await getPhotoInfo(id);
        this.id = id;
        console.info(`Loading #${id}`);
        const url = this.url = photo.url;
        const image = await proxyGetImage(url);
        this.width = image.width;
        this.height = image.height;
        const pose = await detectPoseWorker(image);
        this.normalized = pose.normalizedLandmarks.map(landmark => landmark.point);
        this.world = pose.worldLandmarks.map(landmark => landmark.point);
        this.visibility = pose.normalizedLandmarks.map(landmark => landmark.visibility);
        this.selected = !!this.normalized.length;
        if (this.normalized.length) {
            this.landmarksImage = drawLandmarks(image, this.normalized, this.visibility);
        }
    }

}
