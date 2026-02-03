const { getPresignedUrl } = require("../services/s3Service");

const getAttachment = async (req, res) => {
  const { type, filename } = req.params;

  console.log(`Getting attachment for type: ${type}, filename: ${filename}`);

  let keyPrefix = "";
  if (type === "hv") {
    keyPrefix = "retail/cctv/hv/";
  } else if (type === "samsung") {
    keyPrefix = "retail/cctv/samsung/";
  } else {
    return res.status(400).send("Tipo de archivo inválido");
  }

  const key = `${keyPrefix}${filename}`;

  try {
    const url = await getPresignedUrl(key);
    if (!url) {
      return res.status(404).send("Archivo no encontrado o error al generar URL");
    }

    // redireccionar a la URL firmada de S3
    return res.redirect(url);
  } catch (error) {
    console.error("Error en getAttachment:", error);
    return res.status(500).send("Error interno del servidor");
  }
};

module.exports = {
  getAttachment,
};
