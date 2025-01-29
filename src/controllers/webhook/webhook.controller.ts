import { db, users, workerTypes, userRoles } from '../../db';
import { eq, sql } from 'drizzle-orm';

export const sendServices = async (phone_no_id: Number, from: Number) => {
    const workerTypeList = await db.select({id: workerTypes.id, title: workerTypes.name}).from(workerTypes).limit(5);
    try {
        const response = await fetch('https://graph.facebook.com/v21.0/'+phone_no_id+'/messages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer EAAMfn42vpUMBO3IJk2CbhtEyfzOSVPy8T8p1ZCEQ0U467jmPVBB2ktZANbTFsl33kkrpDYPIUZAcWL8HZC4NgVDY5zkZCUYsCCWWZBZBsWfG7BNcozfuuTLNZCptY5qCp8JuIZCtnRqZBBiCRHvwICQnnzV6UQwCEZAk2ZAymLQXNtnleG31GQ0yNmZCOc7DrKZANKZC9d3dqRWeCC3aqDvYAJrreYBuTmaX3uwBOdz7B3wBQh0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: from,
                type: 'interactive',
                interactive: {
                    type: 'list',
                    header: {
                        type: 'text',
                        text: 'What Service Do You Require?',
                    },
                    body: {
                        text: 'Problem Domain',
                    },
                    action: {
                        button: 'Services Offered',
                        sections: [
                            {
                                title: 'Select one',
                                rows: workerTypeList,
                            },
                        ]
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        // console.log('Response from Facebook API: \n', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Error sending message');
    }
};

export const askLocation = async (phone_no_id: Number, from: Number) => {
    try {
        const response = await fetch('https://graph.facebook.com/v21.0/'+phone_no_id+'/messages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer EAAMfn42vpUMBO3IJk2CbhtEyfzOSVPy8T8p1ZCEQ0U467jmPVBB2ktZANbTFsl33kkrpDYPIUZAcWL8HZC4NgVDY5zkZCUYsCCWWZBZBsWfG7BNcozfuuTLNZCptY5qCp8JuIZCtnRqZBBiCRHvwICQnnzV6UQwCEZAk2ZAymLQXNtnleG31GQ0yNmZCOc7DrKZANKZC9d3dqRWeCC3aqDvYAJrreYBuTmaX3uwBOdz7B3wBQh0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: from,
                type: 'interactive',
                interactive: {
                    type: 'location_request_message',
                    body: {
                        text: 'Share the Location Of the Gig',
                    },
                    action: {
                        name: 'send_location'
                    }
                }
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        // console.log('Response from Facebook API: \n', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Error sending message');
    }
};


export const sendWorkersList = async (phone_no_id: Number, from: Number, serviceId: Number) => {
    try {
        const workerTypeList = await db.select({id: workerTypes.id, title: workerTypes.name}).from(workerTypes).limit(5);
        const workersList = await db.select({id: users.id, title: users.name, description: sql<string>`'Call: ' || ${users.phone} || ' (Rating: ' || ${users.averageRating} || ')'`}).from(users).where(eq(users.role, 'worker')).limit(5);
        console.log(workersList);
        const response = await fetch('https://graph.facebook.com/v21.0/'+phone_no_id+'/messages', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer EAAMfn42vpUMBO3IJk2CbhtEyfzOSVPy8T8p1ZCEQ0U467jmPVBB2ktZANbTFsl33kkrpDYPIUZAcWL8HZC4NgVDY5zkZCUYsCCWWZBZBsWfG7BNcozfuuTLNZCptY5qCp8JuIZCtnRqZBBiCRHvwICQnnzV6UQwCEZAk2ZAymLQXNtnleG31GQ0yNmZCOc7DrKZANKZC9d3dqRWeCC3aqDvYAJrreYBuTmaX3uwBOdz7B3wBQh0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: from,
                type: 'interactive',
                interactive: {
                    type: 'list',
                    header: {
                        type: 'text',
                        text: 'Here are the skilled workers near you',
                    },
                    body: {
                        text: 'hello',
                    },
                    action: {
                        button: 'Workers Found',
                        sections: [
                            {
                                title: 'Select one',
                                rows: workersList,
                            },
                        ]
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        // console.log('Response from Facebook API: \n', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Error sending message');
    }
};