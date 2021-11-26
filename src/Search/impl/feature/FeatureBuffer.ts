import PhotoPoseLandmarks from '../../../utils/PhotoPoseLandmarks';

export default interface FeatureBuffer {

    filename: string;
    create(chunk: PhotoPoseLandmarks[]): Float32Array;

};