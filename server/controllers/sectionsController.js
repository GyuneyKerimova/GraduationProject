const { Resource, Section, Data, ResourceData } = require("../models/models");
const ApiError = require("../error/apiError");
const userService = require('../service/userService')

class SectionsController {
  async create(req, res, next) {
    try {
      const { name, data: info } = req.body; 
      const maxOrderSection = await Section.max("order");
      console.log(maxOrderSection)
      const order = maxOrderSection ? (parseInt(maxOrderSection) + 1) : 1;
      console.log('Новое значение')
      console.log(order)

      const section = await Section.create({ name, order});

      if (info) {
        const parsedData = JSON.parse(info);
        parsedData.forEach(async (i) => {
          Data.create({
            title: i.title,
            description: i.description,
            sectionId: section.id,
          });

        });
      }
      return res.json(section);
    } 
    catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }


  async getAll(req, res, next) {
    try {
      const sections = await Section.findAll({
        order: [['order', 'ASC']]
      });  
      return res.json(sections);
    } 
    catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const section = await Section.findOne({
        where: { id },
        include: [{ model: Data, as: "data" }],
      });
      return res.json(section);
    } 
    catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async update(req, res, next) {
    try{
      const {name, id} = req.body
      if(!id) {
        next(ApiError.BadRequest("ID не указан"))
      }
      const updatedSection = await Section.update({ name }, {
        where: { id },
        returning: true,
      });
      return res.json(updatedSection[1][0]);
    } 
    catch(err) {
      next(ApiError.InternalError(err.message))
    }
  }

  async updateOrder(req, res, next) {
    try {
      const { data } = req.body;
      
      const sections = JSON.parse(data);
      console.log(sections);
      console.log('ПРОВЕРКА');
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const updated = await Section.update({ order: section.order }, {
          where: { id: section.id },
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
    try{
      const { id } = req.params;
      if(!id) {
        next(ApiError.BadRequest('ID не указан'))
      }
      const deletedSection = await Section.destroy({where: {id}})
      return res.json(deletedSection)
    }
    catch (err) {
      next(ApiError.InternalError(err.message))
    }

  }

  async updateData(req, res, next) {
    try {
      const { id, title, description } = req.body;
      const updatedData = await Data.update({ title, description }, {
        where: { id },
        returning: true,
      });
      return res.json(updatedData[1][0]);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async deleteData(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.BadRequest('ID записи не указан'));
      }
  
      // Удаляем запись из Data
      const deletedData = await Data.destroy({ where: { id } });
  
      // Удаляем связанные записи из таблицы ResourceData
      await ResourceData.destroy({ where: { datumId: id } });
  
      return res.json({ success: deletedData === 1 });
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }

  async createData(req, res, next) {
    try {
      const { sectionId, data: info } = req.body;
      if (!info) {
        return res.status(400).json({ error: "No data provided" });
      }
  //
      const parsedData = JSON.parse(info);
      const createdData = [];
  
      for (const i of parsedData) {
        // Создаем новую запись в Data
        const newData = await Data.create({
          title: i.title,
          description: i.description,
          sectionId: sectionId,
        });
  
        createdData.push(newData);
  
        // Создаем новую запись в ResourceData для всех ресурсов с тем же sectionId
        const resources = await Resource.findAll({ where: { sectionId } });
        for (const resource of resources) {
          await ResourceData.create({
            title: "",
            datumId: newData.id,
            resourceId: resource.id,
          });
        }
      }
  
      return res.json(createdData);
    } catch (err) {
      next(ApiError.InternalError(err.message));
    }
  }
  
}
module.exports = new SectionsController();


