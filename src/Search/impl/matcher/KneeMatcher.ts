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

export default class KneeMatcher implements PoseMatcher {

    private isLeft: boolean;

    private thighZAxisAngle: number = 0;
    private calfZAxisAngle: number = 0;
    private kneeAngle: number = 0;
    private kneeViewAngle: number = 0;
    private thighLocalDir: [number, number, number] = [0, 0, 0];
    private thighLocalDirMirror: [number, number, number] = [0, 0, 0];
    private crotchRotation: [number, number, number, number] = [0, 0, 0, 1];

    constructor(isLeft: boolean) {
        this.isLeft = isLeft;
    }

    prepare(model: SkeletonModel): void {
        let hip = model.rightThigh.originViewPosition;
        let knee = model.rightThigh.controlPointViewPosition;
        let ankle = model.rightCalf.controlPointViewPosition;
        if (this.isLeft) {
            hip = model.leftThigh.originViewPosition;
            knee = model.leftThigh.controlPointViewPosition;
            ankle = model.leftCalf.controlPointViewPosition;
        }
        const thighNormal = getNormal(hip, knee);
        const calfNormal = getNormal(knee, ankle);
        this.thighZAxisAngle = angleBetweenVec3(Z_AXIS, thighNormal);
        this.calfZAxisAngle = angleBetweenVec3(Z_AXIS, calfNormal);
        this.kneeAngle = angleBetweenVec3(thighNormal, calfNormal);
        this.kneeViewAngle = simplifyAngle(getAngle2D(knee, hip, knee, ankle)) - Math.PI;

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
        const leftCalfDir = featureBuffers.calf.getLeftCalfDir(buffers.calf, index);
        const rightThighDir = featureBuffers.thigh.getRightThighDir(buffers.thigh, index);
        const rightCalfDir = featureBuffers.calf.getRightCalfDir(buffers.calf, index);

        const thighZAxisAngleL = angleBetweenVec3(Z_AXIS, leftThighDir);
        const calfZAxisAngleL = angleBetweenVec3(Z_AXIS, leftCalfDir);
        const kneeAngleL = angleBetweenVec3(leftThighDir, leftCalfDir);
        const kneeViewAngleL = simplifyAngle(angle2DBetweenVec3(getNegative(leftThighDir), leftCalfDir)) - Math.PI;

        const thighZAngleErrL = Math.abs(this.thighZAxisAngle - thighZAxisAngleL);
        const calfZAngleErrL = Math.abs(this.calfZAxisAngle - calfZAxisAngleL);
        const kneeAngleErrL = Math.abs(this.kneeAngle - kneeAngleL);
        const kneeViewAngleErrL = Math.abs(this.kneeViewAngle - kneeViewAngleL * (this.isLeft ? 1 : -1));
        const thighAngleErrL = angleBetweenVec3(leftThighDir, this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
        const crotchErrL = getQuatDistance(this.crotchRotation, this.isLeft ? crotchRotation : getQuatMirrorX(crotchRotation));
        let scoreL =
            (Math.PI - thighZAngleErrL)
            * (Math.PI - calfZAngleErrL)
            * (Math.PI - kneeAngleErrL)
            * (Math.PI * 2 - kneeViewAngleErrL)
            * (Math.PI - thighAngleErrL)
            * (Math.PI - crotchErrL)
        ;

        const thighZAxisAngleR = angleBetweenVec3(Z_AXIS, rightThighDir);
        const calfZAxisAngleR = angleBetweenVec3(Z_AXIS, rightCalfDir);
        const kneeAngleR = angleBetweenVec3(rightThighDir, rightCalfDir);
        const kneeViewAngleR = simplifyAngle(angle2DBetweenVec3(getNegative(rightThighDir), rightCalfDir)) - Math.PI;

        const thighZAngleErrR = Math.abs(this.thighZAxisAngle - thighZAxisAngleR);
        const calfZAngleErrR = Math.abs(this.calfZAxisAngle - calfZAxisAngleR);
        const kneeAngleErrR = Math.abs(this.kneeAngle - kneeAngleR);
        const kneeViewAngleErrR = Math.abs(this.kneeViewAngle - kneeViewAngleR * (!this.isLeft ? 1 : -1));
        const thighAngleErrR = angleBetweenVec3(rightThighDir, !this.isLeft ? this.thighLocalDir : this.thighLocalDirMirror);
        const crotchErrR = getQuatDistance(this.crotchRotation, !this.isLeft ? crotchRotation : getQuatMirrorX(crotchRotation));
        let scoreR =
            (Math.PI - thighZAngleErrR)
            * (Math.PI - calfZAngleErrR)
            * (Math.PI - kneeAngleErrR)
            * (Math.PI * 2 - kneeViewAngleErrR)
            * (Math.PI - thighAngleErrR)
            * (Math.PI - crotchErrR)
        ;

        if (isVecZero(leftThighDir)
            || isVecZero(leftCalfDir)
            || thighZAngleErrL > MAX_VIEW_ANGLE_ERROR
            || calfZAngleErrL > MAX_VIEW_ANGLE_ERROR
            || kneeAngleErrL > MAX_WORLD_SPACE_ANGLE_ERROR
            || kneeViewAngleErrL > MAX_VIEW_ANGLE_ERROR
            || thighAngleErrL > MAX_WORLD_SPACE_ANGLE_ERROR
        ) {
            scoreL = -Infinity;
        }
        if (isVecZero(rightThighDir)
            || isVecZero(rightCalfDir)
            || thighZAngleErrR > MAX_VIEW_ANGLE_ERROR
            || calfZAngleErrR > MAX_VIEW_ANGLE_ERROR
            || kneeAngleErrR > MAX_WORLD_SPACE_ANGLE_ERROR
            || kneeViewAngleErrR > MAX_VIEW_ANGLE_ERROR
            || thighAngleErrR > MAX_WORLD_SPACE_ANGLE_ERROR
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