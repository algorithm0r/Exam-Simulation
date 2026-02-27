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
    dimension: { // pixels width/height for drawing students
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

    // run settings
    ambitionOptimal: false,
    confidenceOptimal: false,
    focusOptimal: false,
    enduranceOptimal: false,
    guessOptimal: false,
    examStratOptimal: false,

    // students
    numStudents: 10000,
    numTraits: 6,

    // database
    db: "domesticationDB",
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
    let output = gameEngine.invigilator.histograms.join('\n');
    let filename = "download.csv"
    // console.log(output);
    download(filename, output);
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

function loadParameters() {
    PARAMS.numStudents = parseInt(document.getElementById("num_students").value);
    PARAMS.ambitionOptimal = document.getElementById("ambitionOptimal").checked;
    PARAMS.confidenceOptimal = document.getElementById("confidenceOptimal").checked;
    PARAMS.focusOptimal = document.getElementById("focusOptimal").checked;
    PARAMS.enduranceOptimal = document.getElementById("enduranceOptimal").checked;
    PARAMS.guessOptimal = document.getElementById("guessOptimal").checked;
    PARAMS.examStratOptimal = document.getElementById("examStratOptimal").checked;
};

const runs = [];
