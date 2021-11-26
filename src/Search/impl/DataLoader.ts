import {file} from '../../utils/file';
import {featureBuffers} from './feature/feature-buffers';
import {FeatureBuffers} from './matcher/PoseMatcher';

export default class DataLoader {

    chunks: { photos: [string, string, number, number][], buffers: FeatureBuffers }[] = [];

    async load(onProgress: (progress: number, total: number) => void) {
        const summary = await file.readJson('dataset/summary.json') as { index: number, size: number }[];

        const promises: Promise<any>[] = [];
        const chunksPromises: { photos: Promise<[string, string, number, number][]>, buffers: { [name: string]: Promise<ArrayBuffer> } }[] = [];
        for (let chunkInfo of summary) {
            const index = chunkInfo.index;
            let photos = file.readJson(`dataset/photos_${index}.json`) as Promise<[string, string, number, number][]>;
            promises.push(photos);
            let buffers: { [name: string]: Promise<ArrayBuffer> } = {};
            for (let name in featureBuffers) {
                const promise
                    = buffers[name]
                    = file.read(`dataset/f_${featureBuffers[name as keyof FeatureBuffers].filename}_${index}.dat`);
                promises.push(promise);
            }
            chunksPromises.push({photos, buffers});
        }

        const total = promises.length;
        let progress = 0;
        promises.forEach(promise => promise.then(() => {
            progress += 1;
            onProgress(progress, total);
        }));

        await Promise.all(promises);

        for (let chunkPromise of chunksPromises) {
            const photos = await chunkPromise.photos;
            const buffers: { [name: string]: Float32Array } = {};
            for (let name in chunkPromise.buffers) {
                buffers[name] = new Float32Array(await chunkPromise.buffers[name]);
            }
            this.chunks.push({
                photos,
                buffers: buffers as FeatureBuffers
            });
        }
    }

}