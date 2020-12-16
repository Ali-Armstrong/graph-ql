const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const EventModel = require('./models/event');

const app = express();

const events = [
]

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
    schema : buildSchema(`
        type Event{
            _id: ID!
            title : String!
            description : String!
            price: Float!
            date: String!
        }

        input EventInput{
            title : String!
            description : String!
            price: Float!
        }

        type RootQuery{
            events : [Event!]!
        }

        type RootMutations{
            createEvent(eventInput : EventInput) : Event
        }

        schema {
            query: RootQuery
            mutation: RootMutations
        }
    `),
    rootValue : {
        events : () =>{
            return EventModel.find().then((records)=>{
                return records.map((doc)=>{
                    return {...doc._doc, _id :doc.id}
                });
            }).catch(err=>{
                console.log(err)
                throw new Error(err)
            })
        },
        createEvent: (args) =>{
            const event = new EventModel({
                title : args.eventInput.title,
                description : args.eventInput.title,
                price : args.eventInput.price,
                date : new Date()
            });
            return event.save().then(res => {
                //console.log(res);
                return { ...res._doc }
            }).catch(err=> {
                console.log(err)
                throw new Error(err)
            });
        }
    },
    graphiql : true
}))

mongoose.connect('mongodb://localhost:27017/graph-ql').then(()=>{
    app.listen(3000);
}).catch((err)=>{
    console.log(err)
})

