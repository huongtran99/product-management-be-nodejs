const fastify = require('fastify')()
let {ObjectId} = require('fastify-mongodb')
fastify.register(require('fastify-cors'), {})

fastify.register(require('fastify-mongodb'), {
    forceClose: true,
    url: 'mongodb://user:TheSubtleArtOfNotGivingAFuck2020@165.22.242.238:27017'
})

const express = require('express')
const multer = require('multer')
const app = express()
app.use(express.urlencoded({extended: false}))
app.use(express.json({extended: false}))
app.post('/upload', (req, res) => {
    console.log("File upload API")
})
const upload = multer({
    storage: multer.memoryStorage()
})
app.use(upload.single())



fastify.get('/', (req, reply) => {
    reply.send({hello: 'world'})
})

fastify.get('/category', async (req, res) => {
    let data = await fastify.mongo.client.db('product-management').collection('category').find().limit(5).toArray();
    res.send(data);
})

fastify.get('/product/:page', async (req, res) => {
    let page = +req.params.page;
    let name = req.query.search;
    let query = {name: { $regex: name, $options: 'i' }};
    let data;
    if (name !== undefined) {
        data = await fastify.mongo.client.db('product-management').collection('product').find(query).skip((3 * page) - 3).limit(3).toArray()
    } else {
        data = await fastify.mongo.client.db('product-management').collection('product').find().skip((3 * page) - 3).limit(3).toArray()
        let c = await fastify.mongo.client.db('product-management').collection('product').find().count();
        console.log(c);
    }
    res.send(data);
})

fastify.get('/product/info/:id', async (req, res) => {
    let _id = new ObjectId(req.params.id);
    let data = await fastify.mongo.client.db('product-management').collection('product').find({_id: _id}).toArray();
    res.send(data);
})

fastify.post('/product', async (req, res) => {
    let data = await fastify.mongo.client.db('product-management').collection('product').insertOne(req.body);
    res.send(data);
})

fastify.post(`/product/edit`, async (req, res) => {
    let _id = new ObjectId(req.body.id);
    let newValue = {$set: req.body};
    let data = await fastify.mongo.client.db('product-management').collection('product').findOneAndUpdate({_id: _id}, newValue, {upsert: true});
    res.send(data);
})

fastify.post('/product/delete', async (req, res) => {
    console.log(req.body.id);
    let _id = new ObjectId(req.body.id);
    let data = await fastify.mongo.client.db('product-management').collection('product').findOneAndDelete({_id: _id});
    res.send(data);
})

const start = async () => {
    try {
        await fastify.listen(3000)
        console.log("okla")
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start();
