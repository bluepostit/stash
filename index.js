const express = require('express')

const app = express()
const PORT = 4000

app.get('/', (req, res) => res.send('Hey there'))
app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`)
})
