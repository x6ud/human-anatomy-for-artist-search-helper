import SkeletonModel from '../../../component/SkeletonModelCanvas/model/SkeletonModel';
import {featureBuffers} from '../feature/feature-buffers';
import {getNormal, getQuatDistance, getQuatFromRightForward, getQuatMirrorX, isQuatZero} from '../math';
import PoseMatcher, {FeatureBuffers, MatchResult} from './PoseMatcher';

const MAX_ERROR = Math.PI / 180 * 45;

export default class FaceMatcher implements PoseMatcher {

    private rotation: [number, number, number, number] = [0, 0, 0, 0];

    prepare(model: SkeletonModel): void {
        const leftEar = model.head.landmarksViewPosition[0];
        const rightEar = model.head.landmarksViewPosition[1];
        const right = getNormal(rightEar, leftEar);
        const forward = getNormal(model.head.originViewPosition, model.head.controlPointViewPosition);
        this.rotation = getQuatFromRightForward(right, forward);
    }

    match(result: MatchResult, buffers: FeatureBuffers, index: number): void {
        const rotation = featureBuffers.face.getFaceRotation(buffers.face, index);
        if (isQuatZero(rotation)) {
            return;
        }
        const errorP = getQuatDistance(this.rotation, rotation);
        const errorF = getQuatDistance(this.rotation, getQuatMirrorX(rotation));
        if (errorF > MAX_ERROR && errorP > MAX_ERROR) {
            return;
        }
        const scoreP = Math.PI - errorP;
        const scoreF = Math.PI - errorF;
        result.accepted = true;
        if (scoreP > scoreF) {
            result.score = scoreP;
        } else {
            result.score = scoreF;
            result.flipped = true;
        }
    }

}