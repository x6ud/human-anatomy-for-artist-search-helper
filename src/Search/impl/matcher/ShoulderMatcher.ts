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

export default class ShoulderMatcher implements PoseMatcher {

    private isLeft: boolean;

    private shoulderLocalDir: [number, number, number] = [0, 0, 0];
    private shoulderLocalDirMirror: [number, number, number] = [0, 0, 0];
    private chestRotation: [number, number, number, number] = [0, 0, 0, 1];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        if (this.isLeft) {
            this.shoulderLocalDir = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
            );
            this.shoulderLocalDirMirror = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                true,
            );
        } else {
            this.shoulderLocalDir = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
            );
            this.shoulderLocalDirMirror = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
                true,
            );
        }

        const chestUp = getNormal(
            mid(model.leftThigh.originViewPosition, model.rightThigh.originViewPosition),
            mid(model.leftUpperArm.originViewPosition, model.rightUpperArm.originViewPosition)
        );
        const chestRight = getNormal(model.rightUpperArm.originViewPosition, model.leftUpperArm.originViewPosition);
        this.chestRotation = getQuatFromRightUp(chestRight, chestUp);
    }

    match(result: MatchResult, buffers: FeatureBuffers, index: number): void {
        const chestRotation = featureBuffers.chest.getChestRotation(buffers.chest, index);
        if (isQuatZero(chestRotation)) {
            return;
        }

        const leftUpperArmDir = featureBuffers.upperArm.getLeftUpperArmDir(buffers.upperArm, index);
        const rightUpperArmDir = featureBuffers.upperArm.getRightUpperArmDir(buffers.upperArm, index);

        const shoulderErrL = angleBetweenVec3(leftUpperArmDir, this.isLeft ? this.shoulderLocalDir : this.shoulderLocalDirMirror);
        const chestErrL = getQuatDistance(this.chestRotation, this.isLeft ? chestRotation : getQuatMirrorX(chestRotation));
        const shoulderErrR = angleBetweenVec3(rightUpperArmDir, !this.isLeft ? this.shoulderLocalDir : this.shoulderLocalDirMirror);
        const chestErrR = getQuatDistance(this.chestRotation, !this.isLeft ? chestRotation : getQuatMirrorX(chestRotation));

        let scoreL = (Math.PI - shoulderErrL) * (Math.PI - chestErrL);
        let scoreR = (Math.PI - shoulderErrR) * (Math.PI - chestErrR);
        if (isVecZero(leftUpperArmDir) || shoulderErrL > MAX_ERROR || chestErrL > MAX_ERROR) {
            scoreL = -Infinity;
        }
        if (isVecZero(rightUpperArmDir) || shoulderErrR > MAX_ERROR || chestErrR > MAX_ERROR) {
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