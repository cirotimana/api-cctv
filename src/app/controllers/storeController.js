const { sequelize } = require("../../config/database");
const Company = require("../models/Company");
const Store = require("../models/Store");
const xlsx = require("node-xlsx");

// Obtener todas las stores
const getStores = async (req, res) => {
  try {
    const stores = await Store.findAll({
      where: { delete_at: null },
      include: [{ model: Company, as: "company" }],
    });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Obtener store por ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOne({
      where: { id, delete_at: null },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener la cantidad de stores por estado
const getStoreStatusCounts = async (req, res) => {
  try {
    const [results] = await sequelize.query("SELECT * FROM sch_cctv.fn_gettotalstoresbystatus()");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in getStoreStatusCounts:", error);
    res.status(500).json({
      error: "Error retrieving store status counts",
      message: error.message,
    });
  }
};

// Eliminar una store por ID
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findOne({
      where: { id, delete_at: null },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    await store.update({ delete_at: new Date() });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una store en todos los campos id, name, ceco, supervisor, company_id, status
const updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const { name, ceco, supervisor, company_id, status } = req.body;

    const fieldsToUpdate = {
      name,
      ceco,
      supervisor: supervisor ? JSON.stringify(supervisor) : undefined,
      company_id,
      status,
    };

    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] !== undefined) {
        store[key] = fieldsToUpdate[key];
      }
    });

    await store.save();
    res.status(200).json(store);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "ceco already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Crear una store
const createStore = async (req, res) => {
  try {
    const { name, ceco, supervisor, company_id, status } = req.body;

    const store = await Store.create({
      name,
      ceco,
      supervisor: JSON.stringify(supervisor),
      company_id,
      status,
    });

    res.status(201).json({
      message: "Store created successfully",
      id: store.id,
      name: store.name,
      ceco: store.ceco,
      supervisor: store.supervisor,
      company_id: store.company_i,
      status: store.status,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "ceco already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Guardar archivo Excel en la base de datos
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workSheets = xlsx.parse(req.file.buffer);
    const rows = workSheets[0].data;

    for (let i = 1; i < rows.length; i++) {
      const [
        name,
        ceco,
        company_id,
        status,
        supervisor,
        phone,
        area_manager,
        zone,
        subzone,
        connection_user,
      ] = rows[i];

      await DvrControl.update(
        {
          name: name,
          company_id: company_id,
          status: status,
          supervisor: JSON.stringify({
            name: supervisor,
            phone: phone,
            area_manager: area_manager,
            zone: zone,
            subzone: subzone,
            connection_user: connection_user,
          }),
        },
        {
          where: { ceco: ceco },
        }
      );
    }

    res.status(200).json({ message: "Datos actualizados correctamente" });
  } catch (error) {
    console.error("Error al importar el archivo Excel:", error);
    res.status(500).json({
      error: "Error al importar el archivo Excel",
      message: error.message,
    });
  }
};

module.exports = {
  getStoreStatusCounts,
  getStoreById,
  createStore,
  deleteStore,
  updateStore,
  uploadFile,
  getStores,
};
