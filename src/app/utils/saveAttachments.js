const fs = require('fs').promises;
const path = require('path');

const attachmentsDir = path.join(__dirname, '../../../src/assets/attachments');

async function saveAttachmentLocally(content, filename) {
  

  const filePath = path.join(attachmentsDir, filename);

  // Asegúrate de que el directorio existe
  try {
      await fs.mkdir(attachmentsDir, { recursive: true });
  } catch (err) {
      console.error("Error al crear el directorio para adjuntos", err);
      throw err;
  }

  // Guarda el archivo
  try {
      await fs.writeFile(filePath, content);
      return filePath;
  } catch (err) {
      console.error("Error al guardar el archivo adjunto", err);
      throw err;
  }
}

module.exports = {
  saveAttachmentLocally
};