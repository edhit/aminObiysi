// this.viewed_n_times()
require("dotenv").config()
const inquirer = require('inquirer');
const { viewed_n_times, offer_mappings_update } = require("./src/init");

function func_viewed_n_times(data) {
    inquirer
        .prompt([
            {
                name: 'field_sku',
                message: 'Столбец, где находяться SKU в вашем файле',
                default: process.env.field_sku
            },
            {
                name: 'new_file',
                message: 'Название нового файле (должен находиться в корне папки проекта)',
                default: process.env.new_file
            },
            {
                name: 'limit',
                message: 'Сколько посмотрела за 2 месяца (ваше число) и больше',
                default: process.env.limit
            },
            {
                name: 'businessId',
                message: 'Бизнес ID',
                default: process.env.businessId
            },
            {
                name: 'sk',
                message: 'Секртный ключ ЯНДЕКСА',
                default: process.env.sk
            },
            {
                name: 'cookie',
                message: 'Куки ЯНДЕКСА',
                default: process.env.cookie
            },
        ]).then(answers => {
            let object = { ...data, ...answers };

            viewed_n_times(object)
        })
}

function func_offer_mappings_update(data) {
    inquirer
        .prompt([
            {
                name: 'businessId',
                message: 'Бизнес ID',
                default: process.env.businessId
            },
            {
                name: 'token',
                message: 'Токен ЯНДЕКСА',
                default: process.env.token
            },
        ]).then(answers => {
            let object = { ...data, ...answers };

            offer_mappings_update(object)
        })
}

inquirer
    .prompt([
        {
            type: 'rawlist',
            name: 'function',
            message: 'Что будем делать?',
            choices: [
                {
                    name: 'Извлечь количество просмотров за 2 месяца',
                    value: 'viewed_n_times',
                },
                {
                    name: 'Опубликовать товар по его SKU (Нужен файл, который сделала программа)',
                    value: 'offer_mappings_update',
                },
            ],
        },
        {
            type: 'rawlist',
            name: 'show_error',
            message: 'Показывать ошибки',
            choices: [
                {
                    name: 'Да',
                    value: true,
                },
                {
                    name: 'Нет',
                    value: false,
                },
            ],
        },
        {
            name: 'file',
            message: 'Файл с которым будем работать (должен находиться в корне папки проекта)',
            default: process.env.file
        },
    ])
    .then(answers => {
        if (answers.function == 'viewed_n_times') {
            func_viewed_n_times(answers)
        } else if (answers.function == 'offer_mappings_update') {
            func_offer_mappings_update(answers)
        }
    });
