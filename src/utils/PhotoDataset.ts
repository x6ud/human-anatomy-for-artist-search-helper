import {featureBuffers} from '../Search/impl/feature/feature-buffers';
import {NUM_OF_LANDMARKS} from './detect-pose';
import {file} from './file';
import PhotoPoseLandmarks from './PhotoPoseLandmarks';

const CHUNK_SIZE = 5000;

class Chunk {
    loaded: boolean = false;
    size: number = 0;
    idSet: Set<string> = new Set();
    data: PhotoPoseLandmarks[] = [];
}

class ChunkInfo {
    index: number;
    size: number;

    constructor(index: number, length: number) {
        this.index = index;
        this.size = length;
    }
}

function getChunkIndex(id: string) {
    const num = Number(id);
    return Math.floor(num / CHUNK_SIZE) + 1;
}

export default class PhotoDataset {

    private chunks: { [i: number]: Chunk } = {};

    async load() {
        const summary = await file.readJson('dataset/summary.json') as ChunkInfo[];
        summary.forEach(chunkInfo => {
            const chunk = this.chunks[chunkInfo.index] = new Chunk();
            chunk.size = chunkInfo.size;
        });
    }

    async writeToFile() {
        const chunkInfos: ChunkInfo[] = [];
        for (let index in this.chunks) {
            chunkInfos.push(new ChunkInfo(Number(index), this.chunks[index].data.length));
        }
        await file.writeJson('dataset/summary.json', chunkInfos);
        for (let index in this.chunks) {
            const chunk = this.chunks[index];
            if (chunk.loaded) {
                await file.writeJson(`dataset/photos_${index}.json`, chunk.data.map(
                    record => [record.id, record.url, record.width, record.height]
                ));
                const landmarksBuffer = new Float32Array(chunk.size * NUM_OF_LANDMARKS * 7);
                for (let i = 0, len = chunk.size; i < len; ++i) {
                    const record = chunk.data[i];
                    const normalized = record.normalized;
                    const world = record.world;
                    const visibility = record.visibility;
                    for (let j = 0; j < NUM_OF_LANDMARKS; ++j) {
                        const offset = i * NUM_OF_LANDMARKS * 7 + j * 7;
                        landmarksBuffer[offset + 0] = normalized[j][0];
                        landmarksBuffer[offset + 1] = normalized[j][1];
                        landmarksBuffer[offset + 2] = normalized[j][2];
                        landmarksBuffer[offset + 3] = world[j][0];
                        landmarksBuffer[offset + 4] = world[j][1];
                        landmarksBuffer[offset + 5] = world[j][2];
                        landmarksBuffer[offset + 6] = visibility[j];
                    }
                }
                await file.write(`dataset/landmarks_${index}.dat`, new Blob([landmarksBuffer]));

                for (let featureBuffer of Object.values(featureBuffers)) {
                    const buffer = featureBuffer.create(chunk.data);
                    await file.write(`dataset/f_${featureBuffer.filename}_${index}.dat`, new Blob([buffer]));
                }
            }
        }
    }

    private async getChunk(index: number) {
        const chunk = this.chunks[index];
        if (!chunk) {
            const chunk = this.chunks[index] = new Chunk();
            chunk.loaded = true;
            return chunk;
        }
        if (!chunk.loaded) {
            const photos = await file.readJson(`dataset/photos_${index}.json`) as [string, string, number, number][];
            const landmarksBuffer = new Float32Array(await file.read(`dataset/landmarks_${index}.dat`));
            const data: PhotoPoseLandmarks[] = [];
            for (let i = 0, len = photos.length; i < len; ++i) {
                const record = new PhotoPoseLandmarks();
                data.push(record);
                const photo = photos[i];
                record.id = photo[0];
                record.url = photo[1];
                record.width = photo[2];
                record.height = photo[3];
                const normalized = record.normalized;
                const world = record.world;
                const visibility = record.visibility;
                for (let j = 0; j < NUM_OF_LANDMARKS; ++j) {
                    const offset = i * NUM_OF_LANDMARKS * 7 + j * 7;
                    normalized[j] = [
                        landmarksBuffer[offset + 0],
                        landmarksBuffer[offset + 1],
                        landmarksBuffer[offset + 2],
                    ];
                    world[j] = [
                        landmarksBuffer[offset + 3],
                        landmarksBuffer[offset + 4],
                        landmarksBuffer[offset + 5],
                    ];
                    visibility[j] = landmarksBuffer[offset + 6];
                }
            }
            chunk.data = data;
            data.forEach(record => chunk.idSet.add(record.id));
            chunk.size = data.length;
            chunk.loaded = true;
        }
        return chunk;
    }

    async loadAllChunks() {
        const indices = Object.keys(this.chunks);
        for (let index of indices) {
            await this.getChunk(Number(index));
        }
    }

    async get(id: string): Promise<PhotoPoseLandmarks | null> {
        const chunk = await this.getChunk(getChunkIndex(id));
        if (!chunk.idSet.has(id)) {
            return null;
        }
        return chunk.data.find(record => record.id === id) || null;
    }

    async has(id: string) {
        const chunk = await this.getChunk(getChunkIndex(id));
        return chunk.idSet.has(id);
    }

    async add(photo: PhotoPoseLandmarks) {
        const chunk = await this.getChunk(getChunkIndex(photo.id));
        if (chunk.idSet.has(photo.id)) {
            return;
        }
        chunk.data.push(photo);
        chunk.idSet.add(photo.id);
        chunk.size += 1;
    }

    get size(): number {
        let size = 0;
        for (let index in this.chunks) {
            const chunk = this.chunks[index];
            size += chunk.size;
        }
        return size;
    }

    async getPage(pageNum: number, pageSize: number = 60): Promise<PhotoPoseLandmarks[]> {
        const offset = (pageNum - 1) * pageSize;
        const chunkIndices = Object
            .keys(this.chunks)
            .map(index => Number(index))
            .sort((a, b) => a - b);
        let i = 0;
        for (let chunkIndex of chunkIndices) {
            const chunk = this.chunks[chunkIndex];
            if (i + chunk.size >= offset) {
                const loadedChunk = await this.getChunk(chunkIndex);
                return loadedChunk.data.slice(offset - i, offset - i + pageSize);
            } else {
                i += chunk.size;
            }
        }
        return [];
    }

    getNumOfPages(pageSize: number = 60) {
        return Math.ceil(this.size / pageSize);
    }

}