const { sequelize } = require("../../config/database");
const DvrStatus = require("../models/DvrStatus");
const Company = require("../models/Company");
const Store = require("../models/Store");

const createDvrStatus = async (req, res) => {
  try {
    const {
      dvr_name,
      notification_email_in,
      notification_email_out,
      remote_connection_tool,
      remote_connection_id,
      status,
      notes,
      store_ceco,
    } = req.body;

    const dvrStatus = await DvrStatus.create({
      dvr_name,
      notification_email_in,
      notification_email_out,
      remote_connection_tool,
      remote_connection_id,
      status,
      notes,
      store_ceco,
    });

    res.status(201).json({
      message: "DVR Status created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating DVR Status", message: error.errors[0].message });
  }
};

const getDvrStatus = async (req, res) => {
  try {
    const dvrStatus = await DvrStatus.findOne({
      where: { id: req.params.id, delete_at: null },
      include: {
        model: Store,
        as: "store",
        attributes: ["id", "name", "ceco", "company_id", "status"],
      },
    });

    if (!dvrStatus) {
      return res.status(404).json({ error: "DVR Status not found" });
    }

    res.status(200).json(dvrStatus);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const getAllDvrStatus = async (req, res) => {
  try {
    const dvrStatusList = await DvrStatus.findAll({
      where: { delete_at: null },
      include: {
        model: Store,
        as: "store",
        attributes: ["id", "name", "ceco", "supervisor", "status"],
        include: {
          model: Company,
          as: "company",
          attributes: ["id", "name"],
        },
      },
    });
    res.status(200).json(dvrStatusList);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updateDvrStatus = async (req, res) => {
  try {
    const dvrStatus = await DvrStatus.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!dvrStatus) {
      return res.status(404).json({ error: "DVR Status not found" });
    }

    const {
      dvr_name,
      notification_email_in,
      notification_email_out,
      remote_connection_tool,
      remote_connection_id,
      status,
      notes,
    } = req.body;

    const fieldsToUpdate = {
      dvr_name,
      notification_email_in,
      notification_email_out,
      remote_connection_tool,
      remote_connection_id,
      status,
      notes,
    };

    Object.keys(fieldsToUpdate).forEach((key) => {
      if (fieldsToUpdate[key] !== undefined) {
        dvrStatus[key] = fieldsToUpdate[key];
      }
    });

    await dvrStatus.save();
    res.status(200).json(dvrStatus);
  } catch (error) {
    res.status(500).json({ error: "Error updating DVR Status" });
  }
};

const deleteDvrStatus = async (req, res) => {
  try {
    const dvrStatus = await DvrStatus.findOne({
      where: { id: req.params.id, delete_at: null },
    });
    if (!dvrStatus) {
      return res.status(404).json({ error: "DVR Status not found" });
    }
    await dvrStatus.update({ delete_at: new Date() });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting DVR Status" });
  }
};

const updateDvrStatusState = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("Updating DVR Status state:", id, status.status);

  try {
    const dvrStatus = await DvrStatus.findOne({
      where: { id, delete_at: null },
    });

    if (!dvrStatus) {
      return res.status(404).json({ message: "DVR Status not found" });
    }

    dvrStatus.status = status;
    await dvrStatus.save();

    return res.status(200).json(dvrStatus);
  } catch (error) {
    console.error("Error updating DVR Status state:", error);
    return res.status(500).json({ error: "Error updating DVR Status state" });
  }
};

const getStoreStatusCounts = async (req, res) => {
  try {
    const [results] = await sequelize.query("SELECT * FROM dbo.fn_getstorestatuscounts()");
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in getStoreStatusCounts:", error);
    res.status(500).json({
      error: "Error retrieving store status counts",
      message: error.message,
    });
  }
};

module.exports = {
  updateDvrStatusState,
  getStoreStatusCounts,
  getAllDvrStatus,
  createDvrStatus,
  updateDvrStatus,
  deleteDvrStatus,
  getDvrStatus,
};
