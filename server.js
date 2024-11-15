const express = require("express")
const cors = require("cors")
const postsRoutes = require("./routes/postsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express()

app.use(cors({
    origin: "http://localhost:5173/",
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}))

app.use(express.json())

// УРЛ ПО КОТОРОМУ ТЫ БУДЕШЬ РАБОТАТЬ С НИМИ
app.use("/api/posts", postsRoutes) // ЭТО ДЛЯ ПОСТОВ
app.use("/api/users", userRoutes) // ЭТО ДЛЯ ЮЗЕРОВ (РЕГИСТРАЦИЯ, ЛОГИН)
// ЗДЕСЬ БУДЕТ ПРОИСХОДИТЬ ТАК http://localhost:5050/api/posts/

const PORT = process.env.PORT || 6060;

app.listen(PORT, () => {
    console.log("Serve is runnning on port " + PORT);
})