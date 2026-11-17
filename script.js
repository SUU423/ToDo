//Firebaseを使用するための設定
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-analytics.js";
const firebaseConfig = {
    apiKey: "AIzaSyBhEb9DUIHuDzs0uDuX8hwRaoWlzZLG-ZY",
    authDomain: "todoapp-1a3f5.firebaseapp.com",
    projectId: "todoapp-1a3f5",
    storageBucket: "todoapp-1a3f5.firebasestorage.app",
    messagingSenderId: "1001715032651",
    appId: "1:1001715032651:web:3c9c115eaabeebf5aaa3ce",
    measurementId: "G-G1T48XV2RR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

//todoを保存する処理
const TextInput = document.getElementById("textinput");
const colorSelect = document.getElementById("colorselect");
const AddTask = document.getElementById("addtask");
const TodoList = document.getElementById("todolist");

//追加処理の二重実行ガード（スマホでの二度タップ対策）
let isAdding = false;

AddTask.addEventListener("click", async () => {
    if (isAdding) return;
    const TEXTINPUT = TextInput.value;
    const COLORSELECT = colorSelect.value;
    if (TEXTINPUT === "") {
        alert("文字を入力してください");
        return;
    }

    isAdding = true;
    AddTask.disabled = true;
    try {
        await addDoc(collection(db, "todos"), {
            task: TEXTINPUT,
            color: COLORSELECT,
            createdAt: new Date()
        });
        TextInput.value = "";
        await fetchTodos();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("保存に失敗しました");
    } finally {
        isAdding = false;
        AddTask.disabled = false;
    }
});

//todoを取得する処理
//連番ガード：古い取得結果は描画しない（同時実行による二重表示対策）
let fetchSeq = 0;

const fetchTodos = async () => {
    const seq = ++fetchSeq;
    try {
        const querySnapshot = await getDocs(collection(db, "todos"));
        if (seq !== fetchSeq) return; // より新しい取得が始まっていたら破棄
        //取得が終わってから一括で描画する
        const fragment = document.createDocumentFragment();
        querySnapshot.forEach((item) => {
            const data = item.data();
            const id = item.id;
            const div = document.createElement("div");
            div.textContent = data.task;
            div.style.backgroundColor = data.color;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation(); // 親要素へのクリック伝播を防ぐ
                deleteBtn.disabled = true; // 二度タップでの二重削除を防ぐ
                deleteTodo(id);
            });
            div.appendChild(deleteBtn);
            fragment.appendChild(div);
        });
        TodoList.innerHTML = "";
        TodoList.appendChild(fragment);
    } catch (error) {
        console.error("Error fetching documents: ", error);
        alert("データの取得に失敗しました");
    }
};

//todoを削除する処理
const deleteTodo = async (id) => {
    try {
        await deleteDoc(doc(db, "todos", id));
        await fetchTodos();
    } catch (error) {
        console.error("削除に失敗しました: ", error);
        alert("削除に失敗しました");
    }
};

fetchTodos();
