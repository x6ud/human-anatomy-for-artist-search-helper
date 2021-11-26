import SkeletonModel from '../../../component/SkeletonModelCanvas/model/SkeletonModel';
import {angleBetweenVec3} from '../../../utils/math/math';
import {featureBuffers} from '../feature/feature-buffers';
import {
    getNormal,
    getNormalInLocalSpace,
    getQuatDistance,
    getQuatFromRightUp,
    getQuatMirrorX,
    isQuatZero,
    isVecZero,
    mid
} from '../math';
import PoseMatcher, {FeatureBuffers, MatchResult} from './PoseMatcher';

const MAX_ERROR = Math.PI / 180 * 45;

export default class HipMatcher implements PoseMatcher {

    private isLeft: boolean;

    private thighLocalDir: [number, number, number] = [0, 0, 0];
    private thighLocalDirMirror: [number, number, number] = [0, 0, 0];
    private crotchRotation: [number, number, number, number] = [0, 0, 0, 1];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        if (this.isLeft) {
            this.thighLocalDir = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
            );
            this.thighLocalDirMirror = getNormalInLocalSpace(
                model.rightThigh.originWorldPosition,
                model.leftThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftThigh.originWorldPosition,
                model.leftThigh.controlPointWorldPosition,
                true,
            );
        } else {
            this.thighLocalDir = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
            );
            this.thighLocalDirMirror = getNormalInLocalSpace(
                model.leftThigh.originWorldPosition,
                model.rightThigh.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightThigh.originWorldPosition,
                model.rightThigh.controlPointWorldPosition,
                true,
            );
        }

        const crotchUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        const crotchRight = getNormal(model.rightThigh.originViewPosition, model.leftThigh.originViewPosition);
        this.crotchRotation = getQuatFromRightUp(crotchRight, crotchUp);
    }

    match(result: MatchResult, buffers: FeatureBuffers, index: number): void {
        const crotchRotation = featureBuffers.crotch.getCrotchRotation(buffers.crotch, index);
        if (isQuatZero(crotchRotation)) {
            return;
        }

        const leftThighDir = featureBuffers.thigh.getLeftThighDir(buffers.thigh, index);
        const rightThighDir = featureBuffers.thigh.getRightThighDir(buffers.thigh, index);

        const thighErrL = angleBetweenVec3(leftThighDir, this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
        const crotchErrL = getQuatDistance(this.crotchRotation, this.isLeft ? crotchRotation : getQuatMirrorX(crotchRotation));
        const thighErrR = angleBetweenVec3(rightThighDir, !this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
        const crotchErrR = getQuatDistance(this.crotchRotation, !this.isLeft ? crotchRotation : getQuatMirrorX(crotchRotation));

        let scoreL = (Math.PI - thighErrL) * (Math.PI - crotchErrL);
        let scoreR = (Math.PI - thighErrR) * (Math.PI - crotchErrR);
        if (isVecZero(leftThighDir) || thighErrL > MAX_ERROR || crotchErrL > MAX_ERROR) {
            scoreL = -Infinity;
        }
        if (isVecZero(rightThighDir) || thighErrR > MAX_ERROR || crotchErrR > MAX_ERROR) {
            scoreR = -Infinity;
        }

        if (isFinite(scoreL) && scoreL > scoreR) {
            result.accepted = true;
            result.score = scoreL;
            result.flipped = !this.isLeft;
        } else if (isFinite(scoreR)) {
            result.accepted = true;
            result.score = scoreR;
            result.flipped = this.isLeft;
        }
    }

}