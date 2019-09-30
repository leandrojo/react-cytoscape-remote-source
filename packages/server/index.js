/* eslint-disable no-console */

const Datastore = require('nedb');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const db = new Datastore({ filename: './data.db', autoload: true });

const PORT = 8080;

// eslint-disable-next-line no-underscore-dangle
const _id = '356a192b7913b04c54574d18c28d46e6395428ab';

app.get('/create', (req, res) => {
  db.insert({
    _id,
    canvas: {
      edges: [
        { data: { id: 'v', source: 'j', target: 'e' } },
        { data: { id: 'y', source: 'j', target: 'k' } },
        { data: { id: 'z', source: 'j', target: 'g' } },
      ],
      nodes: [
        { data: { id: 'j', name: 'Jerry' } },
        { data: { id: 'e', name: 'Elaine' } },
        { data: { id: 'k', name: 'Kramer' } },
        { data: { id: 'g', name: 'George' } },
      ],
    },
  }, (err) => {
    if (err === null) res.json({ msg: 'ok' });
  });
});

io.on('connection', (socket) => {
  // TODO: Passar "id" do pipeline por parametro.
  db.findOne({ _id }, (err, docs) => {
    socket.emit('canvas', docs);
  });

  socket.on('canvas/update', (e) => {
    db.findOne({ _id }, (err, { canvas, ...rest }) => {
      const nodes = canvas.nodes.map((node) => {
        if (node.data.id === e.data.id) return e;
        return node;
      });

      db.remove({ _id });
      db.insert({ ...rest, canvas: { ...canvas, nodes } }, (error, docs) => {
        socket.broadcast.emit('canvas', docs);
        console.log('canvas node update');
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
