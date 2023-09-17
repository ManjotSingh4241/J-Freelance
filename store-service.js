// const fs = require("fs");

// var items = [];
// var categories = [];

const Sequelize = require('sequelize');

var sequelize = new Sequelize('xhkxmmhg', 'xhkxmmhg', 'GPsyEzj9RI8Vp69swyilvVVqru725p-Z', {
    host: 'rajje.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Item = sequelize.define("item", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE,
})
const Category = sequelize.define("Category", {
    category: Sequelize.STRING,
})

Item.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = function () {

    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to sync the database");
            })
    });

};

module.exports.getAllItems = function () {

    return new Promise((resolve, reject) => {
        Item.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};

module.exports.getPublishedItems = function () {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};

module.exports.getPublishedItemsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true,
                category: category,
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};


module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};

module.exports.addItem = function (itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = (itemData.published) ? true : false;
        for (const i in itemData) {
            if (itemData[i] === "") {
                itemData[i] = null;
            }
        }
        itemData.postDate = new Date();

        Item.create(itemData)
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to create post");
            })
    });

};


module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                category: category,
            }
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            })
        reject();
    });

};

module.exports.getItemsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
            .then((data) => {
                resolve(data)
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};

module.exports.getItemById = function (id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id
            }
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("no results returned");
            })
    });

};

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject) => {
        for (let i in categoryData) {
            if (categoryData[i] === "") {
                categoryData[i] = null;
            }
        }
        Category.create(categoryData)
            .then((category) => {
                resolve(category);
            })
            .catch(() => {
                reject("unable to create category");
            });
    });
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject) => {
        Category.destroy({ where: { id }
    })
            .then(() => {
                console.log(`Deleted ${id}`);
                resolve("Destroyed");
            })
            .catch(() => {
                reject("Unable to delete Category");
            });
    });
}

module.exports.deleteItemById = function(id){
    return new Promise((resolve, reject)=>{
        Item.destroy({where:{id}})
        .then(()=>{
            resolve("Destroyed")
        })
        .catch(()=>{
            reject('Unable to delte Item')
        })
    })
}
