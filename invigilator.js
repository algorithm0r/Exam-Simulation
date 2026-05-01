class Invigilator {
    constructor() {
        gameEngine.invigilator = this;

        // Build all 64 groups (one per combination of 6 binary traits)
        this.groups = [];

        for (let mask = 0; mask < 64; mask++) {
            const badCount = countBits(mask);
            const label = mask.toString(2).padStart(6, '0');

            // Build raw config: for each trait, pick good or bad value based on mask bit
            // Trait i corresponds to bit (5 - i), so trait 0 is the MSB (leftmost in label)
            const config = {};
            PARAMS.traits.forEach((trait, i) => {
                const isBad = (mask >> (5 - i)) & 1;
                config[trait.key] = isBad ? trait.bad : trait.good;
            });

            const students = [];
            for (let j = 0; j < PARAMS.popPerGroup; j++) {
                students.push(new Student(config, badCount));
            }

            this.groups.push({
                students,
                mask,
                badCount,
                label,
                histogram: new Array(PARAMS.numQuestions + 1).fill(0)
            });
        }

        // Sort by bad trait count (ascending), then by mask for stable ordering within count
        this.groups.sort((a, b) => a.badCount - b.badCount || a.mask - b.mask);

        this.minutes = 0;

        this.fullPop = this.getStackData(0);
    }

    update() {
        if (this.minutes++ < PARAMS.timeLimit) {
            for (const group of this.groups) {
                group.histogram = new Array(PARAMS.numQuestions + 1).fill(0);
                for (const student of group.students) {
                    student.update();
                    group.histogram[student.score]++;
                }
            }
        }

        this.fullPop = this.getStackData(0);
    }

    // ─── Data aggregation ────────────────────────────────────────────────────

    getStackData(viewMode) {
        if (viewMode === 0) {
            // Simple sum — one grey layer
            const total = new Array(PARAMS.numQuestions + 1).fill(0);
            for (const group of this.groups) {
                for (let s = 0; s <= PARAMS.numQuestions; s++) {
                    total[s] += group.histogram[s];
                }
            }
            return { layers: [total], colors: ["#808080"] };

        } else if (viewMode === 1) {
            // Stack by bad trait count (7 layers, 0–6)
            const layers = Array.from({ length: 7 }, () => new Array(PARAMS.numQuestions + 1).fill(0));
            for (const group of this.groups) {
                for (let s = 0; s <= PARAMS.numQuestions; s++) {
                    layers[group.badCount][s] += group.histogram[s];
                }
            }
            return { layers, colors: PARAMS.badCountColors };

        } else {
            // Stack by a single trait (viewMode 2–7 → trait index 0–5)
            // Layer 0 = good, Layer 1 = bad
            const traitIdx = viewMode - 2;
            const layers = [
                new Array(PARAMS.numQuestions + 1).fill(0),  // good
                new Array(PARAMS.numQuestions + 1).fill(0)   // bad
            ];
            for (const group of this.groups) {
                const isBad = (group.mask >> (5 - traitIdx)) & 1;
                for (let s = 0; s <= PARAMS.numQuestions; s++) {
                    layers[isBad][s] += group.histogram[s];
                }
            }
            return { layers, colors: ["#4D96FF", "#FF6B6B"] };
        }
    }

    // ─── Drawing ─────────────────────────────────────────────────────────────

    drawSmallHistogram(ctx, group, cellX, cellY, cellW, cellH) {
        const color   = PARAMS.badCountColors[group.badCount];
        const padding = 2;
        const labelH  = 11;

        // white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(cellX, cellY, cellW, cellH);

        // colored border (bad count color)
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);
        ctx.lineWidth = 1;

        // 6-bit label
        ctx.font = "8px monospace";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(group.label, cellX + cellW / 2, cellY + labelH);

        const hX = cellX + padding;
        const hY = cellY + labelH + 1;
        const hW = cellW - 2 * padding;
        const hH = cellH - labelH - 1 - padding;

        // Save context and create clipping region
        ctx.save();
        ctx.beginPath();
        ctx.rect(hX, hY, hW, hH);
        ctx.clip();

        const yScale = 1;

        ctx.fillStyle = "lightgrey";
        for (let s = 0; s <= PARAMS.numQuestions; s++) {
            const greyHeight = (this.fullPop.layers[0][s] / PARAMS.popPerGroup) * hH * yScale;
            if (greyHeight > 0) {
                const x = hX + Math.floor(s * hW / (PARAMS.numQuestions + 1));
                ctx.fillRect(x, hY + hH - greyHeight, 1, greyHeight);
            }
        }

        ctx.fillStyle = color;
        for (let s = 0; s <= PARAMS.numQuestions; s++) {
            const height = (group.histogram[s] / PARAMS.popPerGroup) * hH * yScale;
            if (height > 0) {
                const x = hX + Math.floor(s * hW / (PARAMS.numQuestions + 1));
                ctx.fillRect(x, hY + hH - height, 1, height);
            }
        }

        // Restore context (remove clipping)
        ctx.restore();
    }

    drawLargeHistogram(ctx) {
        const viewMode = parseInt(document.getElementById('histView').value);
        const histX          = 810;
        const histogramHeight = 720;
        const barWidth        = 7;

        const { layers, colors } = this.getStackData(viewMode);

        // Compute column totals for scaling
        const totals = new Array(PARAMS.numQuestions + 1).fill(0);
        for (const layer of layers) {
            for (let s = 0; s <= PARAMS.numQuestions; s++) {
                totals[s] += layer[s];
            }
        }
        const maxVal = Math.max(...totals, 1);
        const scale  = histogramHeight / maxVal;

        // Outer border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(histX, 0, (PARAMS.numQuestions + 1) * barWidth, histogramHeight);

        // Tick marks every 10 questions
        ctx.strokeStyle = "#888888";
        for (let s = 0; s <= PARAMS.numQuestions; s++) {
            if (s % 10 === 0) {
                const x = histX + s * barWidth;
                ctx.beginPath();
                ctx.moveTo(x, histogramHeight);
                ctx.lineTo(x, histogramHeight + 5);
                ctx.stroke();
                ctx.fillStyle = "#000000";
                ctx.font = "9px Arial";
                ctx.textAlign = "center";
                ctx.fillText(s, x, histogramHeight + 15);
            }
        }

        // Stacked bars (bottom to top: best traits at bottom, worst on top for view 1)
        for (let s = 0; s <= PARAMS.numQuestions; s++) {
            let stackY = histogramHeight;
            for (let l = 0; l < layers.length; l++) {
                const height = layers[l][s] * scale;
                if (height > 0) {
                    stackY -= height;
                    ctx.fillStyle = colors[l];
                    ctx.fillRect(histX + s * barWidth, stackY, barWidth, height);
                    ctx.strokeRect(histX + s * barWidth, stackY, barWidth, height);
                }
            }
        }

        // Legend
        const legendX = histX;
        const legendY = histogramHeight + 25;
        ctx.font = "10px Arial";
        ctx.textAlign = "left";

        if (viewMode === 0) {
            ctx.fillStyle = "#808080";
            ctx.fillRect(legendX, legendY, 12, 10);
            ctx.fillStyle = "#000000";
            ctx.fillText("All students", legendX + 16, legendY + 9);

        } else if (viewMode === 1) {
            for (let c = 0; c < 7; c++) {
                const lx = legendX + c * 105;
                ctx.fillStyle = PARAMS.badCountColors[c];
                ctx.fillRect(lx, legendY, 12, 10);
                ctx.fillStyle = "#000000";
                ctx.fillText(c + " bad traits", lx + 16, legendY + 9);
            }
        } else {
            const traitName = PARAMS.traits[viewMode - 2].name;
            ctx.fillStyle = "#4D96FF";
            ctx.fillRect(legendX, legendY, 12, 10);
            ctx.fillStyle = "#000000";
            ctx.fillText("Good " + traitName, legendX + 16, legendY + 9);
            ctx.fillStyle = "#FF6B6B";
            ctx.fillRect(legendX + 120, legendY, 12, 10);
            ctx.fillStyle = "#000000";
            ctx.fillText("Bad " + traitName, legendX + 136, legendY + 9);
        }

        // Time progress bar
        const timeLength = Math.min(this.minutes / PARAMS.timeLimit, 1) * (PARAMS.numQuestions + 1) * barWidth;
        ctx.fillStyle = "#000000";
        ctx.fillRect(histX, histogramHeight + 45, timeLength, 8);
        ctx.strokeRect(histX, histogramHeight + 45, (PARAMS.numQuestions + 1) * barWidth, 8);
    }

    draw(ctx) {
        const cellW = 100;
        const cellH = 100;

        // 8x8 grid of small histograms, sorted by bad count (filled row by row)
        for (let i = 0; i < this.groups.length; i++) {
            const col = i % 8;
            const row = Math.floor(i / 8);
            this.drawSmallHistogram(ctx, this.groups[i], col * cellW, row * cellH, cellW, cellH);
        }

        this.drawLargeHistogram(ctx);
    }
}
