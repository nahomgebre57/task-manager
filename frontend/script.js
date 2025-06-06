
    const form = document.getElementById('task-form');
    const input = document.getElementById('task-input');
    const descInput = document.getElementById('task-desc-input');
    const dateInput = document.getElementById('task-date-input');
    const timeInput = document.getElementById('task-time-input');
    const repeatInput = document.getElementById('task-repeat-input');
    const list = document.getElementById('task-list');

    // Analytics elements
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');
    const dailyTasksEl = document.getElementById('daily-tasks');
    const weeklyTasksEl = document.getElementById('weekly-tasks');

    // Toggle task list
    const toggleBtn = document.getElementById('toggle-task-list-btn');
    let taskListVisible = true;
    toggleBtn.onclick = function() {
        taskListVisible = !taskListVisible;
        list.style.display = taskListVisible ? '' : 'none';
        toggleBtn.textContent = taskListVisible ? 'Hide Task List' : 'Unhide Task List';
    };

    let editMode = false;
    let editLi = null;

    function formatTimeStr(timeStr) {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDateStr(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    }

    function updateAnalytics() {
        const lis = Array.from(list.children);
        let total = lis.length;
        let completed = 0;
        let daily = 0;
        let weekly = 0;
        lis.forEach(li => {
            if (li.classList.contains('completed')) completed++;
            const repeat = li._taskData?.repeat;
            if (repeat === "daily") daily++;
            if (repeat === "weekly") weekly++;
        });
        totalTasksEl.textContent = total;
        completedTasksEl.textContent = completed;
        pendingTasksEl.textContent = total - completed;
        dailyTasksEl.textContent = daily;
        weeklyTasksEl.textContent = weekly;

        // Show/hide toggle button based on task count
        toggleBtn.style.display = total > 0 ? '' : 'none';
    }

    function createTaskElement(taskText, taskDesc, completed = false, date = null, time = null, repeat = "none") {
        const li = document.createElement('li');
        if (completed) li.classList.add('completed');

        const span = document.createElement('span');
        span.textContent = taskText;

        // Add description element
        const descSpan = document.createElement('span');
        descSpan.className = 'task-time';
        descSpan.style.fontStyle = 'italic';
        descSpan.style.marginLeft = '10px';
        descSpan.textContent = taskDesc ? `(${taskDesc})` : '';

        // Add date element
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-time';
        dateSpan.textContent = date ? formatDateStr(date) : '';

        // Add time element
        const timeSpan = document.createElement('span');
        timeSpan.className = 'task-time';
        timeSpan.textContent = time ? formatTimeStr(time) : '';

        // Add repeat info
        const repeatSpan = document.createElement('span');
        repeatSpan.className = 'task-time';
        repeatSpan.textContent = repeat === "daily" ? "Repeats daily" : (repeat === "weekly" ? "Repeats weekly" : "");

        const actions = document.createElement('div');
        actions.className = 'actions';

        const completeBtn = document.createElement('button');
        completeBtn.textContent = completed ? 'Undo' : 'Complete';
        completeBtn.className = 'complete-btn';
        completeBtn.onclick = () => {
            li.classList.toggle('completed');
            completeBtn.textContent = li.classList.contains('completed') ? 'Undo' : 'Complete';
            // If task is completed and repeats daily or weekly, create a new task for the next day/week
            if (li.classList.contains('completed') && (repeat === "daily" || repeat === "weekly")) {
                // Calculate next date
                const nextDate = new Date(date);
                if (repeat === "daily") {
                    nextDate.setDate(nextDate.getDate() + 1);
                } else if (repeat === "weekly") {
                    nextDate.setDate(nextDate.getDate() + 7);
                }
                const yyyy = nextDate.getFullYear();
                const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
                const dd = String(nextDate.getDate()).padStart(2, '0');
                const nextDateStr = `${yyyy}-${mm}-${dd}`;
                const newTaskEl = createTaskElement(taskText, taskDesc, false, nextDateStr, time, repeat);
                list.appendChild(newTaskEl);
            }
            updateAnalytics();
        };

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.background = '#ffc107';
        editBtn.style.color = '#333';
        editBtn.onclick = () => {
            // Fill form with current task values
            input.value = taskText;
            descInput.value = taskDesc;
            dateInput.value = date;
            timeInput.value = time;
            repeatInput.value = repeat;
            editMode = true;
            editLi = li;
            form.querySelector('button[type="submit"]').textContent = 'Update';
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            if (editLi === li) {
                // If deleting the task being edited, reset form
                editMode = false;
                editLi = null;
                form.reset();
                form.querySelector('button[type="submit"]').textContent = 'Add';
            }
            li.remove();
            updateAnalytics();
        };

        actions.appendChild(completeBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(span);
        li.appendChild(descSpan);
        li.appendChild(dateSpan);
        li.appendChild(timeSpan);
        li.appendChild(repeatSpan);
        li.appendChild(actions);

        // Store task data for editing
        li._taskData = { taskText, taskDesc, completed, date, time, repeat };

        return li;
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        const taskText = input.value.trim();
        const taskDesc = descInput.value.trim();
        const taskDate = dateInput.value;
        const taskTime = timeInput.value;
        const taskRepeat = repeatInput.value;
        if (taskText && taskDesc && taskDate && taskTime) {
            if (editMode && editLi) {
                // Update existing task
                const completed = editLi.classList.contains('completed');
                const newLi = createTaskElement(taskText, taskDesc, completed, taskDate, taskTime, taskRepeat);
                list.replaceChild(newLi, editLi);
                editMode = false;
                editLi = null;
                form.querySelector('button[type="submit"]').textContent = 'Add';
            } else {
                // Add new task
                const taskEl = createTaskElement(taskText, taskDesc, false, taskDate, taskTime, taskRepeat);
                list.appendChild(taskEl);
            }
            input.value = '';
            descInput.value = '';
            dateInput.value = '';
            timeInput.value = '';
            repeatInput.value = 'none';
            updateAnalytics();
        }
    };

    // Show/hide dashboard and task manager sections
    const dashboard = document.getElementById('analytics-dashboard');
    const taskManagerSection = document.getElementById('task-manager-section');
    document.getElementById('show-dashboard-btn').onclick = function() {
        dashboard.style.display = '';
        taskManagerSection.style.display = 'none';
    };
    document.getElementById('show-task-manager-btn').onclick = function() {
        dashboard.style.display = 'none';
        taskManagerSection.style.display = '';
    };

    // Initial analytics update
    updateAnalytics();