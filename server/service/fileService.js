const uuid = require("uuid");
const path = require("path");

const fs = require("fs");

class FileService {
  async saveFile(file) {
    try {
      const fileName = uuid.v4() + ".jpg";
      file.mv(path.resolve(__dirname, "..", "static", fileName));
      return fileName;
    } catch (err) {
      console.error(err);
      return "Произошла ошибка при сохранении файла";
    }
  }

  async deleteFile(fileName) {
    try {
      fs.unlinkSync(path.resolve(__dirname, "..", "static", fileName));
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new FileService();
