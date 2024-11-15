const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({ // УРЛШКА БАЗЫ ДАННЫХ ЕЁ МОЖНО БУДЕТ ПОМЕНЯТЬ В КОНФИГАХ ЕНВ
    connectionString: process.env.DATABASE_URL
})

module.exports = pool;