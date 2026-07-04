const clock = document.getElementById("clock");
const date = document.getElementById("date");
const greeting = document.getElementById("greeting");

const themeBtn = document.getElementById("themeBtn");

const timerDisplay = document.getElementById("timer");
const timerMinutes = document.getElementById("timerMinutes");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");


let username = localStorage.getItem("username") || "";


function updateClock() {

    const now = new Date();

    clock.textContent = now.toLocaleTimeString("en-US", {
        hour12: false
    });

    date.textContent = now.toLocaleDateString("en-US", {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    });

    updateGreeting(now.getHours());

}

setInterval(updateClock, 1000);

updateClock();


function updateGreeting(hour) {

    let text = "";

    if (hour >= 5 && hour < 12) {

        text = "Good Morning";

    }

    else if (hour >= 12 && hour < 17) {

        text = "Good Afternoon";

    }

    else if (hour >= 17 && hour < 21) {

        text = "Good Evening";

    }

    else {

        text = "Good Night";

    }

    if (username !== "") {

        greeting.textContent = `${text}, ${username}`;

    }

    else {

        greeting.textContent = text;

    }

}


function setUsername(name) {

    username = name.trim();

    localStorage.setItem("username", username);

    updateClock();

}


window.addEventListener("load", () => {

    if (username === "") {

        setTimeout(() => {

            const name = prompt("Welcome!\nWhat is your name?");

            if (name && name.trim() !== "") {

                setUsername(name);

            }

        }, 500);

    }

});


const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀";

}

else {

    themeBtn.textContent = "🌙";

}



themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        localStorage.setItem("theme", "dark");

        themeBtn.textContent = "☀";

    }

    else {

        localStorage.setItem("theme", "light");

        themeBtn.textContent = "🌙";

    }

});


let timerInterval = null;

let totalSeconds = 25 * 60;

let isRunning = false;

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const remain = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;

}


function updateTimerDisplay() {

    timerDisplay.textContent = formatTime(totalSeconds);

}

updateTimerDisplay();


function startTimer() {

    if (isRunning) return;

    isRunning = true;

    timerInterval = setInterval(() => {

        totalSeconds--;

        updateTimerDisplay();

        saveTimer();

        if (totalSeconds <= 0) {

            clearInterval(timerInterval);

            isRunning = false;

            alert("Pomodoro Finished! 🎉");

            totalSeconds = Number(timerMinutes.value) * 60;

            updateTimerDisplay();

            saveTimer();

        }

    }, 1000);

}

function stopTimer() {

    clearInterval(timerInterval);

    isRunning = false;

}


function resetTimer() {

    stopTimer();

    totalSeconds = Number(timerMinutes.value) * 60;

    updateTimerDisplay();

    saveTimer();

}


timerMinutes.addEventListener("change", () => {

    resetTimer();

});


startBtn.addEventListener("click", startTimer);

stopBtn.addEventListener("click", stopTimer);

resetBtn.addEventListener("click", resetTimer);

function saveTimer() {

    localStorage.setItem("timerSeconds", totalSeconds);

    localStorage.setItem("timerMinutes", timerMinutes.value);

}


function loadTimer() {

    const second = localStorage.getItem("timerSeconds");

    const minute = localStorage.getItem("timerMinutes");

    if (minute) {

        timerMinutes.value = minute;

    }

    if (second) {

        totalSeconds = Number(second);

    }

    updateTimerDisplay();

}

loadTimer();


function resetEveryMidnight() {

    const now = new Date();

    if (

        now.getHours() === 0 &&

        now.getMinutes() === 0 &&

        now.getSeconds() === 0

    ) {

        resetTimer();

    }

}

setInterval(resetEveryMidnight, 1000);


const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const taskTemplate = document.getElementById("taskTemplate");


let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


function updateTaskCounter() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    taskCounter.textContent =
        `${completed}/${total} Completed`;

}


function sortTasks() {

    tasks.sort((a, b) => {

        if (a.completed === b.completed)
            return 0;

        return a.completed ? 1 : -1;

    });

}


function renderTasks() {

    taskList.innerHTML = "";

    sortTasks();

    tasks.forEach((task, index) => {

        const clone =
            taskTemplate.content.cloneNode(true);

        const item =
            clone.querySelector(".task-item");

        const checkbox =
            clone.querySelector(".task-check");

        const text =
            clone.querySelector(".task-text");

        const editBtn =
            clone.querySelector(".edit-btn");

        const deleteBtn =
            clone.querySelector(".delete-btn");

        text.textContent = task.text;

        checkbox.checked = task.completed;

        if (task.completed) {

            text.classList.add("completed");

        }

        checkbox.addEventListener("change", () => {

            task.completed = checkbox.checked;

            saveTasks();

            renderTasks();

        });


        editBtn.addEventListener("click", () => {

            text.contentEditable = true;

            text.focus();

        });


        text.addEventListener("blur", () => {

            text.contentEditable = false;

            const value =
                text.textContent.trim();

            if (value === "") {

                text.textContent = task.text;

                return;

            }

            // Prevent duplicate

            const duplicate =
                tasks.some((t, i) =>

                    i !== index &&

                    t.text.toLowerCase() ===
                    value.toLowerCase()

                );

            if (duplicate) {

                alert("Task already exists!");

                text.textContent = task.text;

                return;

            }

            task.text = value;

            saveTasks();

        });

        // Press Enter finish edit

        text.addEventListener("keydown", e => {

            if (e.key === "Enter") {

                e.preventDefault();

                text.blur();

            }

        });

        // ==========================
        // DELETE
        // ==========================

        deleteBtn.addEventListener("click", () => {

            if (!confirm("Delete this task?"))
                return;

            tasks.splice(index, 1);

            saveTasks();

            renderTasks();

        });

        taskList.appendChild(item);

    });

    updateTaskCounter();

}


function addTask() {

    const value =
        taskInput.value.trim();

    if (value === "")
        return;

    // Prevent duplicate

    const duplicate =
        tasks.some(task =>

            task.text.toLowerCase() ===
            value.toLowerCase()

        );

    if (duplicate) {

        alert("Task already exists!");

        return;

    }

    tasks.push({

        text: value,

        completed: false,

        createdAt: Date.now()

    });

    taskInput.value = "";

    saveTasks();

    renderTasks();

}


addTaskBtn.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keypress",
    e => {

        if (e.key === "Enter") {

            addTask();

        }

    }
);

renderTasks();


const linkName = document.getElementById("linkName");
const linkURL = document.getElementById("linkURL");
const addLinkBtn = document.getElementById("addLinkBtn");
const linksContainer = document.getElementById("linksContainer");
const linkTemplate = document.getElementById("linkTemplate");


let links = JSON.parse(localStorage.getItem("quickLinks")) || [
    {
        name: "Google",
        url: "https://www.google.com"
    },
    {
        name: "YouTube",
        url: "https://www.youtube.com"
    },
    {
        name: "GitHub",
        url: "https://github.com"
    }
];


function saveLinks() {

    localStorage.setItem(
        "quickLinks",
        JSON.stringify(links)
    );

}

function validURL(url) {

    try {

        new URL(url);

        return true;

    }

    catch {

        return false;

    }

}


function renderLinks() {

    linksContainer.innerHTML = "";

    links.forEach((link, index) => {

        const clone =
            linkTemplate.content.cloneNode(true);

        const button =
            clone.querySelector(".link-button");

        const remove =
            clone.querySelector(".remove-link");

        button.textContent = link.name;

        button.href = link.url;

        button.target = "_blank";

        remove.addEventListener("click", () => {

            if (!confirm("Delete this link?"))
                return;

            links.splice(index, 1);

            saveLinks();

            renderLinks();

        });

        linksContainer.appendChild(clone);

    });

}


function addLink() {

    const name = linkName.value.trim();

    let url = linkURL.value.trim();

    if (name === "" || url === "") {

        alert("Please complete the form.");

        return;

    }

    // Auto add https://

    if (
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {

        url = "https://" + url;

    }

    if (!validURL(url)) {

        alert("Invalid URL.");

        return;

    }

    // Prevent duplicate

    const duplicate =
        links.some(link =>
            link.url.toLowerCase() ===
            url.toLowerCase()
        );

    if (duplicate) {

        alert("Link already exists.");

        return;

    }

    links.push({

        name: name,

        url: url

    });

    saveLinks();

    renderLinks();

    linkName.value = "";

    linkURL.value = "";

}


addLinkBtn.addEventListener(
    "click",
    addLink
);

linkURL.addEventListener(
    "keypress",
    e => {

        if (e.key === "Enter") {

            addLink();

        }

    }
);

linkName.addEventListener(
    "keypress",
    e => {

        if (e.key === "Enter") {

            addLink();

        }

    }
);


renderLinks();

saveLinks();


window.addEventListener("DOMContentLoaded", () => {

    updateClock();

    updateGreeting(new Date().getHours());

    updateTimerDisplay();

    renderTasks();

    renderLinks();

});


document.addEventListener("keydown", e => {

    if (e.ctrlKey && e.key.toLowerCase() === "d") {

        e.preventDefault();

        themeBtn.click();

    }

});


document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        stopTimer();

    }

});