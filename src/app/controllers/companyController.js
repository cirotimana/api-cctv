const Company = require("../models/Company");

// Obtener todas las companies
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { delete_at: null },
    });
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// Obtener company por ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({
      where: { id, delete_at: null },
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
};
