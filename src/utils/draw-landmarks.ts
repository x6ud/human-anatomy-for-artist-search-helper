import {NUM_OF_LANDMARKS} from './detect-pose';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;

export function drawLandmarks(
    image: HTMLImageElement,
    landmarks: [number, number, number][],
    visibility: number[]
) {
    if (canvas.width !== image.width || canvas.height !== image.height) {
        canvas.width = image.width;
        canvas.height = image.height;
    }
    ctx.drawImage(image, 0, 0);
    const width = image.width;
    const height = image.height;
    if (landmarks.length === NUM_OF_LANDMARKS) {
        ctx.lineWidth = Math.max(width, height) / 100 * 2;

        let count = 0;
        let sum = 0;

        function moveTo(index: number) {
            ctx.beginPath();
            const point = landmarks[index];
            const x = point[0] * width;
            const y = point[1] * height;
            ctx.moveTo(x, y);
            count += 1;
            sum += visibility[index];
        }

        function lineTo(index: number) {
            const point = landmarks[index];
            const x = point[0] * width;
            const y = point[1] * height;
            ctx.lineTo(x, y);
            count += 1;
            sum += visibility[index];
        }

        function stroke() {
            const score = sum / count || 0;
            const r = Math.floor(255 * score);
            const g = 0;
            const b = Math.floor(255 * (1 - score));
            ctx.strokeStyle = `rgb(${r},${g},${b})`;
            ctx.stroke();
            count = 0;
            sum = 0;
        }

        // eyes
        moveTo(8);
        lineTo(6);
        lineTo(5);
        lineTo(4);
        lineTo(0);
        lineTo(1);
        lineTo(2);
        lineTo(3);
        lineTo(7);
        stroke();

        // mouth
        moveTo(10);
        lineTo(9);
        stroke();

        // trunk
        moveTo(12);
        lineTo(24);
        lineTo(23);
        lineTo(11);
        lineTo(12);
        stroke();

        // right arm
        moveTo(12);
        lineTo(14);
        lineTo(16);
        stroke();

        // left arm
        moveTo(11);
        lineTo(13);
        lineTo(15);
        stroke();

        // right leg
        moveTo(24);
        lineTo(26);
        lineTo(28);
        stroke();

        // left leg
        moveTo(23);
        lineTo(25);
        lineTo(27);
        stroke();

        // right hand
        moveTo(16);
        lineTo(18);
        lineTo(20);
        lineTo(16);
        lineTo(22);
        stroke();

        // left hand
        moveTo(15);
        lineTo(17);
        lineTo(19);
        lineTo(15);
        lineTo(21);
        stroke();

        // right foot
        moveTo(28);
        lineTo(32);
        lineTo(30);
        lineTo(28);
        stroke();

        // left foot
        moveTo(27);
        lineTo(29);
        lineTo(31);
        lineTo(27);
        stroke();
    }
    return canvas.toDataURL('jpg', 1);
}