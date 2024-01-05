var CurrentSetName = ""
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
    } else {
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
    } else {
        isOwner = true;
        document.getElementById("input-bar").classList.remove("hidden")
    }
    document.body.classList.remove("hidden")
}

function createAuthUI() {
    //do not create the sign-in with google button if we already are signed-in
    if (API_getCurrentUser() == null) {
        API_createAuthUI(signInSuccess, false, "")
        document.getElementById("flashcard-container").classList.add("hidden")
    }
}

function signInSuccess(authResult) {
    localStorage.setItem("currentUser", JSON.stringify(authResult))

    document.getElementById("input-bar").classList.remove("hidden")

    window.location.reload()
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
    } else {
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
    while (p.firstChild) {
        p.removeChild(p.firstChild);
    }
    console.log(p.children.length)

    let s = questionAnswer
    for (var i = 0; i < s.length; i++) {
        addQuestionAnswerField(s[i], i)
    }
    if (s[s.length - 1][1] != "") {
        addQuestionAnswerField(["", ""], s.length, true)
    }     
}


function updateQuestionAnswer(childIndex, index, part, v) {
    if (index == questionAnswer.length) {
        questionAnswer[index] = ["", ""]
    }
    questionAnswer[index][part] = v.value

    let p = document.getElementById("input--question-container")
    if (index == questionAnswer.length - 1 && part == 1) {
        questionAnswer.push(["",""])
        addQuestionAnswerField(["", ""], questionAnswer.length - 1)
    }

    updateQuestion();
}

function removeQuestionAnswer(index) {
    if (index == questionAnswer.length - 1) {
        return
    }
    console.log("removing", index)
    var s = []
    for(var i = 0; i < index; i++) {
        s.push(questionAnswer[i])
    }

    for(var x = index + 1; x < questionAnswer.length; x++) {
        s.push(questionAnswer[x])
    }

    questionAnswer = s

    updateFields()
}

function addQuestionAnswerField(initial = ["", ""], updateIndex = -1, isLast = false) {
    let p = document.getElementById("input--question-container")
    for (var x = 0; x < 2; x++) {
        let i = document.createElement("input")
        i.type = "text"
        i.onchange = ""
        i.autocomplete = "off"
        i.value = initial[x]
        i.setAttribute("oninput", "updateQuestionAnswer(" + (p.children.length) + "," + updateIndex + "," + x + ", this)")
        i.style = "text-align: center"
        p.insertBefore(i, p.children[p.children.length])
    }
    let c = document.createElement("span")
    c.classList.add("material-symbols-outlined")
    c.innerText = "close"
    c.setAttribute("onclick", "removeQuestionAnswer(" + updateIndex + ")")
    p.insertBefore(c, p.children[p.children.length])

    let b = document.createElement("br")
    p.insertBefore(b, p.children[p.children.length])
}

function SaveSet() {
    if (questionAnswer.length < 4) {
        alert("Plase have at least 4 sets of questions/answers")
        return
    }
    if (document.getElementById("input--name-field").value.length < 2) {
        alert("Please have a set name at least 2 characters long")
        return
    }

    let data = []
    for (var i = 0; i < questionAnswer.length; i++) {
        if (questionAnswer[i][0].replace("~!", "") == "" || questionAnswer[i][1].replace("~!", "") == "") {
            continue
        }
        data[i] = questionAnswer[i][0].replace("~!", "") + "~!" + questionAnswer[i][1].replace("~!", "")
    }
    let setName = document.getElementById("input--name-field").value
    if (window.location.search == "") {
        API_writeData("sets", { "owner": API_getCurrentUser().uid, "name": setName, "questions": data }, null, (docRef) => {
            API_writeToOwner(API_getCurrentUser().uid, docRef.id, () => {
                window.location.search = "?" + docRef.id
            })
        })
        return
    }
    console.log(data)
    API_updateData("sets", { "name": setName, "questions": data }, window.location.search.substring(1), () => { window.location.reload() })
}

function LoadSet() {
    API_getData("sets", window.location.search.substring(1), (docRef) => {
        let qData = docRef.data()["questions"]

        for (var i = 0; i < qData.length; i++) {
            let s = qData[i].split("~!")
            questionAnswer[i] = [s[0], s[1]]
        }

        if (API_getCurrentUser() != null && docRef.data()["owner"] == API_getCurrentUser().uid) {
            isOwner = true
            document.getElementById("input-bar").classList.remove("hidden")
            document.getElementById("input--name-field").value = docRef.data()["name"]
        }

        CurrentSetName = docRef.data()["name"]

        document.getElementById("learn-btn").classList.remove("hidden")

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
    window.location.href = window.location.href.split("?")[0]
}