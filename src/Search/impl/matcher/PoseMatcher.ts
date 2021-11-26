import SkeletonModel from '../../../component/SkeletonModelCanvas/model/SkeletonModel';
import {featureBuffers} from '../feature/feature-buffers';

export type FeatureBuffers = { [key in keyof typeof featureBuffers]: Float32Array };

export type MatchResult = {
    score: number;
    flipped: boolean;
    accepted: boolean;
};

export default interface PoseMatcher {

    prepare(model: SkeletonModel): void;

    match(result: MatchResult, buffers: FeatureBuffers, index: number): void;

}