import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {avg, getNormalInLocalSpace} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 6;
export default class ThighFeatureBuffer implements FeatureBuffer {

    filename: string = 'thigh';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const world = photo.world;
            const visibility = photo.visibility;

            const offset = i * BUFFER_STEP;

            const confL = Math.min(
                avg(visibility[11], visibility[23], visibility[24]),
                avg(visibility[23], visibility[25])
            );
            if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const leftThighLocalDir = getNormalInLocalSpace(
                    world[24], world[23],
                    world[23], world[11],
                    world[23], world[25],
                );
                buffer[offset + 0] = leftThighLocalDir[0];
                buffer[offset + 1] = leftThighLocalDir[1];
                buffer[offset + 2] = leftThighLocalDir[2];
            }

            const confR = Math.min(
                avg(visibility[12], visibility[24], visibility[23]),
                avg(visibility[24], visibility[26])
            );
            if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const rightThighLocalDir = getNormalInLocalSpace(
                    world[23], world[24],
                    world[24], world[12],
                    world[24], world[26],
                );
                buffer[offset + 3] = rightThighLocalDir[0];
                buffer[offset + 4] = rightThighLocalDir[1];
                buffer[offset + 5] = rightThighLocalDir[2];
            }
        }
        return buffer;
    }

    getLeftThighDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
        ];
    }

    getRightThighDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 3],
            buffer[offset + 4],
            buffer[offset + 5],
        ];
    }

}