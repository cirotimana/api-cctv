const { formatDateTime } = require("../utils/dateUtils");
const EventSamsung = require("../models/EventSamsung");
const { sequelize } = require("../../config/database");
const LogHistory = require("../models/LogHistory");
const EventHv = require("../models/EventHv");
const Store = require("../models/Store");
const { Op } = require("sequelize");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

/**************************************************************************/
/********************** Eventos de Hikvision ******************************/
/**************************************************************************/

// Obtener todos los eventos de EventHv

const getEventsHv = async (req, res) => {
  const { startDate, endDate } = req.query;

  const newStartDate = formatDateTime(startDate);
  const newEndDate = formatDateTime(endDate, true);

  console.log("startDate", startDate);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Faltan los parámetros 'startDate' o 'endDate'");
  }

  try {
    const events = await EventHv.findAll({
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name", "supervisor", "status"],
        },
      ],
      where: {
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
        delete_at: null,
      },
      order: [["created_at", "DESC"]],
    });
    return res.json(events);
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    res.status(500).send("Error al obtener los eventos");
  }

};
 
// Obtener los últimos eventos de EventHv
const getLastEventsHv = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  try {
    const events = await EventHv.findAll({
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name"],
        },
      ],
      limit,
      limit,
      where: { delete_at: null },
      order: [["created_at", "DESC"]],
    });
    return res.json(events);
  } catch (error) {
    console.error("Error al obtener los últimos eventos:", error);
    res.status(500).send("Error al obtener los últimos eventos");
  }
};

// Actualizar el estado de un evento de EventHv
const updateEventHvStatus = async (req, res) => {
  const { id } = req.params;
  const { status, changedBy } = req.body;

  console.log(status, changedBy);

  if (!status || !changedBy) {
    return res
      .status(400)
      .send("El campo 'status' y 'changedBy' son requeridos");
  }

  try {
    const event = await EventHv.findOne({
      where: { id, delete_at: null },
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name"],
        },
      ],
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }

    const previousStatus = event.status;

    // event.status = status;
    // await event.save();

    // console.log("estatus es " + status);

    // console.log("previousStatus es " + previousStatus);
    if (previousStatus !== status) {
      event.status = status;
      await event.save();

      console.log("estatus hv es " + status);
      console.log("previousStatus hv es " + previousStatus);
      // Crear un historial de evento
      await LogHistory.create({
        model: "EventHv",
        user_id: changedBy,
        action: "Status Updated",
        details: JSON.stringify({
          previousStatus: previousStatus,
          newStatus: status,
          name: event.store.name,
          eventType: event.event_type,
          eventTime: event.event_time,
          createdAt: event.created_at,
        }),
      });

      //await getNewNotificationsCount(req, res);

      const notificationsCount = await getNewNotificationsCount(req);
      console.log("nuevo conteo de notificaciones desde HV", notificationsCount);

    } else {
      console.log(
        "No se creo un historial de evento hikvision porque el estado no cambió"
      );
    }

    return res.json(event);
  } catch (error) {
    console.error("Error al actualizar el estado del evento:", error);
    res.status(500).send("Error al actualizar el estado del evento");
  }
};

// Actualizar observaciones de un evento de EventHv
const updateEventHvObservations = async (req, res) => {
  const { id } = req.params;
  const { observations } = req.body;

  if (!observations) {
    return res.status(400).send("El campo 'observations' es requerido");
  }

  try {
    const event = await EventHv.findOne({
      where: { id, delete_at: null },
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }
    event.observations = observations;
    await event.save();
    return res.json(event);
  } catch (error) {
    console.error("Error al actualizar observaciones:", error);
    res.status(500).send("Error al actualizar observaciones");
  }
};

// Obtener cantidad de nombres distintos en EventHv
const getDistinctNameHvCount = async (req, res) => {
  try {
    const count = await EventHv.count({
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name"],
        },
      ],
      distinct: true,
      distinct: true,
      col: "external_id",
      where: { delete_at: null },
    });
    return res.json(count);
  } catch (error) {
    console.error("Error al obtener cantidad de nombres distintos:", error);
    res.status(500).send("Error al obtener cantidad de nombres distintos");
  }
};

// Obtener eventos de EventHv agrupados por tipo de evento
const getEventsHvByEventType = async (req, res) => {
  try {
    const [events] = await sequelize.query("SELECT * FROM dbo.fn_geteventshvbyeventtype()");

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error al ejecutar el procedimiento almacenado:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener eventos agrupados" });
  }
};

// Detalle de un evento de EventHv
const getEventHvDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await EventHv.findOne({
      where: { id, delete_at: null },
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }
    return res.json(event);
  } catch (error) {
    console.error("Error al obtener detalle del evento:", error);
    res.status(500).send("Error al obtener detalle del evento");
  }
};

// Eliminar eventos duplicados en EventHv
const removeDuplicateEventsHv = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).send("El parámetro 'date' es requerido");
  }

  try {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    const [results] = await sequelize.query(
      "SELECT * FROM dbo.fn_removehikvisionduplicatesbydate(:date)",
      {
        replacements: { date: formattedDate },
      }
    );

    deleteAttachments(results);

    return res.json({ message: "Eventos duplicados eliminados" });
  } catch (error) {
    console.error("Error al eliminar duplicados:", error);
    res.status(500).send("Error al eliminar duplicados");
  }
};

// Eliminar archivos adjuntos de eventos duplicados
const deleteAttachments = (attachments) => {
  const attachmentsPath = path.join(__dirname, "../src/assets/attachments");

  attachments.forEach((attachment) => {
    const filePath = path.join(attachmentsPath, attachment.filename);

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(
            `Error al eliminar el archivo ${attachment.filename}:`,
            err
          );
        } else {
          console.log(`Archivo ${attachment.filename} eliminado exitosamente.`);
        }
      });
    } else {
      console.log(`El archivo ${attachment.filename} no existe.`);
    }
  });
};

// crear un evento

const createEventHv = async (req, res) => {
  try {
    // Extraer los datos del body de la peticion
    const {
      eventType,
      eventTime,
      dvrName,
      dvrSerialNumber,
      cameraName,
      status,
      observations,
      externalId
    } = req.body;

    // Validar campos obligatorios
    if (!eventType || !eventTime || !dvrName || !dvrSerialNumber || !externalId) {
      // Retornar error si falta algun campo requerido
      return res.status(400).json({
        message: "Faltan campos obligatorios: eventType, eventTime, dvrName, dvrSerialNumber, externalId"
      });
    }

    // Crear el evento en la base de datos
    const newEvent = await EventHv.create({
      event_type: eventType,
      event_time: eventTime,
      inbox_date: eventTime,
      dvr_name: dvrName,
      dvr_serial_number: dvrSerialNumber,
      camera_name: cameraName || null,
      status: status || "new",
      observations: observations || null,
      external_id: externalId
    });

    // Retornar el evento creado
    return res.status(201).json(newEvent);
  } catch (error) {
    // Manejo de errores
    console.error("Error al crear el evento Hikvision:", error);
    return res.status(500).json({ message: "Error al crear el evento Hikvision" });
  }
};

/**************************************************************************/
/*********************** Eventos de Samsung *******************************/
/**************************************************************************/

// Obtener todos los eventos de EventSamsung
const getEventsSamsung = async (req, res) => {
  const { startDate, endDate } = req.query;

  const newStartDate = formatDateTime(startDate);
  const newEndDate = formatDateTime(endDate, true);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Faltan los parámetros 'startDate' o 'endDate'");
  }

  try {
    const events = await EventSamsung.findAll({
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name", "supervisor", "status"],
        },
      ],
      where: {
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
        delete_at: null,
      },
      order: [["created_at", "DESC"]],
    });
    return res.json(events);
  } catch (error) {
    console.error("Error al obtener los eventos de Samsung:", error);
    res.status(500).send("Error al obtener los eventos de Samsung");
  }
};

// Obtener los últimos eventos de EventSamsung
const getLastEventsSamsung = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  try {
    const events = await EventSamsung.findAll({
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name"],
        },
      ],
      limit,
      limit,
      where: { delete_at: null },
      order: [["created_at", "DESC"]],
    });
    return res.json(events);
  } catch (error) {
    console.error("Error al obtener los últimos eventos de Samsung:", error);
    res.status(500).send("Error al obtener los últimos eventos de Samsung");
  }
};

// Actualizar el estado de un evento de EventSamsung
const updateEventSamsungStatus = async (req, res) => {
  const { id } = req.params;
  const { status, changedBy } = req.body;

  if (!status || !changedBy) {
    return res
      .status(400)
      .send("El campo 'status' y 'changedBy' son requeridos");
  }

  try {
    const event = await EventSamsung.findOne({
      where: { id, delete_at: null },
      include: [
        {
          model: Store,
          as: "store",
          attributes: ["name"],
        },
      ],
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }

    const previousStatus = event.status;

    //event.status = status;
    //await event.save();

    let eventName = event.event_name;
    console.log("event_name:", eventName);

    const colonIndex = eventName.indexOf(":");
    if (colonIndex !== -1) {
      eventName = eventName.substring(0, colonIndex);
      console.log("Nombre del evento extraído:", eventName);
    } else {
      console.log(
        "No se encontró ':' en event_name, manteniendo el valor completo"
      );
    }

    //console.log("estatus es " + status);

    //console.log("previousStatus es " + previousStatus);
    if (previousStatus !== status) {
      event.status = status;
      await event.save();

      console.log("estatus samsung es " + status);
      console.log("previousStatus samsung es " + previousStatus);

      //crear un historial de evento

      await LogHistory.create({
        model: "EventSamsung",
        user_id: changedBy,
        action: "Status Updated",
        details: JSON.stringify({
          previousStatus: previousStatus,
          newStatus: status,
          name: event.store.name,
          eventType: eventName,
          eventTime: event.event_time,
          createdAt: event.created_at,
        }),
      });


      const notificationsCount = await getNewNotificationsCount(req);
      console.log("nuevo conteo de notificaciones desde Samsung", notificationsCount);

    } else {
      console.log(
        "No se creo un historial de evento samsung porque el estado no cambió"
      );
    }

    return res.json(event);
  } catch (error) {
    console.error(
      "Error al actualizar el estado del evento de Samsung:",
      error
    );
    res.status(500).send("Error al actualizar el estado del evento de Samsung");
  }
};

// Actualizar observaciones de un evento de EventSamsung
const updateEventSamsungObservations = async (req, res) => {
  const { id } = req.params;
  const { observations } = req.body;

  if (!observations) {
    return res.status(400).send("El campo 'observations' es requerido");
  }

  try {
    const event = await EventSamsung.findOne({
      where: { id, delete_at: null },
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }
    event.observations = observations;
    await event.save();
    return res.json(event);
  } catch (error) {
    console.error(
      "Error al actualizar observaciones del evento de Samsung:",
      error
    );
    res
      .status(500)
      .send("Error al actualizar observaciones del evento de Samsung");
  }
};

// Obtener cantidad de nombres distintos en EventSamsung
const getDistinctNameSamsungCount = async (req, res) => {
  try {
    const count = await EventSamsung.count({
      distinct: true,
      distinct: true,
      col: "external_id",
      where: { delete_at: null },
    });
    return res.json(count);
  } catch (error) {
    console.error(
      "Error al obtener cantidad de nombres distintos en Samsung:",
      error
    );
    res
      .status(500)
      .send("Error al obtener cantidad de nombres distintos en Samsung");
  }
};

// Obtener eventos de EventSamsung agrupados por tipo de evento
const getEventsSamsungByEventType = async (req, res) => {
  try {
    const [events] = await sequelize.query("SELECT * FROM dbo.fn_geteventssamsungbyeventtype()");

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error al ejecutar el procedimiento almacenado:", error);
    return res
      .status(500)
      .json({ error: "Error al obtener eventos agrupados" });
  }
};

// Detalle de un evento de EventSamsung
const getEventSamsungDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await EventSamsung.findOne({
      where: { id, delete_at: null },
    });
    if (!event) {
      return res.status(404).send("Evento no encontrado");
    }
    return res.json(event);
  } catch (error) {
    console.error("Error al obtener detalle del evento de Samsung:", error);
    res.status(500).send("Error al obtener detalle del evento de Samsung");
  }
};

// Eliminar eventos duplicados en EventSamsung
const removeDuplicateEventsSamsung = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).send("El parámetro 'date' es requerido");
  }

  try {
    const formattedDate = moment(date).format("YYYY-MM-DD");
    await sequelize.query("SELECT * FROM dbo.fn_removesamsungduplicatesbydate(:date)", {
      replacements: { date: formattedDate },
    });
    return res.json({ message: "Eventos duplicados eliminados" });
  } catch (error) {
    console.error("Error al eliminar duplicados de Samsung:", error);
    res.status(500).send("Error al eliminar duplicados de Samsung");
  }
};

/**************************************************************************/
/*********************** Eventos Generales *******************************/
/**************************************************************************/

// Obtener cantidad de notificaciones nuevas
const getNewNotificationsCount = async (req, res) => {
  try {
    const samsungCount = await EventSamsung.count({ where: { status: "new", delete_at: null } });
    const hvCount = await EventHv.count({ where: { status: "new", delete_at: null } });

    const notifications = { samsung: samsungCount, hv: hvCount };

    if (req.io) {
      req.io.emit("new_notifications", notifications);
    } else {
      console.error("Socket.io no está disponible en req");
    }

    //return res.json(notifications);
    return notifications;
  } catch (error) {
    console.error("Error al obtener notificaciones nuevas:", error);
    res.status(500).send("Error al obtener notificaciones nuevas");
  }
};

// Obtener cantidad de notificaciones nuevas por rango de fechas
const getNewNotificationsCountByDate = async (req, res) => {
  const { startDate, endDate } = req.query;
  const newStartDate = formatDateTime(startDate);
  const newEndDate = formatDateTime(endDate, true);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Los campos 'startDate' y 'endDate' son requeridos");
  }

  try {
    const samsungNewCount = await EventSamsung.count({
      where: {
        status: "new",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const hvNewCount = await EventHv.count({
      where: {
        status: "new",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const samsungCompletedCount = await EventSamsung.count({
      where: {
        status: "completed",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const hvCompletedCount = await EventHv.count({
      where: {
        status: "completed",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const samsungPendingCount = await EventSamsung.count({
      where: {
        status: "pending",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const hvPendingCount = await EventHv.count({
      where: {
        status: "pending",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const samsungAssociatedCount = await EventSamsung.count({
      where: {
        status: "associated",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const hvAssociatedCount = await EventHv.count({
      where: {
        status: "associated",
        created_at: {
          [Op.between]: [new Date(newStartDate), new Date(newEndDate)],
        },
      },
    });

    const notifications = {
      samsung: {
        new: samsungNewCount,
        completed: samsungCompletedCount,
        pending: samsungPendingCount,
        associated: samsungAssociatedCount,
        total:
          samsungNewCount +
          samsungCompletedCount +
          samsungPendingCount +
          samsungAssociatedCount,
      },
      hv: {
        new: hvNewCount,
        completed: hvCompletedCount,
        pending: hvPendingCount,
        associated: hvAssociatedCount,
        total:
          hvNewCount + hvCompletedCount + hvPendingCount + hvAssociatedCount,
      },
    };

    return res.json(notifications);
  } catch (error) {
    console.error("Error al obtener las notificaciones nuevas:", error);
    res.status(500).send("Error al obtener las notificaciones nuevas");
  }
};

// Obtener el resumen de eventos por rango de fechas
const getTransitionSummary = async (req, res) => {
  const { startDate, endDate } = req.query;

  const newStartDate = formatDateTime(startDate);
  const newEndDate = formatDateTime(endDate, true);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Faltan los parámetros 'startDate' o 'endDate'");
  }

  try {
    const formattedStartDate = moment(newStartDate).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const formattedEndDate = moment(newEndDate).format("YYYY-MM-DD HH:mm:ss");

    const [eventsSummary] = await sequelize.query(
      "SELECT * FROM dbo.fn_gettransitionsummary(:startDate, :endDate)",
      {
        replacements: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      }
    );

    //if (!eventsSummary || eventsSummary.length === 0) {
    //  return res
    //    .status(404)
    //   .send("No se encontraron eventos en el rango de fechas proporcionado");
    //}

    return res.json(eventsSummary);
  } catch (error) {
    console.error("Error al obtener el resumen de eventos:", error);
    res.status(500).send("Error al obtener el resumen de eventos");
  }
};

// Obtener el historial de eventos en un rango de fechas
const getLogHistoryTimeline = async (req, res) => {
  const { startDate, endDate } = req.query;

  const newStartDate = formatDateTime(startDate);
  const newEndDate = formatDateTime(endDate, true);

  if (!startDate || !endDate) {
    return res
      .status(400)
      .send("Faltan los parámetros 'startDate' o 'endDate'");
  }

  try {
    const logHistory = await LogHistory.findAll({
      where: {
        created_at: {
          [Op.between]: [newStartDate, newEndDate],
        },
      },
      order: [["created_at", "DESC"]],
      limit: 100,
    });

    //if (logHistory.length === 0) {
    //  return res.status(404).send("No se encontraron eventos en el rango de fechas proporcionado");
    //}

    return res.json(logHistory);
  } catch (error) {
    console.error("Error al obtener el historial de eventos:", error);
    res.status(500).send("Error al obtener el historial de eventos");
  }
};

module.exports = {
  getNewNotificationsCountByDate,
  updateEventSamsungObservations,
  removeDuplicateEventsSamsung,
  getDistinctNameSamsungCount,
  getEventsSamsungByEventType,
  updateEventHvObservations,
  getNewNotificationsCount,
  updateEventSamsungStatus,
  removeDuplicateEventsHv,
  getDistinctNameHvCount,
  getEventsHvByEventType,
  getLogHistoryTimeline,
  getLastEventsSamsung,
  getEventSamsungDetail,
  getTransitionSummary,
  updateEventHvStatus,
  getEventHvDetail,
  getEventsSamsung,
  getLastEventsHv,
  getEventsHv,
  createEventHv,
};
