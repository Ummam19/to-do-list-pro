// 1. STATE & INITIALIZATION
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all'; // State untuk memantau filter yang aktif

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const errorTxt = document.getElementById('errorTxt');
const todoList = document.getElementById('todoList');
const filterButtons = document.querySelectorAll('.filter-btn');

// Jalankan render pertama kali saat aplikasi dimuat
renderTodos();

// 2. CORE FUNCTIONS (Render & Save)
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';

    // Fitur 2: Menggunakan method filter() sebelum merender tampilan
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // jika 'all'
    });

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        
        // Cek apakah item ini sedang dalam mode edit atau tidak
        if (todo.isEditing) {
            // Mode Elegan: Ubah teks menjadi elemen input text
            li.innerHTML = `
                <div class="todo-item-left">
                    <input type="text" class="edit-input" value="${todo.text}" id="input-${todo.id}">
                </div>
                <div class="btn-group">
                    <button onclick="saveEdit(${todo.id})">Simpan</button>
                    <button onclick="toggleEditMode(${todo.id})">Batal</button>
                </div>
            `;
            
            // Tambahkan event listener agar bisa simpan pakai tombol 'Enter'
            setTimeout(() => {
                const inputEl = document.getElementById(`input-${todo.id}`);
                inputEl.focus();
                inputEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') saveEdit(todo.id);
                });
            }, 0);

        } else {
            // Mode Normal (Tampilan Biasa)
            li.innerHTML = `
                <div class="todo-item-left">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleComplete(${todo.id})">
                    <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
                </div>
                <div class="btn-group">
                    <button onclick="toggleEditMode(${todo.id})" ${todo.completed ? 'disabled' : ''}>Edit</button>
                    <button onclick="deleteTodo(${todo.id})">Hapus</button>
                </div>
            `;
        }

        todoList.appendChild(li);
    });
}

// 3. FITUR 1: VALIDASI INPUT & INTERAKSI
function addTodo() {
    const taskText = todoInput.value.trim();

    // Validasi jika kosong
    if (taskText === '') {
        todoInput.classList.add('error-border');
        errorTxt.style.display = 'block';
        return; 
    }

    // Jika valid, push objek baru ke dalam array state
    todos.push({
        id: Date.now(),
        text: taskText,
        completed: false,
        isEditing: false // flag tambahan untuk kontrol fitur edit elegan
    });

    todoInput.value = '';
    saveToLocalStorage();
    renderTodos();
}

// Hilangkan error saat pengguna mulai mengetik kembali
todoInput.addEventListener('input', () => {
    todoInput.classList.remove('error-border');
    errorTxt.style.display = 'none';
});

// Jalankan addTodo saat klik tombol atau tekan Enter
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// 4. HANDLERS (Update State)
function toggleComplete(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveToLocalStorage();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToLocalStorage();
    renderTodos();
}

// FITUR 3: LOGIKA EDIT (ELEGAN)
function toggleEditMode(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
    );
    renderTodos(); // Tidak perlu saveToLocalStorage karena isEditing cuma state UI sementara
}

function saveEdit(id) {
    const inputEl = document.getElementById(`input-${id}`);
    const updatedText = inputEl.value.trim();

    if (updatedText === '') {
        alert('Teks tugas tidak boleh kosong!');
        return;
    }

    todos = todos.map(todo => 
        todo.id === id ? { ...todo, text: updatedText, isEditing: false } : todo
    );
    
    saveToLocalStorage();
    renderTodos();
}

// FITUR 2: LOGIKA FILTERING (EVENT LISTENERS BUTTONS)
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Ganti class active pada tombol filter
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update state filter lalu render ulang
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});