let box = document.getElementById("box");

let  h2 = document.createElement("h2");
h2.textContent = 'h2 tegini yaratdik';
box.appendChild(h2);
// box.remove();
function send() {
    console.log("Ma'lumot yuborildi...");
};

function changeTheme() {
    console.log("Change theme...");
    document.body.classList.toggle("dark");
};

let tasks = ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"];

function render() {
    let taskList = document.getElementById("taskList");
    let taskHtml = " ";
    tasks.forEach((task, index) => {
        taskHtml += `<li style="background-color: ${index % 2 != 0 ? 'lightgray' : 'white'}; color: black;">
            ${task}
            <button onclick="deleteTask(${index})">x</button>
        </li>`;
    });
    console.log(taskHtml);
    taskList.innerHTML = taskHtml;
}
render();

function addTask() {
    let task = document.getElementById('task');
    let message = document.getElementById('message');
    message.textContent = "";
    if (task.value.trim() === "") {
        return;
    }
    tasks.push(task.value);
    console.log(tasks);
    render();
    task.value = "";
}

function deleteTask(index) {
    tasks.splice(index, 1);
    render();
};
