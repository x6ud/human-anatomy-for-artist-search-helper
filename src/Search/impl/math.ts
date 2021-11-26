import {quat, ReadonlyQuat, ReadonlyVec3, vec3} from 'gl-matrix';
import {angleBetweenVec3, quatLookRotation} from '../../utils/math/math';

export function mid(...points: ReadonlyVec3[]) {
    const ret: [number, number, number] = [0, 0, 0];
    for (let point of points) {
        vec3.add(ret, ret, point);
    }
    if (points.length) {
        vec3.scale(ret, ret, 1 / points.length);
    }
    return ret;
}

export function simplifyAngle(rad: number) {
    rad = rad % (Math.PI * 2);
    if (rad < 0) {
        rad += Math.PI * 2;
    }
    return rad;
}

export function angle2DBetweenVec3(a: ReadonlyVec3, b: ReadonlyVec3) {
    return Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]);
}


export function getAngle2D(a0: ReadonlyVec3, a1: ReadonlyVec3, b0: ReadonlyVec3, b1: ReadonlyVec3) {
    return Math.atan2(b1[1] - b0[1], b1[0] - b0[0]) - Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
}

export function getAngle(a0: ReadonlyVec3, a1: ReadonlyVec3, b0: ReadonlyVec3, b1: ReadonlyVec3) {
    const a: ReadonlyVec3 = [
        a1[0] - a0[0],
        a1[1] - a0[1],
        a1[2] - a0[2],
    ];
    const b: ReadonlyVec3 = [
        b1[0] - b0[0],
        b1[1] - b0[1],
        b1[2] - b0[2],
    ];
    return angleBetweenVec3(a, b);
}

export function avg(...nums: number[]) {
    return nums.reduce((sum, curr) => sum + curr, 0) / nums.length;
}

export function getNegative(v: ReadonlyVec3): [number, number, number] {
    return [-v[0], -v[1], -v[2]];
}

export const getNormalInLocalSpace = (function () {
    const up = vec3.create();
    const right = vec3.create();
    const forward = vec3.create();
    const v = vec3.create();
    const q = quat.create();
    return function (
        right0: ReadonlyVec3,
        right1: ReadonlyVec3,
        up0: ReadonlyVec3,
        up1: ReadonlyVec3,
        v0: ReadonlyVec3,
        v1: ReadonlyVec3,
        flipX: boolean = false,
    ) {
        vec3.sub(up, up1, up0);
        if (flipX) {
            up[0] = -up[0];
        }
        vec3.normalize(up, up);
        vec3.sub(right, right1, right0);
        if (flipX) {
            right[0] = -right[0];
        }
        vec3.cross(forward, right, up);
        vec3.normalize(forward, forward);
        quatLookRotation(q, forward, up);
        quat.invert(q, q);
        vec3.sub(v, v1, v0);
        if (flipX) {
            v[0] = -v[0];
        }
        vec3.normalize(v, v);
        return vec3.transformQuat([0, 0, 0], v, q) as [number, number, number];
    };
})();

export function getNormal(
    v0: ReadonlyVec3,
    v1: ReadonlyVec3,
) {
    const v = vec3.sub([0, 0, 0], v1, v0) as [number, number, number];
    vec3.normalize(v, v);
    return v;
}

export function normalizedLandmarkToViewSpace(point: ReadonlyVec3, aspect: number) {
    return [
        (point[0] * 2 - 1) * aspect,
        -point[1] * 2 + 1,
        point[2] * aspect
    ] as [number, number, number];
}

export function flipX(point: ReadonlyVec3) {
    return [-point[0], point[1], point[2]] as [number, number, number];
}

export function cross(a: ReadonlyVec3, b: ReadonlyVec3) {
    const ret: [number, number, number] = [0, 0, 0];
    vec3.cross(ret, a, b);
    return ret;
}

export function isWithinBoundary2D(point: ReadonlyVec3) {
    return point[0] >= 0 && point[0] <= 1 && point[1] >= 0 && point[1] <= 1;
}

export function isNormalizedLandmarksWithinBoundary(...points: ReadonlyVec3[]) {
    for (let point of points) {
        if (!isWithinBoundary2D(point)) {
            return false;
        }
    }
    return true;
}

export function getQuatFromForwardUp(forward: ReadonlyVec3, up: ReadonlyVec3) {
    return quatLookRotation([0, 0, 0, 1], forward, up) as [number, number, number, number];
}

export const getQuatFromRightUp = (function () {
    const tmp_forward = vec3.create();
    return function (right: ReadonlyVec3, up: ReadonlyVec3) {
        vec3.cross(tmp_forward, right, up);
        vec3.normalize(tmp_forward, tmp_forward);
        return getQuatFromForwardUp(tmp_forward, up);
    };
})();

export const getQuatFromRightForward = (function () {
    const tmp_up = vec3.create();
    return function (right: ReadonlyVec3, forward: ReadonlyVec3) {
        vec3.cross(tmp_up, forward, right);
        vec3.normalize(tmp_up, tmp_up);
        return getQuatFromForwardUp(forward, tmp_up);
    };
})();

export function isVecZero(v: ReadonlyVec3) {
    return v[0] === 0 && v[1] === 0 && v[2] === 0;
}

export function isQuatZero(q: ReadonlyQuat) {
    return q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 0;
}

export function getQuatMirrorX(q: ReadonlyQuat): [number, number, number, number] {
    return [q[0], -q[1], -q[2], q[3]];
}

export function getQuatDistance(q1: ReadonlyQuat, q2: ReadonlyQuat) {
    const prod = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
    return Math.acos(2 * prod ** 2 - 1);
}
