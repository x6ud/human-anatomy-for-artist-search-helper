import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {
    getNormal,
    getQuatFromRightForward,
    isNormalizedLandmarksWithinBoundary,
    mid,
    normalizedLandmarkToViewSpace
} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 4;

export default class FaceFeatureBuffer implements FeatureBuffer {

    filename: string = 'face';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const normalized = photo.normalized;
            const visibility = photo.visibility;

            if (!isNormalizedLandmarksWithinBoundary(normalized[8], normalized[7], normalized[10], normalized[9])) {
                continue;
            }
            const conf = Math.min(visibility[8], visibility[7], visibility[10], visibility[9]);
            if (conf < LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                continue;
            }

            const aspect = photo.width / photo.height;
            const leftEar = normalizedLandmarkToViewSpace(normalized[7], aspect);
            const rightEar = normalizedLandmarkToViewSpace(normalized[8], aspect);
            const nose = normalizedLandmarkToViewSpace(normalized[0], aspect);

            const faceRight = getNormal(rightEar, leftEar);
            const faceForward = getNormal(mid(leftEar, rightEar), nose);
            const rotation = getQuatFromRightForward(faceRight, faceForward);

            const offset = i * BUFFER_STEP;
            buffer[offset + 0] = rotation[0];
            buffer[offset + 1] = rotation[1];
            buffer[offset + 2] = rotation[2];
            buffer[offset + 3] = rotation[3];
        }
        return buffer;
    }

    getFaceRotation(buffer: Float32Array, i: number): [number, number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
            buffer[offset + 3],
        ];
    }

}