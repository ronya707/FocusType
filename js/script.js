/* =================================
   TYPING TEST
================================= */

const passages = {
    daily: [
        "Every morning is a new opportunity to learn something different. Small steps can lead to great achievements. Never stop exploring the world around you.",
        "Reading books, learning languages and meeting new people can help us understand the world better. Curiosity makes every day more interesting.",
        "Good habits are built through small actions. Taking breaks, staying organized and practicing regularly can make a big difference."
    ],
    technology: [
        "Technology has changed the way people communicate, work and learn. Computers help us solve problems and discover new possibilities every day.",
        "The internet connects people from different parts of the world. Information can be shared quickly, making communication easier than ever.",
        "Artificial intelligence is changing many industries. It can help people analyze information, recognize patterns and complete useful tasks."
    ],
    programming: [
        "Programming is the process of giving instructions to a computer. Developers use different programming languages to build websites, applications and software.",
        "A good programmer does not simply write code. They learn to solve problems, understand errors and improve their solutions step by step.",
        "JavaScript makes websites interactive. It can respond to user actions, update page content and create useful features for web applications."
    ],
    motivation: [
        "Success takes time, patience and dedication. Every mistake is a chance to learn. Keep practicing, stay curious and believe in your progress.",
        "You do not need to be perfect to make progress. Focus on what you can improve today and celebrate every small achievement.",
        "Learning something new can feel difficult at first. With patience and regular practice, challenging tasks become easier over time."
    ]
};

const typingInput = document.getElementById("typingInput");
const sampleText = document.getElementById("sampleText");

let selectedText = "";
let typingTime = 60;
let initialTypingTime = 60;
let typingInterval = null;
let typingStarted = false;
let typingStartTimestamp = null;

function choosePassage() {
    const category = document.getElementById("textSelect").value;
    const options = passages[category];
    selectedText = options[Math.floor(Math.random() * options.length)];
    displayText();
}

function displayText() {
    sampleText.innerHTML = "";

    selectedText.split("").forEach(function(character) {
        const span = document.createElement("span");
        span.textContent = character;
        sampleText.appendChild(span);
    });
}

function updateTypingDisplay() {
    const typed = typingInput.value;
    const characters = sampleText.querySelectorAll("span");

    characters.forEach(function(span, index) {
        span.className = "";

        if (index < typed.length) {
            span.classList.add(
                typed[index] === selectedText[index]
                    ? "correct"
                    : "incorrect"
            );
        }

        if (index === typed.length && typingStarted) {
            span.classList.add("current");
        }
    });

    updateTypingStats();
}

function getTypingStats() {
    const typed = typingInput.value;
    let correct = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === selectedText[i]) {
            correct++;
        }
    }

    const accuracy = typed.length === 0
        ? 100
        : Math.round((correct / typed.length) * 100);

    let elapsedSeconds = 0;

    if (typingStarted && typingStartTimestamp !== null) {
        elapsedSeconds = (Date.now() - typingStartTimestamp) / 1000;
    } else {
        elapsedSeconds = initialTypingTime - typingTime;
    }

    const wpm = elapsedSeconds > 0
        ? Math.round((correct / 5) / (elapsedSeconds / 60))
        : 0;

    return { accuracy, wpm };
}

function updateTypingStats() {
    const stats = getTypingStats();

    document.getElementById("wpm").textContent = stats.wpm;
    document.getElementById("accuracy").textContent =
        stats.accuracy + "%";
}

function startTyping() {
    if (typingStarted) return;

    typingStarted = true;
    typingStartTimestamp = Date.now();

    typingInput.disabled = false;
    typingInput.focus();

    updateTypingDisplay();

    typingInterval = setInterval(function() {
        const elapsed = Math.floor(
            (Date.now() - typingStartTimestamp) / 1000
        );

        typingTime = Math.max(0, initialTypingTime - elapsed);

        document.getElementById("typingTime").textContent = typingTime;
        updateTypingStats();

        if (
            typingTime <= 0 ||
            typingInput.value.length >= selectedText.length
        ) {
            finishTyping();
        }
    }, 250);
}

function finishTyping() {
    if (!typingStarted) return;

    clearInterval(typingInterval);
    typingInterval = null;

    const stats = getTypingStats();

    typingStarted = false;
    typingInput.disabled = true;

    updateTypingDisplay();

    document.getElementById("typingResult").textContent =
        "Test completed! " + stats.wpm + " WPM · " +
        stats.accuracy + "% accuracy";

    saveTypingResult(stats);
}

function resetTyping() {
    clearInterval(typingInterval);
    typingInterval = null;

    typingStarted = false;
    typingStartTimestamp = null;

    initialTypingTime = Number(
        document.getElementById("durationSelect").value
    );

    typingTime = initialTypingTime;

    typingInput.value = "";
    typingInput.disabled = true;

    document.getElementById("typingTime").textContent = typingTime;
    document.getElementById("wpm").textContent = "0";
    document.getElementById("accuracy").textContent = "100%";
    document.getElementById("typingResult").textContent = "";

    displayText();
}

function saveTypingResult(stats) {
    const results = JSON.parse(
        localStorage.getItem("typingResults") || "[]"
    );

    results.push({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        date: new Date().toISOString()
    });

    localStorage.setItem("typingResults", JSON.stringify(results));

    const bestWpm = Math.max(
        Number(localStorage.getItem("bestWpm") || 0),
        stats.wpm
    );

    localStorage.setItem("bestWpm", bestWpm);

    updateStats();
}

document.getElementById("startTyping").addEventListener(
    "click", startTyping
);

document.getElementById("resetTyping").addEventListener(
    "click", resetTyping
);

typingInput.addEventListener("input", function() {
    if (!typingStarted) return;

    updateTypingDisplay();

    if (typingInput.value.length >= selectedText.length) {
        finishTyping();
    }
});

document.getElementById("textSelect").addEventListener(
    "change", function() {
        choosePassage();
        resetTyping();
    }
);

document.getElementById("durationSelect").addEventListener(
    "change", resetTyping
);

choosePassage();
resetTyping();


/* =================================
   FOCUS TIMER
================================= */

let focusMinutes = 25;
let breakMinutes = 5;
let currentMode = "focus";
let remainingTime = focusMinutes * 60;
let timerInterval = null;
let timerEndTimestamp = null;

let sessions = Number(localStorage.getItem("sessions") || 0);
let totalMinutes = Number(localStorage.getItem("totalMinutes") || 0);

function getModeMinutes() {
    return currentMode === "focus" ? focusMinutes : breakMinutes;
}

function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    document.getElementById("timer").textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    if (timerInterval) return;

    if (remainingTime <= 0) {
        remainingTime = getModeMinutes() * 60;
    }

    timerEndTimestamp = Date.now() + remainingTime * 1000;

    timerInterval = setInterval(function() {
        remainingTime = Math.max(
            0,
            Math.ceil((timerEndTimestamp - Date.now()) / 1000)
        );

        updateTimer();

        if (remainingTime <= 0) {
            completeTimer();
        }
    }, 250);
}

function pauseTimer() {
    if (!timerInterval) return;
typingTime=Math.max(
    0,
    initialTypingTime-
    Math.floor((Date.now()-
typingStartTimestamp)/1000)
);
    clearInterval(timerInterval);
    timerInterval = null;
    timerEndTimestamp = null;
}

function resetTimer() {
    pauseTimer();

    remainingTime = getModeMinutes() * 60;
    document.getElementById("timerMessage").textContent = "";

    updateTimer();
}

function completeTimer() {
    pauseTimer();

    if (currentMode === "focus") {
        sessions++;
        totalMinutes += focusMinutes;

        localStorage.setItem("sessions", sessions);
        localStorage.setItem("totalMinutes", totalMinutes);

        const today = getDateKey(new Date());
        const weeklyData = getWeeklyData();

        weeklyData[today] = (weeklyData[today] || 0) + focusMinutes;

        localStorage.setItem("weeklyData", JSON.stringify(weeklyData));

        document.getElementById("timerMessage").textContent =
            "Great job! Your focus session is complete. ♡";
    } else {
        document.getElementById("timerMessage").textContent =
            "Your break is over. Ready to focus again?";
    }

    updateStats();
    alert(currentMode === "focus"
        ? "Focus session completed! Great work!"
        : "Break time is over!");
}

function switchMode(mode) {
    pauseTimer();

    currentMode = mode;

    document.querySelectorAll(".mode").forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );
    });

    document.getElementById("timerLabel").textContent =
        mode === "focus" ? "TIME TO FOCUS" : "TAKE A BREAK";

    document.getElementById("timerMessage").textContent = "";

    remainingTime = getModeMinutes() * 60;
    updateTimer();
}

document.querySelectorAll(".mode").forEach(function(button) {
    button.addEventListener("click", function() {
        switchMode(this.dataset.mode);
    });
});

document.getElementById("startTimer").addEventListener(
    "click", startTimer
);

document.getElementById("pauseTimer").addEventListener(
    "click", pauseTimer
);

document.getElementById("resetTimer").addEventListener(
    "click", resetTimer
);

document.getElementById("applyTime").addEventListener(
    "click", function() {
        const newFocus = Number(
            document.getElementById("focusMinutes").value
        );

        const newBreak = Number(
            document.getElementById("breakMinutes").value
        );

        if (
            !Number.isInteger(newFocus) ||
            !Number.isInteger(newBreak) ||
            newFocus < 1 || newFocus > 180 ||
            newBreak < 1 || newBreak > 60
        ) {
            alert("Please enter valid timer values.");
            return;
        }

        focusMinutes = newFocus;
        breakMinutes = newBreak;

        resetTimer();

        document.getElementById("timerMessage").textContent =
            "Your timer settings have been updated!";
    }
);


/* =================================
   STATISTICS AND WEEKLY CHART
================================= */

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getWeeklyData() {
    return JSON.parse(localStorage.getItem("weeklyData") || "{}");
}

function updateWeeklyChart() {
    const chart = document.getElementById("weeklyChart");
    const weeklyData = getWeeklyData();

    chart.innerHTML = "";

    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        days.push({
            key: getDateKey(date),
            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            })
        });
    }

    const values = days.map(day => weeklyData[day.key] || 0);
    const maxValue = Math.max(...values, 1);

    days.forEach(function(day, index) {
        const minutes = values[index];
        const height = minutes === 0
            ? 3
            : Math.max(5, (minutes / maxValue) * 100);

        const dayElement = document.createElement("div");
        dayElement.className = "chart-day";

        const barArea = document.createElement("div");
        barArea.className = "chart-bar-area";

        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.height = height + "%";
        bar.title = minutes + " minutes";

        const value = document.createElement("strong");
        value.textContent = minutes + "m";

        const label = document.createElement("span");
        label.textContent = day.label;

        barArea.appendChild(bar);
        dayElement.appendChild(value);
        dayElement.appendChild(barArea);
        dayElement.appendChild(label);

        chart.appendChild(dayElement);
    });
}

function updateStats() {
    const results = JSON.parse(
        localStorage.getItem("typingResults") || "[]"
    );

    const bestWpm = Number(localStorage.getItem("bestWpm") || 0);

    const averageAccuracy = results.length
        ? Math.round(
            results.reduce((sum, result) =>
                sum + result.accuracy, 0
            ) / results.length
        )
        : 0;

    document.getElementById("bestWpm").textContent = bestWpm;
    document.getElementById("averageAccuracy").textContent =
        averageAccuracy + "%";

    document.getElementById("totalMinutes").textContent = totalMinutes;
    document.getElementById("totalSessions").textContent = sessions;
    document.getElementById("sessions").textContent = sessions;

    updateWeeklyChart();
}


/* =================================
   INITIALIZE APP
================================= */

updateTimer();
updateStats();