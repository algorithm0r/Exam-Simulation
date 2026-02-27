class Student {
    constructor(index) {
        this.x = index % 40;
        this.y = Math.floor(index / 40);

        this.badTraits = 0;

        this.ambitionLow = false;
        this.confidenceLow = false;
        this.focusLow = false;
        this.enduranceLow = false;
        this.examStrategyBad = false;

        // student parameters
        if(PARAMS.ambitionOptimal){
            this.ambition = 0.85;
        } else {
            this.ambition = Math.random()*0.5 + 0.5;
        }
        if(this.ambition < 0.75) {
            this.badTraits++;
            this.ambitionLow = true;
        }
        if(PARAMS.confidenceOptimal){
            this.confidence = 0;
        } else {
            this.confidence = Math.random() > 0.5 ? 1 : 0;
        }
        if(this.confidence > 0.5) {
            this.badTraits++;
            this.confidenceLow = true;
        }
        if(PARAMS.focusOptimal){
            this.focus = 1;
        } else {
            if(Math.random() > 0.5) {
                this.focus = 0.75;
            } else {
                this.focus = 1;
            }
        }
        if(this.focus < 0.875) {
            this.badTraits++;
            this.focusLow = true;
        }
        if(PARAMS.guessOptimal){
            this.guessAllRemaining = true;
        } else {
            this.guessAllRemaining = Math.random() > 0.5 ? true : false;
        }
        if(!this.guessAllRemaining) {
            this.badTraits++;
            this.examStrategyBad = true;
        }
        if(PARAMS.examStratOptimal){
            this.exam = PARAMS.reversedExam;
        } else {
            this.exam = Math.random() > 0.5 ? PARAMS.reversedExam : PARAMS.exam;
        }
        if(this.exam === PARAMS.exam) {
            this.badTraits++;
            this.examStrategyBad = true;
        }
        if(PARAMS.enduranceOptimal){
            this.endurance = 0.999;
        } else {
            this.endurance = 0.995 + Math.random()*0.005;
        }
        if(this.endurance < 0.9975) {
            this.badTraits++;
            this.enduranceLow = true;
        }

        // mutable
        this.tranquility = 1.0;
        this.stamina = 1.0;

        this.anxiety = 0.99 + Math.random()*0.01;
        
    
        this.answers = [];
        this.chances = this.exam.map(value => value*0.25);
     
        this.question = 0;
        this.score = 0;
    }

    think() {
        this.chances[this.question] += 0.1*this.tranquility*this.stamina;
    }

    answerQuestion() {
        let chance = this.chances[this.question];

        let correct = Math.random() < chance;
        if(correct) this.score++;

        if(chance < this.confidence) 
            this.tranquility *= this.anxiety;
        this.nextQuestion();
    }

    nextQuestion() {
        this.question++;
    }

    guessAllQuestions() {
        while(this.question < PARAMS.numQuestions){
            this.answerQuestion();
        }
    }

    isFocused() {
        return Math.random() < this.focus;
    }

    update() {
        // one minute of exam time
        if (this.isFocused()) {
            if(PARAMS.timeLimit - gameEngine.invigilator.minutes < 5 && this.guessAllRemaining) this.guessAllQuestions();
            if (this.chances[this.question] < this.ambition) this.think();
            else this.answerQuestion();
        }
        this.stamina *= this.endurance;
    }

    draw(ctx) {
        // let dimension = PARAMS.dimension;
        // let x = this.x*dimension.width;
        // let y = this.y*dimension.height;
        // let padding = 2;
        // let lineWidth = 1;

        // ctx.lineWidth = lineWidth;
        // // draw cell
        // ctx.fillStyle = "Green"; // score
        // ctx.fillRect(x + padding, y + dimension.height - padding, (dimension.width - 2*padding)/4, -this.score/PARAMS.numQuestions*(dimension.height - 2*padding)); 
        // ctx.fillStyle = "Red"; // tranquility
        // ctx.fillRect(x + padding + (dimension.width - 2*padding)/4, y + dimension.height - padding, (dimension.width - 2*padding)/4, -this.tranquility*(dimension.height - 2*padding)); 
        // ctx.fillStyle = "Blue"; // focus
        // ctx.fillRect(x + padding + 2*(dimension.width - 2*padding)/4, y + dimension.height - padding, (dimension.width - 2*padding)/4, -this.focus*(dimension.height - 2*padding)); 
        // ctx.fillStyle = "Gold"; // stamina
        // ctx.fillRect(x + padding + 3*(dimension.width - 2*padding)/4, y + dimension.height - padding, (dimension.width - 2*padding)/4, -this.stamina*(dimension.height - 2*padding)); 

        // ctx.strokeRect(x + padding, y + padding, dimension.width - 2*padding, dimension.height - 2*padding);
        // // draw student
        // ctx.beginPath();     
        // ctx.stroke();

        // ctx.font = "10px Arial";
        // ctx.fillStyle = "Black";
        // ctx.textAlign = "left";
        // ctx.fillText(this.score, x + 4, y + 12);
    }
}