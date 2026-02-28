let numQuestions = 100;
let exam = [];
for (let i = 0; i < 100; i++) {
    if(i < 60) {
        exam.push(3);
    } else if (i < 90) {
        exam.push(2);
    } else {
        exam.push(1);
    }
}
var reversed = exam.slice().reverse();
var shuffled = shuffleArray(exam);

// simulation parameters
var PARAMS = {
    // visualization
    dimension: {
        width: 20,
        height: 80
    },
    // sim
    updatesPerDraw: 1,

    // exams
    numQuestions: numQuestions,
    exam: exam,
    sortedExam: shuffled,
    reversedExam: reversed,
    timeLimit: 360,

    // students
    popPerGroup: 200,   // students per trait combination group (64 groups total)
    numTraits: 6,

    // traits: order here defines the bit order in the 6-bit group label (index 0 = MSB)
    // key must match the property name used in Student constructor
    traits: [
        { name: 'Ambition',          key: 'ambition',          good: 0.85,   bad: 0.65   },
        { name: 'Confidence',        key: 'confidence',        good: 0,      bad: 1      },
        { name: 'Focus',             key: 'focus',             good: 1.0,    bad: 0.75   },
        { name: 'GuessAllRemaining', key: 'guessAllRemaining', good: true,   bad: false  },
        { name: 'Endurance',         key: 'endurance',         good: 0.999,  bad: 0.995  },
        { name: 'Exam Order',        key: 'exam',              good: reversed, bad: exam },
    ],

    // control value (not a trait — triggered only by confidence)
    anxiety: 0.995,

    // colors for bad trait count 0-6
    badCountColors: ["#00AA00", "#88CC00", "#CCCC00", "#FF8800", "#FF4400", "#CC1100", "#880000"],

    // database
    db: "exam_sim",
    collection: "test"
};

// helper functions
function randomInt(n) {
    return Math.floor(Math.random() * n);
};

function randomNormal(mu = 0, sigma = 1) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma + mu;
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function countBits(n) {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
};

function numArray(n) {
    let arr = [];
    for(let i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function rgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
};

function hsl(h, s, l) {
    return "hsl(" + h + "," + s + "%," + l + "%)";
};

function dload() {
    let rows = [];
    for (const group of gameEngine.invigilator.groups) {
        rows.push(group.label + "," + group.histogram.join(","));
    }
    let output = rows.join('\n');
    download("download.csv", output);
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
};

function databaseConnected() {
    const dbDiv = document.getElementById("db");
    dbDiv.classList.remove("db-disconnected");
    dbDiv.classList.add("db-connected");
};

function databaseDisconnected() {
    const dbDiv = document.getElementById("db");
    dbDiv.classList.remove("db-connected");
    dbDiv.classList.add("db-disconnected");
};

function loadParameters() {};

const runs = [];
