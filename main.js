const taskList = document.querySelector("#task-list");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");

function escapeHTML(html) {
    const div = document.createElement("div");
    div.innerText = html;
    return div.innerHTML;
}
function isDuplicateTask(newTitle, excludeIndex = -1) {
    const isDuplicate = tasks.some(
        (task, index) =>
            task.title.toLowerCase() === newTitle.toLowerCase() &&
            excludeIndex !== index
    );
    return isDuplicate;
}

let tasks = [];

async function getData() {
    const url = "http://localhost:3000/tasks";
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        const result = await response.json();
        tasks = result;
        renderTasks();
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
    }
}

function handleTaskActions(e) {
    const taskItem = e.target.closest(".task-item");

    const taskIndex = +taskItem.dataset.index;
    const task = tasks[taskIndex];

    if (e.target.closest(".edit")) {
        let newTitle = prompt("Enter the new task title:", task.title);

        if (newTitle === null) return;
        newTitle = newTitle.trim();

        if (!newTitle) {
            alert("Task title cannot be empty!");
            return;
        }

        if (isDuplicateTask(newTitle, taskIndex)) {
            alert(
                "Task with this title already exists! Please use a different task title!"
            );
            return;
        }

        fetch(`http://localhost:3000/tasks/${task.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Response status: ${res.status}`);
                return res.json();
            })
            .then(() => {
                getData(); 
            })
            .catch((err) => {
                console.error("Error updating task:", err.message);
                alert("Failed to update task. Please try again.");
            });
        return;
    }


    if (e.target.closest(".done")) {
        task.completed = !task.completed;
        renderTasks();
        return;
    }

    if (e.target.closest(".delete")) {
        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
            fetch(`http://localhost:3000/tasks/${task.id}`, {
                method: "DELETE"
            })
                .then((res) => {
                    if (!res.ok) throw new Error(`Response status: ${res.status}`);
                    return res.json();
                })
                .then(() => {
                    getData(); 
                })
                .catch((err) => {
                    console.error("Error deleting task:", err.message);
                    alert("Failed to delete task. Please try again.");
                });
        }
    }
}


async function addTask(e) {
    e.preventDefault();
    try {
        const value = todoInput.value.trim();
        if (!value) return alert("Please write something!");

        if (isDuplicateTask(value)) {
            alert(
                "Task with this title already exists! Please use a different title."
            );
            return;
        }
        const newTask = {
            title: value,
            completed: false
        };

        const res = await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });

        if (!res.ok) throw new Error(`Response status: ${res.status}`);
        todoInput.value = ""; // Xóa input sau khi thêm thành công
        await getData(); 
    } catch (err) {
        console.error("Error adding task:", err.message);
    }
}

function renderTasks() {
    
    if (!tasks.length) {
        taskList.innerHTML =
            '<li class="empty-message">No tasks available.</li>';
        return;
    }

    const html = tasks
        .map((task, index) => {
            return `
    <li class="task-item ${task.completed ? "completed" : ""}" data-index="${index}">
        <span class="task-title">${escapeHTML(task.title)}</span>
        <div class="task-action">
            <button class="task-btn edit">Edit</button>
            <button class="task-btn done">${task.completed ? "Mark as undone" : "Mark as done"
                }</button>
            <button class="task-btn delete">Delete</button>
        </div>
    </li>`}).join("");

    taskList.innerHTML = html;
}

todoForm.addEventListener("submit", addTask);

taskList.addEventListener("click", handleTaskActions);

getData();


