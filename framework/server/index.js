const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const app = next({ dev: process.env.NODE_ENV !== 'production'})
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000

app.prepare().then(() => {

    const httpServer = createServer(async(req, res) => {
        handle(req, res)
    })
    const io = new Server(httpServer, { cors: { origin: '*' }})

    const updateTypes = new Map()

    io.on('connection', (socket) => {

        console.log('User connected:', socket.id)

        socket.on('loadUpdateTypes', (types) => {
            for (const [key, value] of Object.entries(types)) {
                updateTypes.set(key, value)
            }
        })

        socket.on('callUpdate', (key, update) => {
            io.emit(updateTypes.get(key), update)
        })

    })

    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))

})