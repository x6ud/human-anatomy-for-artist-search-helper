import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {avg, getNormal, normalizedLandmarkToViewSpace} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 6;

export default class LowerArmFeatureBuffer implements FeatureBuffer {

    filename: string = 'lower_arm';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const normalized = photo.normalized;
            const visibility = photo.visibility;
            const aspect = photo.width / photo.height;

            const offset = i * BUFFER_STEP;

            const confL = Math.min(
                avg(visibility[11], visibility[13]),
                avg(visibility[13], visibility[15])
            );
            if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const elbowView = normalizedLandmarkToViewSpace(normalized[13], aspect);
                const wristView = normalizedLandmarkToViewSpace(normalized[15], aspect);
                const leftLowerArmDir = getNormal(elbowView, wristView);
                buffer[offset + 0] = leftLowerArmDir[0];
                buffer[offset + 1] = leftLowerArmDir[1];
                buffer[offset + 2] = leftLowerArmDir[2];
            }

            const confR = Math.min(
                avg(visibility[12], visibility[14]),
                avg(visibility[14], visibility[16])
            );
            if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const elbowView = normalizedLandmarkToViewSpace(normalized[14], aspect);
                const wristView = normalizedLandmarkToViewSpace(normalized[16], aspect);
                const rightLowerArmDir = getNormal(elbowView, wristView);
                buffer[offset + 3] = rightLowerArmDir[0];
                buffer[offset + 4] = rightLowerArmDir[1];
                buffer[offset + 5] = rightLowerArmDir[2];
            }
        }
        return buffer;
    }

    getLeftLowerArmDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
        ];
    }

    getRightLowerArmDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 3],
            buffer[offset + 4],
            buffer[offset + 5],
        ];
    }

}