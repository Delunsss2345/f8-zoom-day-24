const modal = document.getElementById('taskModal') ; 
const addBtn = document.querySelector('.add-btn') ; 
const closeBtn = document.querySelector('.close-button') ; 
const cancelBtn = document.querySelector('.cancel-button') ;
const addTask = document.querySelector('.add-new-button') ; 
const textBox = document.querySelectorAll('.input-group > input, textarea') ; 
const form = document.getElementById('form');
const todoMain = document.querySelector('.task-grid') ; 
const tabList = document.querySelectorAll('.tab-list .tab-button') ;
const search = document.querySelector('.search-input') ; 
let todoTasks = JSON.parse(localStorage.getItem('todos')) || [] ; 
const toggleButtons = [addBtn, closeBtn, cancelBtn];


const handleToggleModal = (btn) => {
    modal.classList.toggle('show');

    if (btn.classList.contains('add-btn')) {
        modal.querySelector('.modal-title').innerHTML = 'Add Task';
        form.removeAttribute('data-editing-id'); //Xoá edit id 
        form.reset(); 
        textBox[0].focus(); //Chọn input đầu
    } 
    else {
        form.reset();
    }
};

toggleButtons.forEach(btn => {
    btn.onclick = () => handleToggleModal(btn);
});



//Hàm tối ưu , để lọc và render filter theo đúng thực tế
const filterActive = (index) => {
    if (index === 0) {
        renderTask(todoTasks); 
    } else if (index === 1) {
        const activeTasks = todoTasks.filter(todo => !todo.isCompleted);
        renderTask(activeTasks);
    } else if (index === 2) {
        const completedTasks = todoTasks.filter(todo => todo.isCompleted);
        renderTask(completedTasks); 
    }
}


//Tạo hàm để tối ưu lặp nhiều lần
const taskRender = (tasks) => {
    localStorage.setItem("todos" , JSON.stringify(tasks)) ;
    renderTask(tasks) ;
}


//Hàm dùng đễ show thông báo 
const showToast = (type, text) => {
    notie.alert({ type, text, time: 2 });
};

//Hàm lắng nghe tắt mở tab
tabList.forEach((tab , index)=> {
    tab.onclick = () => {
        tabList.forEach(t => t.classList.remove("active")); //Tắt active tất cả
        tab.classList.add("active"); 
        filterActive(index) ;  //Kiểm tra index lọc
    }
})

search.addEventListener("input", function () {
  const key = this.value.trim().toLowerCase();

  tabList.forEach(t => t.classList.remove("active"));

  tabList[0].classList.add("active");

  if (key === "") {
    renderTask(todoTasks); 
    return;
  }

  const filterTasks = todoTasks.filter(task =>
    task.title.toLowerCase().includes(key) ||
    task.description.toLowerCase().includes(key)
  ); //Filter theo từ khoá

  if (filterTasks.length > 0) {
    renderTask(filterTasks);
  } else {
    todoMain.textContent = "";
    todoMain.textContent = "Không tìm thấy task";
  }
})

//Hàm sửa
const editTask = (task , id) => {
    Object.keys(task).forEach(key => {
        if (form[key]) {
            form[key].value = task[key]; 
        }
    });

    form.dataset.editingId = id; //Thêm edit vào id
    modal.classList.toggle('show');
    modal.querySelector('.modal-title').innerHTML = 'Edit Task' ; 
};

//Hàm xoá
const delTask = (id) => {
    notie.confirm({
    text: 'Bạn có chắc chắn muốn xoá task này?',
    submitText: 'Xoá',
    cancelText: 'Huỷ',
    submitCallback: function () {
        const newTodos = todoTasks.filter((todo , index) => index !== id) ; 
        todoTasks = newTodos ;
        taskRender(newTodos) ; 
        showToast('success' , "Đã xoá task") ;
    },
    cancelCallback: function () {
      showToast('warning' , "Đã huỷ xoá task") ;
    }
  });
    
};

//Hàm cập nhập hoàn thành 
const completeTask = (id) => {
    const todo = todoTasks.find((todo , index) => index === id) ; 
    todo.isCompleted = !todo.isCompleted ;
    todoTasks[id] = todo ;
    localStorage.setItem("todos" , JSON.stringify(todoTasks)) ;

    const activeTab = [...tabList].findIndex(tab => tab.classList.contains('active'));
    //Kiểm tra tab nào đang bật để hiện thị đúng
    filterActive(activeTab) ; 
};


//Hàm lắng nghe sự kiện ở thẻ to nhất
todoMain.onclick = (e) => {
    const taskId = e.target.closest('.task-card')?.dataset.taskId ; 
    if(e.target.classList.contains('edit')) {
        if(taskId) {
            const task = todoTasks[taskId - 1] ; 
            editTask(task , taskId) ; 
        }
    }
    else if(e.target.classList.contains('delete')) {
        if(taskId) {
            const task = todoTasks[taskId - 1] ; 
            delTask(taskId - 1) ; 
        }
    }
    else if(e.target.classList.contains('complete')) {
        if(taskId) {
            completeTask(taskId - 1) ; 
        }
    }
}
//Hàm chuyển time thành dạng bên mỹ
function formatHoursAndMinutes(time) {
    const [hours, minutes] = time.split(':')
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); 
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

//Hàm lấy tổng giây để validate
function getSecondTime(time) {
    const [hours, minutes] = time.split(':'); 
    const totalSeconds = (hours * 3600) + (minutes * 60);
    return totalSeconds ; 
}

function validateField(newTask) {
    if(!newTask.title) {
       return alert('Tên tiêu đề không được trống') ; 
    }

    if(!newTask.startTime) {
       return alert('Giờ bắt đầu không được trống') ; 
    }

    if(!newTask.endTime) {
       return alert('Giờ kết thúc không được trống') ; 
    }

    if(getSecondTime(newTask.endTime) < getSecondTime(newTask.startTime)) {
        return alert('Giờ kết thúc bắt buộc lớn hơn giờ bắt đầu') ; 
    }
    
    if(!newTask.DueDate) {
        return alert('Ngày hết hạn không được trống') ; 
    }
    const currentDate = new Date() ; 
    currentDate.setHours(0 , 0 , 0 , 0) ; 

    const tempDate  = new Date(newTask.DueDate) ;
    tempDate.setHours(0 , 0 , 0 , 0) ; 

    if(tempDate < currentDate) {
        return alert('Ngày hết hạn lớn hơn hoặc bằng ngày hiện tại') ; 
    }


    if(!newTask.description) {
       return alert('Mô tả không được trống') ; 
    }
    
    return true ;
}

//Hàm render hổ trợ truyền mảng
function renderTask(todos) {    
    todoMain.innerHTML = "" ; 
    todos.map((task , index) => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.dataset.taskId =  todoTasks.indexOf(task) + 1; //fix bug idx không thật nếu xài mảng khác
        taskCard.classList.add(task.cardColor || 'blue');
            
        if (task.isCompleted) {
            taskCard.classList.add('completed');
        }

        const taskHeader = document.createElement('div');
        taskHeader.classList.add('task-header');
            
        const taskTitle = document.createElement('h3');
        taskTitle.classList.add('task-title');
        taskTitle.textContent = task.title;

        const taskMenuButton = document.createElement('button');
        taskMenuButton.classList.add('task-menu');
        taskMenuButton.innerHTML = `
        <i class="fa-solid fa-ellipsis fa-icon"></i>
        <div class="dropdown-menu">
            <div class="dropdown-item edit">
                <i class="fa-solid fa-pen-to-square fa-icon"></i>
                Edit
            </div>
            <div class="dropdown-item complete">
                <i class="fa-solid fa-check fa-icon"></i>
                ${task.isCompleted ? "Mark as active" : "Mark as Complete"}
            </div>
            <div class="dropdown-item delete">
                <i class="fa-solid fa-trash fa-icon"></i>
                Delete
            </div>
        </div>
    `;
        taskHeader.appendChild(taskTitle);
        taskHeader.appendChild(taskMenuButton);

        const taskDescription = document.createElement('p');
        taskDescription.classList.add('task-description');
        taskDescription.textContent = task.description; 

        const taskTime = document.createElement('div');
        taskTime.classList.add('task-time');

        taskTime.textContent = `${formatHoursAndMinutes(task.startTime)} - ${formatHoursAndMinutes(task.endTime)}`;

        taskCard.appendChild(taskHeader);
        taskCard.appendChild(taskDescription);
        taskCard.appendChild(taskTime);

        todoMain.appendChild(taskCard);
    })

}


form.onsubmit = function (e) {
    e.preventDefault(); 
   
    
    const formData = new FormData(form);
    const task = {
        title: formData.get('title').trim(),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        DueDate: formData.get('DueDate'),
        category: formData.get('category'),
        cardColor: formData.get('cardColor'),
        description: formData.get('description').trim(),
        priority: formData.get('priority').trim(),
        isCompleted: false
    };

    
    if (!validateField(task)) return;

    const isEdit = form.dataset.editingId ; 
    const newTitle = task.title.toLowerCase() ;

    const isFailedTitle = todoTasks.some((todo , index) => {
        if(index === isEdit - 1) return false ; 
        return todo.title.toLowerCase() === newTitle ;
    })

    if(isFailedTitle) {
        showToast('warning', 'Đã huỷ xoá task');
        return ;
    }

    if(this.dataset.editingId) {
        todoTasks[this.dataset.editingId - 1] = task ; 
        modal.classList.remove('show');
        taskRender(todoTasks) ;
        showToast('info', 'Cập nhật task thành công');
        form.reset();
        return ; 
    } ;
    

    todoTasks.unshift(task); 
    showToast('success', 'Thêm task thành công');
    taskRender(todoTasks) ; 
    form.reset();
    modal.classList.remove('show');
};

renderTask(todoTasks) ; 