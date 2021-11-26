import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {avg, getNormalInLocalSpace} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 6;

export default class UpperArmFeatureBuffer implements FeatureBuffer {

    filename: string = 'upper_arm';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const world = photo.world;
            const visibility = photo.visibility;

            const offset = i * BUFFER_STEP;

            const confL = Math.min(
                avg(visibility[12], visibility[11], visibility[23]),
                avg(visibility[11], visibility[13])
            );
            if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const leftUpperArmLocalDir = getNormalInLocalSpace(
                    world[12], world[11],
                    world[23], world[11],
                    world[11], world[13],
                );
                buffer[offset + 0] = leftUpperArmLocalDir[0];
                buffer[offset + 1] = leftUpperArmLocalDir[1];
                buffer[offset + 2] = leftUpperArmLocalDir[2];
            }

            const confR = Math.min(
                avg(visibility[11], visibility[12], visibility[24]),
                avg(visibility[12], visibility[14])
            );
            if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const rightUpperArmLocalDir = getNormalInLocalSpace(
                    world[11], world[12],
                    world[24], world[12],
                    world[12], world[14],
                );
                buffer[offset + 3] = rightUpperArmLocalDir[0];
                buffer[offset + 4] = rightUpperArmLocalDir[1];
                buffer[offset + 5] = rightUpperArmLocalDir[2];
            }
        }
        return buffer;
    }

    getLeftUpperArmDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
        ];
    }

    getRightUpperArmDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 3],
            buffer[offset + 4],
            buffer[offset + 5],
        ];
    }

}