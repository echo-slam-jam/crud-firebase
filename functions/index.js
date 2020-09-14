const admin = require("firebase-admin");

const serviceAccount = require("./permissions.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://first-project-75805.firebaseio.com"
}); // admin credentials from firebase
const db = admin.firestore();

const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));










//create
app.post('/api/things/create', (req, res) => {
    (async () => {
        try {
            await db.collection('things').doc() //doc('/' + req.body.id + '/') to manipulate id in postman
                .create({
                    name: req.body.name,
                    quantity: req.body.quantity
                });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

//read all
app.get('/api/things', (req, res) => {
    // eslint-disable-next-line consistent-return
    (async () => {
        try {
            let query = db.collection('things');
            let response = [];

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedThings = {
                        id: doc.id,
                        name: doc.data().name,
                        quantity: doc.data().quantity
                    };
                    response.push(selectedThings);
                }
                return res.status(200).send(response);
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

//read specific
app.get('/api/things/:thing_id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('things').doc(req.params.thing_id);
            let thing = await document.get();
            let response = thing.data();
            return res.status(200).send(response);
        } catch (e) {
            console.log(e);
            return res.status(500).send(e);
        }
    })();
});

//update
app.put('/api/things/update/:thing_id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('things').doc(req.params.thing_id);
            await document.update({
                name: req.body.name,
                quantity: req.body.quantity
            });
            return res.status(200).send();
        } catch (e) {
            // statements
            console.log(e);
            return res.status(500).send(e);
        }
    })();
});

//delete
app.delete('/api/things/delete/:thing_id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('things').doc(req.params.thing_id);
            await document.delete();
            return res.status(200).send();
        } catch (e) {
            // statements
            console.log(e);
            return res.status(500).send(e);
        }
    })();
});

exports.app = functions.https.onRequest(app); //exports the app functions
exports.addAdminRole = functions.https.onCall((data, context) => {
    // get user and add custom claim (admin)
    return admin.auth().getUserByEmail(data.email)
        .then(user => {
            return admin.auth().setCustomUserClaims(user.uid, {
                admin: true
            });
        }).then(() => {
            return {
                message: `Success! ${data.email} has been made an admin`
            }
        }).catch(err => {
            return err;
        });
})