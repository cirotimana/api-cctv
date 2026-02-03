const eventController = require('../app/controllers/eventController');
const router = require('express').Router();

// Middlewares
const authRequired = require('../app/middleware/validateToken');

/**
 * Rutas para Hikvision (HV)
 */
router.get('/events/hv', authRequired, eventController.getEventsHv);
router.get('/events/hv/last', authRequired, eventController.getLastEventsHv); 
router.put('/events/hv/:id', authRequired, eventController.updateEventHvStatus); 
router.get('/events/hv/event-type', authRequired, eventController.getEventsHvByEventType);
router.put('/events/hv/observations/:id', authRequired, eventController.updateEventHvObservations);
router.get('/events/hv/count-distinct-name', authRequired, eventController.getDistinctNameHvCount);
router.delete('/events/hv/remove-duplicates', authRequired, eventController.removeDuplicateEventsHv);
router.post('/eventhv', authRequired, eventController.createEventHv);

/**
 * Rutas para Samsung
 */
router.get('/events/samsung', authRequired, eventController.getEventsSamsung);
router.get('/events/samsung/last', authRequired, eventController.getLastEventsSamsung);
router.put('/events/samsung/:id', authRequired, eventController.updateEventSamsungStatus);
router.get('/events/samsung/event-type', authRequired, eventController.getEventsSamsungByEventType);
router.put('/events/samsung/observations/:id', authRequired, eventController.updateEventSamsungObservations);
router.get('/events/samsung/count-distinct-name', authRequired, eventController.getDistinctNameSamsungCount);
router.delete('/events/samsung/remove-duplicates', authRequired, eventController.removeDuplicateEventsSamsung);

/**
 * Rutas generales
 */
router.get('/events/notifications/count', authRequired, eventController.getNewNotificationsCount);
router.get('/events/notifications/by-date', authRequired, eventController.getNewNotificationsCountByDate);
router.get('/events/summary-by-date', authRequired, eventController.getTransitionSummary);
router.get('/events/timeline', authRequired, eventController.getLogHistoryTimeline);


module.exports = router;
