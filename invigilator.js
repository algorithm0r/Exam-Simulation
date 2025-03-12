class Invigilator {
    constructor() {
        gameEngine.invigilator = this;

        this.students = [];

        for (let i = 0; i < PARAMS.numStudents; i++) {
            this.students.push(new Student(i));
        }

        this.histogram = new Array(PARAMS.numQuestions + 1).fill(0);
        this.histograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));

        this.minutes = 0;
    }

    update() {
        if (this.minutes++ < PARAMS.timeLimit) {
            this.histogram = new Array(PARAMS.numQuestions + 1).fill(0);
            this.histograms = new Array(PARAMS.numTraits + 1).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));

            for (let i = 0; i < PARAMS.numStudents; i++) {
                this.students[i].update();
                this.histogram[this.students[i].score]++;
                this.histograms[this.students[i].badTraits][this.students[i].score]++;
            }
        }
    }

    drawHistogram(ctx) {
        // draw histogram
        let histogramHeight = 750;
        let barWidth = 4;
        let barHeight = 1;
        ctx.strokeRect(802, 0, this.histogram.length * barWidth, histogramHeight);
        // let fiveSum = 0;
        // let tenSum = 0;
        // ctx.fillStyle = "LightGray";
        // for (let i = 0; i < this.histogram.length; i++) {
        //     let height = this.histogram[i] * 2;
        //     tenSum += height;
        //     let x = 802 + (i + 1) * barWidth;
        //     let y = histogramHeight - tenSum;
        //     if (i % 10 === 0 && tenSum > 0) {
        //         ctx.fillRect(x, y, -barWidth * 10, tenSum);
        //         ctx.strokeRect(x, y, -barWidth * 10, tenSum);
        //         tenSum = 0;
        //     }
        // }
        ctx.fillStyle = "Grey";
        for (let i = 0; i < this.histogram.length; i++) {
            // let height = this.histogram[i] * 2;
            // fiveSum += height;
            let x = 802 + (i + 1) * barWidth;
            // let y = histogramHeight - fiveSum;
            if (i % 5 === 0) {
                ctx.beginPath();
                ctx.moveTo(x, histogramHeight);
                ctx.lineTo(x, histogramHeight + barWidth);
                ctx.stroke();
                // if (fiveSum > 0) {
                //     ctx.fillRect(x, y, -barWidth * 5, fiveSum);
                //     ctx.strokeRect(x, y, -barWidth * 5, fiveSum);
                //     fiveSum = 0;
                // }
            }
        }
        let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"];

        ctx.fillStyle = rgb(72, 72, 72);
        for (let i = 0; i < this.histogram.length; i++) {
            let height = this.histogram[i] * barHeight;
            let x = 802 + i * barWidth;
            let y = histogramHeight - height;
            if (height > 0) {
                ctx.fillRect(x, y, barWidth, height);
                ctx.strokeRect(x, y, barWidth, height);
                // y += height;
            }    
            for (let j = 0; j < PARAMS.numTraits; j++) {
                ctx.fillStyle = colors[j];
                height = this.histograms[j][i] * barHeight;
                if (height > 0) {
                    ctx.fillRect(x, y, barWidth, height);
                    ctx.strokeRect(x, y, barWidth, height);
                    y += height;
                }    
            }
        }

        // for (let j = 0; j < PARAMS.numTraits; j++) {
        //     ctx.fillStyle = colors[j];
        //     for (let i = 0; i < this.histogram.length; i++) {
        //         let height = this.histograms[j][i] * 1;
        //         let x = 802 + i * barWidth;
        //         let y = histogramHeight - height;
        //         if (height > 0) {
        //             ctx.fillRect(x, y, barWidth, height);
        //             ctx.strokeRect(x, y, barWidth, height);
        //         }
        //     }
        // }
    }

    draw(ctx) {
        // draw students
        for (let i = 0; i < PARAMS.numStudents; i++) {
            this.students[i].draw(ctx);
        }

        this.drawHistogram(ctx);

        const timeLength = Math.min(this.minutes/PARAMS.timeLimit,1)*400;
        ctx.fillRect(802, 760, timeLength, 10) 
        ctx.strokeRect(802, 760, 400, 10);
    }
}