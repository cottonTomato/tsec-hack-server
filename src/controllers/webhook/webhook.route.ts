import { Router } from 'express';
import { sendServices, askLocation, sendWorkersList } from './webhook.controller';
import { getCompany } from './webhook.auth';

export const webhookRouter = Router();

let serviceName="Carpenter";
let currentState = "services"
const gig = {};

const myToken = 'real';
// Add the new webhook GET request handler
webhookRouter.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];

    if (mode === 'subscribe' && verifyToken === 'real') {
        res.status(200).send(challenge);
    } else {
        res.status(403).send('Forbidden');
    }
});

webhookRouter.post('/', async (req, res) => {
    let body = req.body;
    console.log(JSON.stringify(body, null, 2));

    if (body.object) {
        // if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.message && body.entry[0].changes[0].value.message[0]) {
        if (body.entry) {
            let phone_no_id = body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body.entry[0].changes[0].value.messages[0].from;
            if (body.entry[0].changes[0].value.messages[0].text) {
                let message = body.entry[0].changes[0].value.messages[0].text.body;
            }

            // authenticate the company 
            // let company = await getCompany(from.toString());
            // if (!company) {
            //     return res.status(401).send('Unauthorized');
            // }

            if (body.entry[0].changes[0].value.messages[0].type === 'location' && currentState === "workers") {
                try {
                    sendWorkersList(phone_no_id, from, 12);
                    res.status(200).send('Message sent');
                    setTimeout(() => {
                        currentState = "services";
                    }, 15000);
                    return;
                } catch (error) {
                    console.error('Error sending message:', error);
                    res.status(500).send('Error sending message');
                }
            }

            if (body.entry[0].changes[0].value.messages[0].type === 'interactive' && body.entry[0].changes[0].value.messages[0].interactive.type === 'list_reply' && currentState === "location") {
                // console.log("\n\n\n\n\n\n\n\nHIIIIIIIIIIIIIIIIII\n\n\n\n\n\n\n\n\n\n")
                serviceName = body.entry[0].changes[0].value.messages[0].interactive.list_reply.title;
                try {
                    askLocation(phone_no_id, from);
                    res.status(200).send('Message sent');
                    currentState = "workers";
                    return;
                } catch (error) {
                    console.error('Error sending message:', error);
                    res.status(500).send('Error sending message');
                }
            }

            // Send a POST request using fetch API
            if (currentState === "services") {
                try {
                    sendServices(phone_no_id, from);
                    currentState = "location";
                    res.status(200).send('Message sent');
                } catch (error) {
                    console.error('Error sending message:', error);
                    res.status(500).send('Error sending message');
                }
            }
        }
    }
});