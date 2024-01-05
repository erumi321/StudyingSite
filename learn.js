var Learn_StachedQuestions = []
var Learn_DoStachedQuestions = false

var Learn_CurrentID = 0;

let enter_event = null

document.addEventListener("keydown", function(event) {
    if (event.key == "Enter" && enter_event != null) {
        setTimeout(() => {
            enter_event()
            
        }, 30);
    }
})

function Learn_Start() {
    let s = CurrentSetName + encodeURIComponent("~/../~")  + window.location.search.substring(1) + encodeURIComponent("~/../~")
    for(var x = 0; x < questionAnswer.length; x++) {
        s = s + encodeURIComponent(questionAnswer[x][0].replace(";;;", "")) + encodeURIComponent("~!") + encodeURIComponent(questionAnswer[x][1].replace(";;;", ""))
        if (x != questionAnswer.length - 1) {
            s = s + encodeURIComponent(";;;")
        }
    }
    window.location.href = "learn.html?" + s
}

function Learn_OnLoad() {
    let i = decodeURIComponent(window.location.search)
    let s = i.split("~/../~")[2].split(";;;")
    
    for(var x = 0; x < s.length; x++) {
        let n = []
        n[0] = s[x].split("~!")[0]
        n[1] = s[x].split("~!")[1]
        questionAnswer[x] = [n[0], n[1]]
    }
    document.getElementById("learn-title").innerText = "Learn: " + i.split("~/../~")[0]
    Learn_BuildMC()
    
}

function Learn_End() {
    let i = decodeURIComponent(window.location.search)
    let s = i.split("~/../~")[1]
    window.location.href = "index.html?" + s
}

function Learn_BuildMC() {
    document.getElementById("learn--type-container").classList.add("hidden")
    document.getElementById("learn--mc-container").classList.remove("hidden")

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

    Learn_SetupNextButton()

    // Learn_BuildMC()
}

function Learn_FalseMCAnswer(correctIndex, clickedIndex) {
    let btns = document.getElementsByClassName("learn--mc-btn") 
    btns[correctIndex].classList.add("revealed")
    btns[clickedIndex].classList.add("revealed")

    document.getElementById("learn--next-txt").innerText = "Incorrect!"
    document.getElementById("learn--next-container").classList.remove("collapsed")

    Learn_SetupNextButton()

}

function Learn_NextQuestion() {
    enter_event = null
    
    document.getElementById("learn--next-container").classList.add("collapsed")
    document.getElementById("learn--type-input").value = ""
    document.getElementById("learn--type-input").classList.remove("correct")
    document.getElementById("learn--type-input").classList.remove("incorrect")
    let btns = document.getElementsByClassName("learn--mc-btn") 
    for(var x = 0; x < btns.length; x++) {
        btns[x].classList.remove("learn--false-btn")
        btns[x].classList.remove("learn--true-btn")
        btns[x].classList.remove("revealed")
    }
    
    if (Learn_DoStachedQuestions == false) {
        Learn_StachedQuestions.push(Learn_CurrentID)
    }
    if (Learn_CurrentID >= questionAnswer.length - 1) {
        if (Learn_StachedQuestions.length == 0) {
            Learn_End()
        }else{
            Learn_DoStachedQuestions = true
        }
    }

    if (Learn_StachedQuestions.length >= 4) {
        Learn_DoStachedQuestions = true
    }

    if (Learn_DoStachedQuestions == true) {
        if (Learn_StachedQuestions.length > 0) {
            Learn_CurrentID = Learn_StachedQuestions.shift()
            Learn_BuildType()
            return
        }else{
            Learn_DoStachedQuestions = false
        }
        
    }

    Learn_CurrentID++
    Learn_BuildMC()
}

function Learn_SetupNextButton() {
    document.getElementById("learn--next-btn").innerText = "Next"

    if (Learn_CurrentID == questionAnswer.length - 1 && Learn_StachedQuestions.length == 0) {
        document.getElementById("learn--next-btn").innerText = "Finish"
    }

    enter_event = Learn_NextQuestion
}

function Learn_BuildType() {
    document.getElementById("learn--type-container").classList.remove("hidden")
    document.getElementById("learn--mc-container").classList.add("hidden")

    let currentQuestion = questionAnswer[Learn_CurrentID][0]
    document.getElementById("learn--main--title").innerText = currentQuestion
    enter_event = Learn_SubmitType
    document.getElementById("learn--type-input").focus()
}

function Learn_SubmitType() {
    enter_event = null
    
    let currentAnswer = questionAnswer[Learn_CurrentID][1]
    let response = document.getElementById("learn--type-input").value

    if (response == currentAnswer) {
        document.getElementById("learn--next-txt").innerText = "Correct!"
        document.getElementById("learn--type-input").classList.add("correct")
    }else{
        document.getElementById("learn--next-txt").innerText = "Incorrect!"
        document.getElementById("learn--type-input").classList.add("incorrect")
    }
    document.getElementById("learn--next-container").classList.remove("collapsed")

    Learn_SetupNextButton()
}

function getRandomIndex(list) {
    let i = getRandomInt(0, list.length)
    return i
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  