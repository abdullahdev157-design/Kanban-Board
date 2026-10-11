// Board ke columns, modal aur inputs ko ek martaba select karte hain.
const columns = document.querySelectorAll(".task-column");
const modal = document.querySelector(".modal");
const modalBackground = document.querySelector(".bg");
const modalToggle = document.querySelector(".toggle-modal");
const addTaskButton = document.querySelector(".add-task-btn");
const titleInput = document.querySelector("#input-title");
const descriptionInput = document.querySelector("#input-des");
let draggedTask = null;

// Task ka HTML aur uske drag/delete events ek hi jagah banate hain.
// textContent user ke text ko HTML samajhne ke bajaye seedha text dikhata hai.
function createTask(title, description) {
  const task = document.createElement("div");
  task.classList.add("task");
  task.draggable = true;

  const heading = document.createElement("h2");
  heading.textContent = title ?? "";

  const paragraph = document.createElement("p");
  paragraph.textContent = description ?? "";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    task.remove();
    updateCounts();
    saveTasks();
  });

  task.append(heading, paragraph, deleteButton);
  task.addEventListener("dragstart", () => {
    draggedTask = task;
  });
  task.addEventListener("dragend", () => {
    draggedTask = null;
  });

  return task;
}

// Har column ke task elements se poora board dobara banakar localStorage mein rakhte hain.
function saveTasks() {
  const data = {};

  columns.forEach((column) => {
    const tasks = column.querySelectorAll(".task");
    data[column.id] = Array.from(tasks, (task) => ({
      title: task.querySelector("h2").textContent,
      desc: task.querySelector("p").textContent,
    }));
  });

  localStorage.setItem("tasks", JSON.stringify(data));
}

// Storage ki JSON string ko object bana kar har task uske saved column mein load karte hain.
function loadTasks() {
  const savedData = localStorage.getItem("tasks");
  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);
    columns.forEach((column) => {
      const columnTasks = data[column.id];
      if (!Array.isArray(columnTasks)) return;

      columnTasks.forEach((taskData) => {
        column.appendChild(createTask(taskData.title, taskData.desc));
      });
    });
  } catch (error) {
    console.error("Saved tasks ka data parhne mein masla hua:", error);
  }
}

// Har column ka count us column mein maujood tasks ke mutabiq dikhate hain.
function updateCounts() {
  columns.forEach((column) => {
    const count = column.querySelector(".heading .right");
    count.textContent = column.querySelectorAll(".task").length;
  });
}

// Drop ko allow karne ke liye dragover rokna zaroori hai; drop par move, count aur save hota hai.
columns.forEach((column) => {
  column.addEventListener("dragenter", (event) => {
    event.preventDefault();
    column.classList.add("hover-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("hover-over");
  });

  column.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  column.addEventListener("drop", (event) => {
    event.preventDefault();
    column.classList.remove("hover-over");

    if (!draggedTask) return;
    column.appendChild(draggedTask);
    updateCounts();
    saveTasks();
  });
});

// Page khulte hi saved tasks dikhate aur unke baad counts set karte hain.
loadTasks();
updateCounts();

// Modal kholna/band karna task add karne ke workflow ka hissa hai.
modalToggle.addEventListener("click", () => {
  modal.classList.add("active");
});

modalBackground.addEventListener("click", () => {
  modal.classList.remove("active");
});

// Naya task todo mein add karke foran count aur storage dono update karte hain.
addTaskButton.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  document.querySelector("#todo").appendChild(createTask(title, description));
  titleInput.value = "";
  descriptionInput.value = "";
  modal.classList.remove("active");
  updateCounts();
  saveTasks();
});
