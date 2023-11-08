const { default: axios } = require("axios");
const { sleep, isPositiveInteger, logs, request_yandex } = require("../src/common_utils");

exports.updateMarketProduct = async (settings) => {
    try {
        let product = settings.file.Product
        let request

        for (let i = 0; i < product.length; i++) {
            try {
                if (isPositiveInteger(product[i].sku)) {
                    const options = {
                        method: "POST",
                        url: "https://api.partner.market.yandex.ru/businesses/" + settings.businessId + "/offer-mappings/update",
                        responseType: "json",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept-Encoding": "application/json",
                            "Authorization": 'Bearer ' + settings.token,
                        },
                        charset: "utf8",
                        responseEncodig: "utf8",
                        data: {
                            offerMappings:
                                [{
                                    offer: {
                                        offerId: product[i].sku,
                                        // barcodes: [product[i].barcode],
                                        // weightDimensions: {
                                        //     length: product[i].length,
                                        //     width: product[i].width,
                                        //     height: product[i].height,
                                        //     weight: product[i].weight
                                        // },
                                        // purchasePrice: {
                                        //     value: product[i].price,
                                        //     currencyId: "RUR"
                                        // }
                                    },
                                    mapping: {
                                        marketSku: product[i].sku
                                    }
                                }]
                        }
                    }
                    // 16:09 было отправлено на проверку

                    request = await axios.request(options)


                    logs({
                        type: 'debug',
                        show: settings.show_error,
                        message: '#' + (i + 1) + ' / ' + product.length
                    });
                    // console.log(request);
                    if (request.status == 200) {
                        logs({
                            type: 'info',
                            show: settings.show_error,
                            message: 'SUCCESS SKU: ' + product[i].sku
                        });
                    } else {
                        logs({
                            type: 'warning',
                            show: settings.show_error,
                            message: 'WARNING SKU: ' + product[i].sku
                        });
                    }
                    sleep(1)
                }
            } catch (error) {
                console.log(error.response.data);
                let log = request_yandex(error, settings.show_error)
                if (log == false) return false

                logs({
                    type: 'error',
                    show: settings.show_error,
                    message: 'ERROR SKU: ' + product[i].sku
                });
            }
        }

        logs({
            type: 'sponsor',
            show: settings.show_error,
            message: 'ПРОГРАММА ЗАВЕРШИЛА РАБОТУ'
        });
    } catch (error) {
        logs({
            type: 'error',
            show: settings.show_error,
            message: 'Проблема с чтением файла. Прикрепите файл, который создала программа'
        });
        return false
    }
}