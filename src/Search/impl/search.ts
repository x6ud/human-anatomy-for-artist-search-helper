import SkeletonModel from '../../component/SkeletonModelCanvas/model/SkeletonModel';
import {MAX_NUM_OF_SEARCH_RESULTS} from '../../config';
import PoseMatcher, {FeatureBuffers, MatchResult} from './matcher/PoseMatcher';

export type SearchResult = {
    id: string;
    url: string;
    score: number;
    flipped: boolean;
};

export function search(
    model: SkeletonModel,
    chunks: { photos: [string, string, number, number][], buffers: FeatureBuffers }[],
    matcher: PoseMatcher
) {
    matcher.prepare(model);
    const matchResult: MatchResult = {score: 0, flipped: false, accepted: false};
    const ret: SearchResult[] = [];
    for (let chunk of chunks) {
        for (let i = 0, len = chunk.photos.length; i < len; ++i) {
            matchResult.score = 0;
            matchResult.accepted = false;
            matchResult.flipped = false;
            matcher.match(matchResult, chunk.buffers, i);
            if (matchResult.accepted) {
                let insertIndex = ret.length;
                for (let i = 0, len = ret.length; i < len; ++i) {
                    if (ret[i].score <= matchResult.score) {
                        insertIndex = i;
                        break;
                    }
                }
                if (insertIndex < MAX_NUM_OF_SEARCH_RESULTS) {
                    const photo = chunk.photos[i];
                    ret.splice(
                        insertIndex,
                        0,
                        {
                            id: photo[0],
                            url: photo[1],
                            score: matchResult.score,
                            flipped: matchResult.flipped,
                        }
                    );
                    if (ret.length > MAX_NUM_OF_SEARCH_RESULTS) {
                        ret.pop();
                    }
                }
            }
        }
    }
    return ret;
}