const { default: axios } = require("axios");
const xlsx = require('json-as-xlsx');
const { request_yandex, logs } = require("./common_utils");

exports.searchMarketBestPriceBySku = async (settings, sku) => {
    try {
        let request
        let result = []
        for (let i = 0; i < sku.length; i++) {
            try {
                const options = {
                    method: "GET",
                    url: "https://partner.market.yandex.ru/api/fulfillment/search-market-sku",
                    responseType: "json",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Encoding": "application/json",
                        "sk": settings.secretKey,
                        "Cookie": settings.cookie
                    },
                    charset: "utf8",
                    responseEncodig: "utf8",
                    params: {
                        businessId: settings.businessId,
                        marketSku: sku[i],
                        page: 1
                    }
                }

                request = await axios.request(options)
                let data = request.data.data.result

                logs({
                    type: 'debug',
                    show: settings.show_error,
                    message: '#' + (i + 1) + ' / ' + sku.length
                });

                for (let l = 0; l < data.length; l++) {
                    for (let k = 0; k < data[l].model.reasonsToBuy.length; k++) {
                        if (data[l].model.reasonsToBuy[k].id == 'viewed_n_times') {
                            // console.log(data[l]);
                            // console.log(data[l].model.reasonsToBuy[k].value);
                            result.push({ sku: data[l].sku, barcode: sku[i], viewed_n_times: data[l].model.reasonsToBuy[k].value })
                            // console.log(result);
                            logs({
                                type: 'info',
                                show: settings.show_error,
                                message: 'SUCCESS SKU: ' + sku[i]
                            });
                        } else {
                            logs({
                                type: 'warning',
                                show: settings.show_error,
                                message: 'WARNING SKU: ' + sku[i]
                            });
                        }
                    }
                }
            } catch (error) {
                let log = request_yandex(error, settings.show_error)
                if (log == false) return false

                logs({
                    type: 'error',
                    show: settings.show_error,
                    message: 'ERROR SKU: ' + sku[i]
                });
            }
        }

        return result
    } catch (error) {
        console.log(error);
        logs({
            type: 'error',
            show: settings.show_error,
            message: error
        });
        return false
    }
}

exports.prepareExcelFile = (settings, layout, data) => {
    try {
        for (let i = 0; i < data.length; i++) {
            for (let k = 0; k < settings.file[layout[0].name].length; k++) {
                if (data[i].barcode == settings.file[layout[0].name][k][layout[0].field_sku]) {
                    settings.file[layout[0].name][k].viewed_n_times = data[i].viewed_n_times
                    settings.file[layout[0].name][k].sku = parseInt(data[i].sku.replace(/[^0-9\s]/g, ''));
                    // console.log(settings.file[layout[0].name]);
                }
            }
        }

        // console.log(settings.file[layout[0].name]);
        return settings
    } catch (error) {
        logs({
            type: 'error',
            show: settings.show_error,
            message: error
        });
        return false
    }
}

exports.generateExcelFile = (settings, prepare, layout, name_file, limit) => {
    try {
        let data = [
            {
                sheet: 'Product',
                columns: [
                    { label: 'Наименование Товара', value: 'name' },
                    { label: 'SKU - товара', value: 'sku' },
                    { label: 'Штрих код', value: 'barcode' },
                    { label: 'Мин.отгузка', value: 'count' },
                    { label: 'Цена(опт.)', value: 'price' },
                    { label: 'Balance', value: 'balance' },
                    { label: 'Просмотры за 2 месяца', value: 'tomonths' },
                ],
            },
        ];

        data[0].content = [];

        for (let i = 0; i < prepare.file[layout[0].name].length; i++) {
            if (typeof parseInt(prepare.file[layout[0].name][i].B) == 'number' && prepare.file[layout[0].name][i]['viewed_n_times'] > limit) {
                let obj = {
                    name: prepare.file[layout[0].name][i].A,
                    sku: prepare.file[layout[0].name][i]['sku'],
                    barcode: prepare.file[layout[0].name][i].B,
                    count: prepare.file[layout[0].name][i].C,
                    price: prepare.file[layout[0].name][i].D,
                    balance: prepare.file[layout[0].name][i].E,
                    tomonths: prepare.file[layout[0].name][i]['viewed_n_times']
                }
                data[0].content.push(obj);
            }
        }

        let settings = {
            fileName: name_file, // Name of the resulting spreadsheet
        };

        logs({
            type: 'sponsor',
            show: settings.show_error,
            message: 'ПРОГРАММА ЗАВЕРШИЛА РАБОТУ'
        });

        xlsx(data, settings);
    } catch (error) {
        logs({
            type: 'error',
            show: settings.show_error,
            message: error
        });
        return false
    }
}