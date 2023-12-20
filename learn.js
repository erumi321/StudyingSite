var Learn_CurrentID = 0;

function Learn_Start() {
    window.location.href = "learn.html?" + window.location.search.substring(1)
}

function Learn_OnLoad() {
    API_getData("sets", window.location.search.substring(1), (docRef) => {
        let qData = docRef.data()["questions"]

        for(var i = 0; i < qData.length; i++) {
            let s = qData[i].split("~!")
            questionAnswer[i] = [s[0], s[1]]
        }
        document.getElementById("learn-title").innerText = "Learn: " + docRef.data()["name"]
        Learn_BuildMC()
    })
}

function Learn_End() {
    window.location.href = "index.html?" + window.location.search.substring(1)
}

function Learn_BuildMC() {
    let currentQuestion = questionAnswer[Learn_CurrentID][0]
    let currentAnswer = questionAnswer[Learn_CurrentID][1]
    document.getElementById("learn--main--title").innerText = currentQuestion
    let falseAnswers = []
    let validFalse = []
    for(var x = 0; x < questionAnswer.length; x++) {
        if (x == Learn_CurrentID) {
            continue
        }
        validFalse.push(x)
    }
    for (var x = 0; x < 3; x++) {
        let t = getRandomIndex(validFalse)
        let i = validFalse[t]
        validFalse.splice(t, 1)   
        falseAnswers[x] = questionAnswer[i][1]
    }

    console.log("false: ", falseAnswers)

    let remainingIndex = [0, 1, 2, 3]
    let remainingAnswerIndex = [0,1,2]
    let correctIndex = 0

    let i = getRandomIndex(remainingIndex)
    correctIndex = remainingIndex[i]
    remainingIndex.splice(i, 1)
    
    let btns = document.getElementsByClassName("learn--mc-btn") 
    
    btns[correctIndex].classList.add("learn--true-btn")
    btns[correctIndex].setAttribute("onclick", "Learn_CorrectMCAnswer(" + correctIndex + ")")
    btns[correctIndex].innerText = currentAnswer
    
    for(var x = 0; x < 3; x++) {
        let currentIndex = 0
        let answerIndex = 0

        i = getRandomIndex(remainingIndex)
        currentIndex = remainingIndex[i]
        remainingIndex.splice(i, 1)

        i = getRandomIndex(remainingAnswerIndex)
        answerIndex = remainingAnswerIndex[i]
        remainingAnswerIndex.splice(i, 1)

        btns[currentIndex].innerText = falseAnswers[answerIndex]
        btns[currentIndex].classList.add("learn--false-btn")
        btns[currentIndex].setAttribute("onclick", "Learn_FalseMCAnswer(" + correctIndex +", " + currentIndex + ")")
    }
}

function Learn_CorrectMCAnswer(correctIndex) {
    let btns = document.getElementsByClassName("learn--mc-btn") 
    btns[correctIndex].classList.add("revealed")

    document.getElementById("learn--next-txt").innerText = "Correct!"
    document.getElementById("learn--next-container").classList.remove("collapsed")

    if (Learn_CurrentID == questionAnswer.length - 1) {
        document.getElementById("learn--next-btn").innerText = "Finish"
    }else{
        document.getElementById("learn--next-btn").innerText = "Next"
    }

    // Learn_BuildMC()
}

function Learn_FalseMCAnswer(correctIndex, clickedIndex) {
    let btns = document.getElementsByClassName("learn--mc-btn") 
    btns[correctIndex].classList.add("revealed")
    btns[clickedIndex].classList.add("revealed")

    document.getElementById("learn--next-txt").innerText = "Incorrect!"
    document.getElementById("learn--next-container").classList.remove("collapsed")

    if (Learn_CurrentID == questionAnswer.length - 1) {
        document.getElementById("learn--next-btn").innerText = "Finish"
    }else{
        document.getElementById("learn--next-btn").innerText = "Next"
    }

}

function Learn_NextQuestion() {
    Learn_CurrentID++;

    if (Learn_CurrentID >= questionAnswer.length) {
        Learn_End()
    }
    
    document.getElementById("learn--next-container").classList.add("collapsed")
    let btns = document.getElementsByClassName("learn--mc-btn") 
    for(var x = 0; x < btns.length; x++) {
        btns[x].classList.remove("learn--false-btn")
        btns[x].classList.remove("learn--true-btn")
        btns[x].classList.remove("revealed")
    }
    
    Learn_BuildMC()
}

function getRandomIndex(list) {
    let i = getRandomInt(0, list.length)
    return i
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  