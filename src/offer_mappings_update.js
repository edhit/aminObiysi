const { default: axios } = require("axios");
const { sleep } = require("./common_utils");

exports.updateMarketProduct = async (settings) => {
    try {
        let request
        let result = []

        for (let i = 0; i < sku.length; i++) {
            try {
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
                    params: {
                        offerMappings: [
                            {
                                offer: {
                                    offerId: sku[i],
                                    weightDimensions: {
                                        length: 65.55,
                                        width: 50.7,
                                        height: 20,
                                        weight: 1.001
                                    },
                                    purchasePrice: {
                                        value: 0,
                                        currencyId: "RUR"
                                    }
                                },
                                mapping: {
                                    marketSku: sku[i]
                                }
                            }
                        ]

                    }
                }

                request = await axios.request(options)
            } catch (error) {
                let log = logger(error)
                if (log == false) return false

                console.log('error: SKU: ' + sku[i]);
                console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            }
        }

    } catch (error) {
        console.log(error);
        return false
    }
}