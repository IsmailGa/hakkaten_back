const express = require("express")
const { registerUser, getPostsByUserId, loginUserByEmail, getProfileByUserdId} = require("../controllers/userController")

const router = express.Router()

router.post("/register",  registerUser)
router.post("/loginByEmail", loginUserByEmail) //ЛОГИН ПО ИМЕЙЛУ
router.get("/posts/:id", getPostsByUserId) // ПОЛУЧИТЬ ВСЕ ПОСТЫ ОТ ОПРЕДЕЛЕННОГО ЮЗЕРА
router.get("/user/:id", getProfileByUserdId) // ПОЛУЧИТЬ ПРОФИЛЬ ЮЗЕРА ПО ЕГО АЙДИ
// ЗДЕСЬ БУДЕТ ПРОИСХОДИТЬ ТАК http://localhost:5050/api/users/...

module.exports = router