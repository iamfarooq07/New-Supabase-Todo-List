const SUPABASE_URL = "https://wldfwnpmmnfvrrycvvmt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsZGZ3bnBtbW5mdnJyeWN2dm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjMzMjAsImV4cCI6MjA3MjQ5OTMyMH0.eshHgA9axfIUgh4hmmk9rziv80ycpVER79aXYwEqMk8";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const loginBar = document.getElementById("loginBar");
const loginBtn = document.getElementById("loginbtn");
const signinBtn = document.getElementById("signinbtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const todoSection = document.getElementById("todoSection");
const logoutBtn = document.getElementById("logout");
const addTask = document.getElementById("task");
const textarea = document.getElementById("textarea");
const addBtn = document.getElementById("add");
const addList = document.getElementById("list");

addList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('fa-trash-alt')) {
        const li = e.target.closest("li");
        const todoId = parseInt(li.getAttribute("data-id"));

        const { error } = await supabase
            .from("todos")
            .delete()
            .eq("id", todoId);

        if (error) {
            console.error("Delete error:", error);
            return;
        }

        li.remove();
    }


    if (e.target.classList.contains('fa-edit')) {
        const li = e.target.closest("li");
        editId = parseInt(li.getAttribute("data-id"));
        const title = li.querySelector("span:nth-child(1)").textContent;
        const contact = li.querySelector("span:nth-child(2)").textContent;

        addTask.value = title;
        textarea.value = contact;

        editMode = true;
        addBtn.textContent = "Update Task";
    }
});



function renderTodos(todos) {
    addList.innerHTML = "";
    todos.forEach((todo) => {
        addList.innerHTML += `
      <li data-id="${todo.id}" class="lists flex justify-between items-center bg-gray-400 p-4 mt-3 rounded-2xl">
        <div class="flex flex-col">
          <span class="text-xl sm:text-2xl md:text-3xl font-bold">${todo.title}</span>
          <span class="text-sm sm:text-lg md:text-2xl font-semibold mt-2">${todo.contact}</span>
        </div>
        <div class="flex space-x-1">
          <i class="fas fa-edit edit text-xl sm:text-2xl md:text-3xl font-bold cursor-pointer"></i>
          <i class="far fa-trash-alt delete text-xl sm:text-2xl md:text-3xl font-bold cursor-pointer fa-trash-alt"></i>
        </div>
      </li>`;
    });
}


async function fetchTodos(userId) {
    const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    if (error) {
        console.error("Fetch Error:", error.message);
    } else {
        renderTodos(data);
    }
}
let editMode = false;
let editId = null;
addBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const inputVal = addTask.value.trim();
    const textVal = textarea.value.trim();

    if (!inputVal && !textVal) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("Please login first!");
        return;
    }

    const userId = session.user.id;

    if (editMode) {
        const { error } = await supabase
            .from("todos")
            .update({
                title: inputVal,
                contact: textVal,
            })
            .eq("id", editId)
            .eq("user_id", userId);

        if (error) {
            alert("Update Error: " + error.message);
        } else {
            fetchTodos(userId);
        }
        editMode = false;
        editId = null;
        addBtn.textContent = "Add Task";
    } else {
        const { error } = await supabase.from("todos").insert([
            {
                title: inputVal,
                contact: textVal,
                user_id: userId,
            },
        ]);

        if (error) {
            alert("Insert Error: " + error.message);
        } else {
            fetchTodos(userId);
        }
    }

    addTask.value = "";
    textarea.value = "";
});

logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signOut();

    if (error) {
        alert(error.message);
    } else {
        todoSection.classList.add("hidden");
        loginBar.classList.remove("hidden");
        addList.innerHTML = "";
        console.log("User logged out successfully");
    }
});

signinBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Please check your email to verify.");
    }

    emailInput.value = "";
    passwordInput.value = "";
});


loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
    },
        {
            persistSession: false
        });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Logged in.");

    emailInput.value = "";
    passwordInput.value = "";

    todoSection.classList.remove("hidden");
    loginBar.classList.add("hidden");

    fetchTodos(data.user.id);
});


(async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Session Error:", error.message);
    }

    if (session) {
        todoSection.classList.remove("hidden");
        loginBar.classList.add("hidden");
        fetchTodos(session.user.id);
    } else {
        todoSection.classList.add("hidden");
        loginBar.classList.remove("hidden");
    }
})();



