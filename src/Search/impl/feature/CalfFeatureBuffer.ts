import {LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD} from '../../../config';
import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';
import {avg, getNormal, normalizedLandmarkToViewSpace} from '../math';
import FeatureBuffer from './FeatureBuffer';

const BUFFER_STEP = 6;

export default class CalfFeatureBuffer implements FeatureBuffer {

    filename: string = 'calf';

    create(chunk: PhotoPoseLandmarks[]): Float32Array {
        const buffer = new Float32Array(BUFFER_STEP * chunk.length);
        for (let i = 0, len = chunk.length; i < len; ++i) {
            const photo = chunk[i];
            const normalized = photo.normalized;
            const visibility = photo.visibility;
            const aspect = photo.width / photo.height;

            const offset = i * BUFFER_STEP;

            const confL = Math.min(
                avg(visibility[23], visibility[25]),
                avg(visibility[25], visibility[27])
            );
            if (confL >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const kneeView = normalizedLandmarkToViewSpace(normalized[25], aspect);
                const ankleView = normalizedLandmarkToViewSpace(normalized[27], aspect);
                const calfViewNormal = getNormal(kneeView, ankleView);
                buffer[offset + 0] = calfViewNormal[0];
                buffer[offset + 1] = calfViewNormal[1];
                buffer[offset + 2] = calfViewNormal[2];
            }

            const confR = Math.min(
                avg(visibility[24], visibility[26]),
                avg(visibility[26], visibility[28])
            );
            if (confR >= LANDMARK_VISIBILITY_ACCEPTABLE_THRESHOLD) {
                const kneeView = normalizedLandmarkToViewSpace(normalized[26], aspect);
                const ankleView = normalizedLandmarkToViewSpace(normalized[28], aspect);
                const calfViewNormal = getNormal(kneeView, ankleView);
                buffer[offset + 3] = calfViewNormal[0];
                buffer[offset + 4] = calfViewNormal[1];
                buffer[offset + 5] = calfViewNormal[2];
            }
        }
        return buffer;
    }

    getLeftCalfDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 0],
            buffer[offset + 1],
            buffer[offset + 2],
        ];
    }

    getRightCalfDir(buffer: Float32Array, i: number): [number, number, number] {
        const offset = i * BUFFER_STEP;
        return [
            buffer[offset + 3],
            buffer[offset + 4],
            buffer[offset + 5],
        ];
    }

}