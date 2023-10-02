const { default: axios } = require("axios");
const { sleep, logger, isPositiveInteger, separator } = require("./common_utils");

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
                                        weightDimensions: {
                                            length: product[i].length,
                                            width: product[i].width,
                                            height: product[i].height,
                                            weight: product[i].weight
                                        },
                                        purchasePrice: {
                                            value: product[i].price,
                                            currencyId: "RUR"
                                        }
                                    },
                                    currencyId: {
                                        marketSku: product[i].sku
                                    }
                                }]
                        }
                    }


                    request = await axios.request(options)

                    separator(i + 1, product)

                    if (request.status == 200) {
                        console.log('SUCCESS: SKU: ' + product[i].sku);
                    }
                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                    sleep(1)
                }
            } catch (error) {
                let log = logger(error)
                if (log == false) return false

                console.log('error: SKU: ' + product[i].sku);
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            }
        }
        console.log("ПРОГРАММА ЗАВЕРШИЛА РАБОТУ");
    } catch (error) {
        console.log(error);
        return false
    }
}