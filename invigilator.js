class Invigilator {
    constructor() {
        gameEngine.invigilator = this;

        this.students = [];

        for (let i = 0; i < PARAMS.numStudents; i++) {
            this.students.push(new Student(i));
        }

        this.histogram = new Array(PARAMS.numQuestions + 1).fill(0);
        this.histograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));
        this.goodTraitHistograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numTraits + 1).fill(0));
        this.badTraitHistograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numTraits + 1).fill(0));
        this.controlHistogram = new Array(PARAMS.numQuestions + 1).fill(0);
        this.controlHistograms = [this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram];

        this.minutes = 0;
    }

    update() {
        if (this.minutes++ < PARAMS.timeLimit) {
            this.histogram = new Array(PARAMS.numQuestions + 1).fill(0);
            this.histograms = new Array(PARAMS.numTraits + 1).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));
            this.goodTraitHistograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));
            this.badTraitHistograms = new Array(PARAMS.numTraits).fill().map(() => new Array(PARAMS.numQuestions + 1).fill(0));
            this.controlHistogram = new Array(PARAMS.numQuestions + 1).fill(0);
            this.controlHistograms = [this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram, this.controlHistogram];
            for (let i = 0; i < PARAMS.numStudents; i++) {
                this.students[i].update();
                this.histogram[this.students[i].score]++;
                this.histograms[this.students[i].badTraits][this.students[i].score]++;

                if(this.students[i].badTraits === 0) {
                    this.controlHistogram[this.students[i].score]++;
                }

                if(this.students[i].ambitionLow) {
                    this.badTraitHistograms[0][this.students[i].score]++;
                } else {
                    this.goodTraitHistograms[0][this.students[i].score]++;
                }
                if(this.students[i].confidenceLow) {
                    this.badTraitHistograms[1][this.students[i].score]++;
                } else {
                    this.goodTraitHistograms[1][this.students[i].score]++;
                }
                if(this.students[i].focusLow) {
                    this.badTraitHistograms[2][this.students[i].score]++;
                } else {  
                    this.goodTraitHistograms[2][this.students[i].score]++;
                }
                if(this.students[i].enduranceLow) {
                    this.badTraitHistograms[3][this.students[i].score]++;
                } else {
                    this.goodTraitHistograms[3][this.students[i].score]++;
                }
                if(this.students[i].examStrategyBad) {
                    this.badTraitHistograms[4][this.students[i].score]++;
                } else {
                    this.goodTraitHistograms[4][this.students[i].score]++; 
                }
                if(this.students[i].guessAllRemaining) {
                    this.goodTraitHistograms[5][this.students[i].score]++;
                } else {
                    this.badTraitHistograms[5][this.students[i].score]++;
                }
            }
        }
    }

    drawHistograms(ctx, histograms, x, barHeight = 1) {
        let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"];

        histograms.forEach((histogram, index) => {
            let histogramHeight = 100;
            let histogramPad = 10;
            let barWidth = 2;
            ctx.fillStyle = rgb(72, 72, 72);
            ctx.strokeRect(x + 2, index * (histogramHeight + histogramPad), histogram.length * barWidth, histogramHeight);

            for (let i = 0; i < histogram.length; i++) {
                ctx.fillStyle = colors[index];
                let height = histogram[i] * barHeight;
                let xPos = x + 2 + i * barWidth;
                let y = (index + 1) * (histogramHeight + histogramPad) - height - histogramPad;
                if (height > 0) {
                    ctx.fillRect(xPos, y, barWidth, height);
                    ctx.strokeRect(xPos, y, barWidth, height);
                }
            }
        });
    }

    drawHistogram(ctx) {
        // draw histogram
        let histogramHeight = 750;
        let barWidth = 4;
        let barHeight = 1;
        ctx.strokeRect(902, 0, this.histogram.length * barWidth, histogramHeight);
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
            let height = this.histogram[i] * 2;
            // fiveSum += height;
            let x = 902 + (i + 1) * barWidth;
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
            let x = 902 + i * barWidth;
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
        //         let x = 902 + i * barWidth;
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
        // for (let i = 0; i < PARAMS.numStudents; i++) {
        //     this.students[i].draw(ctx);
        // }

        this.drawHistogram(ctx);
        this.drawHistograms(ctx, this.histograms, 0, 0.75);
        this.drawHistograms(ctx, this.goodTraitHistograms, 210, 0.5);
        this.drawHistograms(ctx, this.badTraitHistograms, 420, 0.5);
        this.drawHistograms(ctx, this.controlHistograms, 630, 1);

        const timeLength = Math.min(this.minutes/PARAMS.timeLimit,1)*400;
        ctx.fillRect(902, 760, timeLength, 10) 
        ctx.strokeRect(902, 760, 400, 10);
    }
}