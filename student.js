class Student {
    constructor(config, badTraits) {
        this.badTraits = badTraits;

        // traits — set from config, no randomness
        this.ambition          = config.ambition;
        this.confidence        = config.confidence;
        this.focus             = config.focus;
        this.guessAllRemaining = config.guessAllRemaining;
        this.endurance         = config.endurance;
        this.exam              = config.exam;

        // fixed control value
        this.anxiety = PARAMS.anxiety;

        // mutable state
        this.tranquility = 1.0;
        this.stamina     = 1.0;

        this.chances  = this.exam.map(value => value * 0.25);
        this.question = 0;
        this.score    = 0;
    }

    think() {
        this.chances[this.question] += 0.1 * this.tranquility * this.stamina;
    }

    answerQuestion() {
        let chance = this.chances[this.question];
        let correct = Math.random() < chance;
        if (correct) this.score++;

        if (chance < this.confidence)
            this.tranquility *= this.anxiety;

        this.nextQuestion();
    }

    nextQuestion() {
        this.question++;
    }

    guessAllQuestions() {
        while (this.question < PARAMS.numQuestions) {
            this.answerQuestion();
        }
    }

    isFocused() {
        return Math.random() < this.focus;
    }

    update() {
        if (this.question >= PARAMS.numQuestions) return;

        if (this.isFocused()) {
            if (PARAMS.timeLimit - gameEngine.invigilator.minutes < 5 && this.guessAllRemaining) {
                this.guessAllQuestions();
            } else if (this.chances[this.question] < this.ambition) {
                this.think();
            } else {
                this.answerQuestion();
            }
        }
        this.stamina *= this.endurance;
    }

    draw(ctx) {
        // drawing handled by Invigilator grid
    }
}
