/** @format */
const excelToJson = require('convert-excel-to-json');
const { getNameSheets, getGeneralSheets, getSKU } = require('./extract_data_from_file')
const { searchMarketBestPriceBySku, prepareExcelFile, generateExcelFile } = require('./viewed_n_times');
const { updateMarketProduct } = require("./offer_mappings_update");
const { request_yandex } = require("./common_utils");

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
exports.viewed_n_times = async (data = '') => {
    try {
        if (data == '') throw 'Не передана никакая информация'

        const secretKey = data.sk // sk - Секретный ключ (берем с Yandex)
        // Cookie - это куки (берем с Yandex)
        const cookie = data.cookie
        const businessId = data.businessId // номер магазина в Яндекс (берем с Yandex)

        const file = excelToJson({
            sourceFile: data.file + '.xlsx', // Указать путь до файла с данными от поставщика
        });

        const name_file = data.new_file  // название нового файла EXCEL
        const limit = data.limit // От какого количиства просмотров ищем

        const show_error = data.show_error

        // if (data.sheets == undefined) throw 'Нет информации о листах'

        const sheets = [{
            sheet: 0,
            field_sku: data.field_sku.toUpperCase(),
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
                cookie: cookie,
                show_error: show_error
            }

            let generalSheets = getGeneralSheets(settings);
            if (generalSheets == false) return false

            let sku = getSKU(settings, generalSheets);
            if (sku == false) return false

            let marketBestPriceBySku = await searchMarketBestPriceBySku(settings, sku);
            if (marketBestPriceBySku == false) return false

            let prepare = prepareExcelFile(settings, generalSheets, marketBestPriceBySku)
            if (prepare == false) return false

            let excelfile = generateExcelFile(settings, prepare, generalSheets, name_file, limit)
            if (excelfile == false) return false

        }

        let func_start = await start()
        if (func_start == false) return false
        else return true

    } catch (error) {
        console.log(error);
        let log = request_yandex(error, data.show_error)
        if (log == false) return false
    }
}

/*
    https://oauth.yandex.ru/authorize?response_type=token&client_id=39ec63b2bf834d9782a1eac62bf1e5ec
    token
    businessId
    file
// */
// exports.offer_mappings_update = async (data = '') => {
//     try {
//         if (data == '') throw 'Не передана никакая информация'

//         const token = data.token

//         const businessId = data.businessId // номер магазина в Яндекс (берем с Yandex)

//         const show_error = data.show_error

//         const file = excelToJson({
//             sourceFile: data.file + '.xlsx', // Указать путь до файла с данными от поставщика
//             columnToKey: {
//                 A: 'name',
//                 B: 'sku',
//                 C: 'barcode',
//                 D: 'count',
//                 E: 'price',
//                 F: 'balance',
//                 G: 'length',
//                 H: 'width',
//                 I: 'height',
//                 J: 'weight',
//                 K: 'tomonths'
//             }
//         });

//         // if (data.sheets == undefined) throw 'Нет информации о листах'

//         const sheets = [{
//             sheet: 0,
//             field_sku: 'sku',
//             priority: 0
//         }]

//         const nameSheets = getNameSheets(file, sheets)
//         if (nameSheets == false) return false

//         async function start() {
//             let settings = {
//                 nameSheets: nameSheets,
//                 file: file,
//                 token: token,
//                 businessId: businessId,
//                 show_error: show_error
//             }

//             let generalSheets = getGeneralSheets(settings);
//             if (generalSheets == false) return false

//             let sku = getSKU(settings, generalSheets);
//             if (sku == false) return false

//             let marketProduct = await updateMarketProduct(settings)
//             if (marketProduct == false) return false
//         }

//         let func_start = await start()
//         if (func_start == false) return false
//         else return true
//     } catch (error) {
//         let log = request_yandex(error, data.show_error)
//         if (log == false) return false
//     }
// }

