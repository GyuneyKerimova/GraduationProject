const { Resource, ResourceData, Data } = require("../models/models");
const ApiError = require("../error/apiError");
const FileService = require("../service/fileService");
const userService = require('../service/userService')

class ResourcesController {
  async create(req, res, next) {
    try {
      const { name, sectionId, data_r: info } = req.body;
      const { img } = req.files;

      console.log(img)

      let fileName = await FileService.saveFile(img);

      const maxOrderResource = await Resource.max("order", { where: { sectionId } });
      console.log(maxOrderResource);

      const order = maxOrderResource ? (parseInt(maxOrderResource) + 1) : 1;

      

      const resource = await Resource.create({
        name,
        order,
        sectionId,
        img: fileName,
      });

//
      const data = await Data.findAll({ where: { sectionId } });

      if (info) {
        const parsedData = JSON.parse(info);

        data.forEach((i) => {
          ResourceData.create({
            datumId: i.id,
            resourceId: resource.id
          });
        });

        parsedData.forEach((i) => {
          ResourceData.update({ title: i.description }, { where: { resourceId: resource.id, datumId: i.id } });
        });
      }

       
       const users = await userService.getAllUsers(); 
       users.forEach(async (user) => {
         console.log(user)
         if (user.role === "USER"){
           console.log(users.role)
           await userService.updateLevel(user.id, 1); 
         }
       });


      return res.json(resource);
    } catch (err) {
      next(ApiError.BadRequest(err.message));
    }
  }


  async getAll(req, res, next) {
    try {
      const { sectionId } = req.query;
      let resources;
      
      if (!sectionId) {
        resources = await Resource.findAndCountAll();
      } else {
        resources = await Resource.findAndCountAll({ 
          where: { sectionId }, 
          order: [['order', 'ASC']],
          include: [{ model: ResourceData, as: "data_r" }]
        });
      }
      
      return res.json(resources);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const resource = await Resource.findOne({
        where: { id },
        include: [{ model: ResourceData, as: "data_r"}],
      });
      return res.json(resource);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async update(req, res, next) {
    try {
      const {id, name} = req.body;
      if (!id) {
        return next(ApiError.BadRequest("ID не указан"));
      }
      const updatedResource = await Resource.update({ name }, {
        where: { id },
        returning: true,
      });
      return res.json(updatedResource[1][0]);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async updateData(req, res, next) {
    try {
      const { dataResourceId, description } = req.body;
      const updatedData = await ResourceData.update({ title: description }, {
        where: { id: dataResourceId },
        returning: true,
      });
      return res.json(updatedData[1][0]);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async updateOrder(req, res, next) {
    try {
      const { data } = req.body;
      
      const resources = JSON.parse(data);

      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const updated = await Resource.update({ order: resource.order }, { 
          where: { id: resource.id },
          returning: true,
        });
        console.log(updated);
      }

      const users = await userService.getAllUsers(); 
       users.forEach(async (user) => {
         console.log(user)
         if (user.role === "USER"){
           console.log(users.role)
           await userService.updateLevel(user.id, 1); 
         }
       });
      
      return res.json(true);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.BadRequest("ID не указан"));
      }
      const resource = await Resource.findOne({ where: { id } });
  
      if (!resource) {
        return next(ApiError.BadRequest("Ресурс не найден"));
      }

      if (resource.img) {
        await FileService.deleteFile(resource.img);
      }
      const deletedResource = await Resource.destroy({ where: { id } });
      console.log('УСПЕШНО УДАЛИЛ ИЗ СЕРВЕРА')

      const users = await userService.getAllUsers(); 
      users.forEach(async (user) => {
        console.log(user)
        if (user.role === "USER"){
          await userService.updateLevel(user.id, 1); 
        }
      });
      
      return res.json(deletedResource);
    } catch (err) {
      next(ApiError.BadRequest(err.message));
    }
  }






  async updateImage(req, res, next) {
    try {
      const { id } = req.body;


      const { img } = req.files;

      let fileName = await FileService.saveFile(img);
      
      const resource = await Resource.findOne({ where: { id } });

      console.log(img)
  
      if (!resource) {
        return next(ApiError.NotFound("Ресурс не найден"));
      }

      if (resource.img) {
        await FileService.deleteFile(resource.img);
      }
     
      const updatedResource = await Resource.update({ img: fileName}, {
        where: { id },
        returning: true,
      });


      return res.json(updatedResource[1][0]);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }





  async deleteImage(req, res, next) {
    try {
      const { id } = req.params;
      const resource = await Resource.findOne({ where: { id } });
  
      if (!resource) {
        return next(ApiError.NotFound("Ресурс не найден"));
      }
  
      if (resource.img) {
        // Удалите изображение
        await FileService.deleteFile(resource.img);
  
        return res.json(updatedResource[1][0]);
      } else {
        return next(ApiError.BadRequest("У ресурса нет изображения для удаления"));
      }
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }
}






module.exports = new ResourcesController();







