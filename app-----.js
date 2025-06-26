const http = require('http');

const server = http.createServer((req, res) => {
    res.setHeader('Content-type', 'text/plain')
    res.write('Hello World 123')
    res.end()
})

const port = 3001
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})