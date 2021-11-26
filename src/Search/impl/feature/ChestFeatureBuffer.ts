import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {
    getNormal,
    getQuatFromRightUp,
    isNormalizedLandmarksWithinBoundary,
    mid,
    normalizedLandmarkToViewSpace
} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 4;

export default class ChestFeatureBuffer implements FeatureBuffer {

    filename: string = 'chest';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const normalized = photo.normalized;
            const visibility = photo.visibility;

            if (!isNormalizedLandmarksWithinBoundary(normalized[12], normalized[11], normalized[24], normalized[23])) {
                continue;
            }
            const conf = Math.min(visibility[12], visibility[11], visibility[24], visibility[23]);
            if (conf < LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                continue;
            }

            const aspect = photo.width / photo.height;
            const leftShoulder = normalizedLandmarkToViewSpace(normalized[11], aspect);
            const rightShoulder = normalizedLandmarkToViewSpace(normalized[12], aspect);
            const leftHip = normalizedLandmarkToViewSpace(normalized[23], aspect);
            const rightHip = normalizedLandmarkToViewSpace(normalized[24], aspect);

            const chestUp = getNormal(mid(leftHip, rightHip), mid(leftShoulder, rightShoulder));
            const chestRight = getNormal(rightShoulder, leftShoulder);
            const rotation = getQuatFromRightUp(chestRight, chestUp);

            const offset = i * BUFFER_STEP;
            buffer[offset + 0] = rotation[0];
            buffer[offset + 1] = rotation[1];
            buffer[offset + 2] = rotation[2];
            buffer[offset + 3] = rotation[3];
        }
        return buffer;
    }

    getChestRotation(buffer: Float32Array, i: number): [number, number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
            buffer[offset + 3],
        ];
    }

}