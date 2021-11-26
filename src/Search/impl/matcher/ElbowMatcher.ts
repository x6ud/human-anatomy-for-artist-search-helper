import SkeletonModel from '../../../component/SkeletonModelCanvas/model/SkeletonModel';
import {angleBetweenVec3} from '../../../utils/math/math';
import {featureBuffers} from '../feature/feature-buffers';
import {
    angle2DBetweenVec3,
    getAngle2D,
    getNegative,
    getNormal,
    getNormalInLocalSpace,
    getQuatDistance,
    getQuatFromRightUp,
    getQuatMirrorX,
    isQuatZero,
    isVecZero,
    mid,
    simplifyAngle
} from '../math';
import PoseMatcher, {FeatureBuffers, MatchResult} from './PoseMatcher';

const MAX_VIEW_ANGLE_ERROR = Math.PI / 180 * 45;
const MAX_WORLD_SPACE_ANGLE_ERROR = Math.PI / 180 * 60;

const Z_AXIS: [number, number, number] = [0, 0, 1];

export default class ElbowMatcher implements PoseMatcher {

    private isLeft: boolean;

    private upperArmZAxisAngle: number = 0;
    private lowerArmZAxisAngle: number = 0;
    private elbowAngle: number = 0;
    private elbowViewAngle: number = 0;
    private upperArmLocalDir: [number, number, number] = [0, 0, 0];
    private upperArmLocalDirMirror: [number, number, number] = [0, 0, 0];
    private chestRotation: [number, number, number, number] = [0, 0, 0, 1];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let shoulder = model.rightUpperArm.originViewPosition;
        let elbow = model.rightUpperArm.controlPointViewPosition;
        let wrist = model.rightLowerArm.controlPointViewPosition;
        if (this.isLeft) {
            shoulder = model.leftUpperArm.originViewPosition;
            elbow = model.leftUpperArm.controlPointViewPosition;
            wrist = model.leftLowerArm.controlPointViewPosition;
        }
        const upperArmNormal = getNormal(shoulder, elbow);
        const lowerArmNormal = getNormal(elbow, wrist);
        this.upperArmZAxisAngle = angleBetweenVec3(Z_AXIS, upperArmNormal);
        this.lowerArmZAxisAngle = angleBetweenVec3(Z_AXIS, lowerArmNormal);
        this.elbowAngle = angleBetweenVec3(upperArmNormal, lowerArmNormal);
        this.elbowViewAngle = simplifyAngle(getAngle2D(elbow, shoulder, elbow, wrist)) - Math.PI;

        if (this.isLeft) {
            this.upperArmLocalDir = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
            );
            this.upperArmLocalDirMirror = getNormalInLocalSpace(
                model.rightUpperArm.originWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.leftUpperArm.originWorldPosition,
                model.leftUpperArm.controlPointWorldPosition,
                true,
            );
        } else {
            this.upperArmLocalDir = getNormalInLocalSpace(
                model.leftUpperArm.originWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.trunk.originWorldPosition,
                model.trunk.controlPointWorldPosition,
                model.rightUpperArm.originWorldPosition,
                model.rightUpperArm.controlPointWorldPosition,
            );
            this.upperArmLocalDirMirror = getNormalInLocalSpace(
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
        const leftLowerArmDir = featureBuffers.lowerArm.getLeftLowerArmDir(buffers.lowerArm, index);
        const rightUpperArmDir = featureBuffers.upperArm.getRightUpperArmDir(buffers.upperArm, index);
        const rightLowerArmDir = featureBuffers.lowerArm.getRightLowerArmDir(buffers.lowerArm, index);

        const upperArmZAxisAngleL = angleBetweenVec3(Z_AXIS, leftUpperArmDir);
        const lowerArmZAxisAngleL = angleBetweenVec3(Z_AXIS, leftLowerArmDir);
        const elbowAngleL = angleBetweenVec3(leftUpperArmDir, leftLowerArmDir);
        const elbowViewAngleL = simplifyAngle(angle2DBetweenVec3(getNegative(leftUpperArmDir), leftLowerArmDir)) - Math.PI;

        const upperArmZAngleErrL = Math.abs(this.upperArmZAxisAngle - upperArmZAxisAngleL);
        const lowerArmZAngleErrL = Math.abs(this.lowerArmZAxisAngle - lowerArmZAxisAngleL);
        const elbowAngleErrL = Math.abs(this.elbowAngle - elbowAngleL);
        const elbowViewAngleErrL = Math.abs(this.elbowViewAngle - elbowViewAngleL * (this.isLeft ? 1 : -1));
        const upperArmAngleErrL = angleBetweenVec3(leftUpperArmDir, this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);
        const chestErrL = getQuatDistance(this.chestRotation, this.isLeft ? chestRotation : getQuatMirrorX(chestRotation));
        let scoreL =
            (Math.PI - upperArmZAngleErrL)
            * (Math.PI - lowerArmZAngleErrL)
            * (Math.PI - elbowAngleErrL)
            * (Math.PI * 2 - elbowViewAngleErrL)
            * (Math.PI - upperArmAngleErrL)
            * (Math.PI - chestErrL)
        ;

        const upperArmZAxisAngleR = angleBetweenVec3(Z_AXIS, rightUpperArmDir);
        const lowerArmZAxisAngleR = angleBetweenVec3(Z_AXIS, rightLowerArmDir);
        const elbowAngleR = angleBetweenVec3(rightUpperArmDir, rightLowerArmDir);
        const elbowViewAngleR = simplifyAngle(angle2DBetweenVec3(getNegative(rightUpperArmDir), rightLowerArmDir)) - Math.PI;

        const upperArmZAngleErrR = Math.abs(this.upperArmZAxisAngle - upperArmZAxisAngleR);
        const lowerArmZAngleErrR = Math.abs(this.lowerArmZAxisAngle - lowerArmZAxisAngleR);
        const elbowAngleErrR = Math.abs(this.elbowAngle - elbowAngleR);
        const elbowViewAngleErrR = Math.abs(this.elbowViewAngle - elbowViewAngleR * (!this.isLeft ? 1 : -1));
        const upperArmAngleErrR = angleBetweenVec3(rightUpperArmDir, !this.isLeft ? this.upperArmLocalDir : this.upperArmLocalDirMirror);
        const chestErrR = getQuatDistance(this.chestRotation, !this.isLeft ? chestRotation : getQuatMirrorX(chestRotation));
        let scoreR =
            (Math.PI - upperArmZAngleErrR)
            * (Math.PI - lowerArmZAngleErrR)
            * (Math.PI - elbowAngleErrR)
            * (Math.PI * 2 - elbowViewAngleErrR)
            * (Math.PI - upperArmAngleErrR)
            * (Math.PI - chestErrR)
        ;

        if (isVecZero(leftUpperArmDir)
            || isVecZero(leftLowerArmDir)
            || upperArmZAngleErrL > MAX_VIEW_ANGLE_ERROR
            || lowerArmZAngleErrL > MAX_VIEW_ANGLE_ERROR
            || elbowAngleErrL > MAX_WORLD_SPACE_ANGLE_ERROR
            || elbowViewAngleErrL > MAX_VIEW_ANGLE_ERROR
            || upperArmAngleErrL > MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            scoreL = -Infinity;
        }
        if (isVecZero(rightUpperArmDir)
            || isVecZero(rightLowerArmDir)
            || upperArmZAngleErrR > MAX_VIEW_ANGLE_ERROR
            || lowerArmZAngleErrR > MAX_VIEW_ANGLE_ERROR
            || elbowAngleErrR > MAX_WORLD_SPACE_ANGLE_ERROR
            || elbowViewAngleErrR > MAX_VIEW_ANGLE_ERROR
            || upperArmAngleErrR > MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
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