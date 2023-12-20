var questionAnswer = []
function swapMain(doFlip = true) {
    let p = document.getElementById("main--container")
    if (p.classList.contains("main--animation")) {
        return
    }

    let q = document.getElementById("main--side-question")
    let a = document.getElementById("main--side-answer")
    
    if (doFlip) {
        window.setTimeout(() => {
            q.parentElement.classList.toggle("hidden")
            a.parentElement.classList.toggle("hidden")
            resizeText(q, q.parentElement)
            resizeText(a, a.parentElement)
        }, 200)
        p.classList.add("main--animation");
        window.setTimeout(() => {
            p.classList.remove("main--animation");
        }, 600);
    }else{
        q.parentElement.classList.toggle("hidden")
        a.parentElement.classList.toggle("hidden")
        resizeText(q, q.parentElement)
        resizeText(a, a.parentElement)
    }
}
var isOwner = false;

var questionIndex = 0

function onDocLoad() {
    createAuthUI()
    updateQuestion()

    if (API_getCurrentUser() != null) {
        LoadSetBar()
    }

    if (window.location.search != "") {
        LoadSet()
    }else{
        isOwner = true;
        document.getElementById("input-bar").classList.remove("hidden")
    }
}

function createAuthUI() {
    //do not create the sign-in with google button if we already are signed-in
    if (API_getCurrentUser() == null) {
        API_createAuthUI(signInSuccess, false, "")
    }
}

function signInSuccess(authResult) {
    localStorage.setItem("currentUser", JSON.stringify(authResult))

    document.getElementById("input-bar").classList.remove("hidden")
}

function nextQuestion() {
    if (questionIndex >= questionAnswer.length - 1) {
        return
    }
    questionIndex++;

    updateQuestion()
}

function lastQuestion() {
    if (questionIndex == 0) {
        return
    }
    questionIndex--;

    updateQuestion()
}

function updateQuestion() {
    if (questionAnswer.length == 0) {
        return
    }
    let q = document.getElementById("main--side-question")
    let a = document.getElementById("main--side-answer")

    if (q.parentElement.classList.contains("hidden")) {
        swapMain()
        window.setTimeout(() => {
            q.innerText = questionAnswer[questionIndex][0]
            a.innerText = questionAnswer[questionIndex][1]
            resizeText(q, q.parentElement)
            resizeText(a, a.parentElement)
        }, 200)
    }else{
        q.innerText = questionAnswer[questionIndex][0]
        a.innerText = questionAnswer[questionIndex][1]
        resizeText(q, q.parentElement)
        resizeText(a, a.parentElement)
    }
}

function resizeText(element, parent) {
    let i = 7 // let's start with 12px
    let overflow = false
    const maxSize = 80 // very huge text size
  
    while (!overflow && i < maxSize) {
      element.style.fontSize = `${i}px`
      overflow = parent.scrollHeight > parent.clientHeight
      if (!overflow) i++
    }
  
    // revert to last state where no overflow happened:
    element.style.fontSize = `${i - 5}px`
}

function updateFields() {
    let p = document.getElementById("input--question-container")
    let s = questionAnswer
    for(var i = 0; i < s.length; i++) {
        for(var j = 0; j < 2; j++) {
            console.log("(" + i + ", " + j + ")", s[i][j], "; Length: ", p.children.length)
            if (p.children.length - 1 > i * 2 + j) {
                p.children[i * 2 + j].value = s[i][j]
            }else{
                addQuestionAnswerField(s[i], false)
                break
            }
        }

    }
}


function updateQuestionAnswer(index, part, v) {
    questionAnswer[index][part] = v.value

    updateQuestion();
}

function addQuestionAnswerField(initial = ["", ""], doUpdate=true) {
    let p = document.getElementById("input--question-container")
    for(var x= 0; x < 2; x++){
        let i = document.createElement("input")
        i.type="text"
        i.onchange=""
        i.autocomplete="off"
        i.value = initial[x]
        i.setAttribute("oninput", "updateQuestionAnswer(" + (Math.floor((p.children.length - 1) / 2)) + "," + x + ", this)")
        i.style = "text-align: center"
        if (doUpdate) {
            questionAnswer[Math.floor((p.children.length - 1) / 2)] = ["", ""]
        }
        p.insertBefore(i, p.children[p.children.length - 1])
    }
}

function SaveSet() {
    let data = []
    for(var i = 0; i < questionAnswer.length; i++) {
        if (questionAnswer[i][0].replace("~!", "") == "" || questionAnswer[i][1].replace("~!", "") == "") {
            continue
        }
        data[i] = questionAnswer[i][0].replace("~!", "") + "~!" + questionAnswer[i][1].replace("~!", "")
    }
    let setName = document.getElementById("input--name-field").value
    if (window.location.search == "") {
        API_writeData("sets", {"owner": API_getCurrentUser().uid, "name": setName, "questions": data}, null, (docRef) => {
            API_writeToOwner(API_getCurrentUser().uid, docRef.id, () => {
                window.location.search = "?" + docRef.id
            })
        })
        return
    }
    API_updateData("sets", {"name": setName, "questions": data}, window.location.search.substring(1))
}

function LoadSet() {
    API_getData("sets", window.location.search.substring(1), (docRef) => {
        let qData = docRef.data()["questions"]

        for(var i = 0; i < qData.length; i++) {
            let s = qData[i].split("~!")
            questionAnswer[i] = [s[0], s[1]]
        }

        if (API_getCurrentUser() != null && docRef.data()["owner"] == API_getCurrentUser().uid) {
            isOwner = true
            document.getElementById("input-bar").classList.remove("hidden")
            document.getElementById("input--name-field").value = docRef.data()["name"]
        }

        updateFields()
        updateQuestion()
    })
}

function toggleSetbar() {
    document.getElementById("set-bar").classList.toggle("collapsed")
}

function LoadSetBar() {
    API_loadUserData(API_getCurrentUser().uid, (userRef) => {
        userRef.data()["sets"].forEach((setId) => {
            API_loadSetData(setId, (setRef) => {
                let b = document.createElement("button")
                b.classList.add("myset--card")
                b.innerText = setRef.data()["name"]

                b.setAttribute("onclick", "ChangeToSet('" + setId + "')")

                let parent = document.getElementById("set-bar--myset-container")
                parent.appendChild(b)
            })
        })
    })
}

function ChangeToSet(setId) {
    window.location.search = setId
}

function NewSet() {
    window.location = window.location.origin
}