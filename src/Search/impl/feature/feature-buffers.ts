import CalfFeatureBuffer from './CalfFeatureBuffer';
import ChestFeatureBuffer from './ChestFeatureBuffer';
import CrotchFeatureBuffer from './CrotchFeatureBuffer';
import FaceFeatureBuffer from './FaceFeatureBuffer';
import LowerArmFeatureBuffer from './LowerArmFeatureBuffer';
import ThighFeatureBuffer from './ThighFeatureBuffer';
import UpperArmFeatureBuffer from './UpperArmFeatureBuffer';

export const featureBuffers = {
    chest: new ChestFeatureBuffer(),
    face: new FaceFeatureBuffer(),
    upperArm: new UpperArmFeatureBuffer(),
    lowerArm: new LowerArmFeatureBuffer(),
    crotch: new CrotchFeatureBuffer(),
    thigh: new ThighFeatureBuffer(),
    calf: new CalfFeatureBuffer(),
};