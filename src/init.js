/** @format */
require("dotenv").config()

const excelToJson = require('convert-excel-to-json');
const { getNameSheets, getGeneralSheets, getSKU } = require('./extract_data_from_file')
const { searchMarketBestPriceBySku, prepareExcelFile, generateExcelFile } = require('./viewed_n_times');
const { updateMarketProduct } = require("./offer_mappings_update");

/*
    secretKey
    cookie
    businessId
    file
    name_file
    field_data
    limit
    sheets: [{
        sheet: 0,
        field_sku: 'B',
        priority: 0
    }]
*/
exports.viewed_n_times = async (data = []) => {
    const secretKey = process.env.sk // sk - Секретный ключ (берем с Yandex)
    // Cookie - это куки (берем с Yandex)
    const cookie = process.env.cookie
    const businessId = process.env.businessId // номер магазина в Яндекс (берем с Yandex)

    const file = excelToJson({
        sourceFile: process.env.file + '.xlsx', // Указать путь до файла с данными от поставщика
    });
    const name_file = process.env.new_file  // название нового файла EXCEL
    const limit = process.env.limit // От какого количиства просмотров ищем

    const sheets = [{
        sheet: 0,
        field_sku: process.env.field_sku,
        priority: 0
    }]

    const nameSheets = getNameSheets(file, sheets)
    if (nameSheets == false) return false

    async function start() {
        let settings = {
            nameSheets: nameSheets,
            file: file,
            secretKey: secretKey,
            businessId: businessId,
            cookie: cookie
        }

        let generalSheets = getGeneralSheets(settings);
        if (generalSheets == false) return false

        let sku = getSKU(settings, generalSheets);
        if (sku == false) return false

        let marketBestPriceBySku = await searchMarketBestPriceBySku(settings, sku);
        if (marketBestPriceBySku == false) return false

        let prepare = prepareExcelFile(settings, generalSheets, marketBestPriceBySku)
        if (prepare == false) return false

        let excelfile = generateExcelFile(prepare, generalSheets, name_file, limit)
        if (excelfile == false) return false
    }

    let func_start = await start()
    if (func_start == false) return false
    else return true
}

/*
    token
    businessId
    file
*/
exports.offer_mappings_update = async (data = '') => {
    const token = process.env.token

    const businessId = process.env.businessId // номер магазина в Яндекс (берем с Yandex)

    const file = excelToJson({
        sourceFile: process.env.file + '.xlsx', // Указать путь до файла с данными от поставщика
        columnToKey: {
            A: 'name',
            B: 'sku',
            C: 'barcode',
            D: 'count',
            E: 'price',
            F: 'balance',
            G: 'length',
            H: 'width',
            I: 'height',
            J: 'weight',
            K: 'tomonths'
        }
    });

    async function start() {
        let settings = {
            file: file,
            token: token,
            businessId: businessId
        }

        let marketProduct = await updateMarketProduct(settings)
        if (marketProduct == false) return false

    }

    let func_start = await start()
    if (func_start == false) return false
    else return true
}

this.viewed_n_times()