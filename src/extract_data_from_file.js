exports.getNameSheets = (file, sheets) => {
    try {
        let nameSheets = []
        for (let i = 0; i < Object.keys(file).length; i++) {
            for (let k = 0; k < sheets.length; k++) {
                if (sheets[k].sheet == i) {
                    nameSheets.push(
                        {
                            name: Object.keys(file)[i],
                            field_sku: sheets[k].field_sku,
                            priority: sheets[k].priority,
                        })
                }
            }
        }

        return nameSheets
    } catch (error) {
        console.log(error);
        return false
    }
}

// Показывает в какой позиции листы находятся
exports.getGeneralSheets = (settings) => {

    try {
        let generalSheets = [];
        let sheets = Object.keys(settings.file);

        let count = 0;
        for (let i = 0; i < settings.nameSheets.length; i++) {
            if (sheets.indexOf(settings.nameSheets[i].name) >= 0) {
                count = count + 1;
                generalSheets.push({
                    name: settings.nameSheets[i].name,
                    position: sheets.indexOf(settings.nameSheets[i].name),
                    priority: settings.nameSheets[i].priority,
                    field_sku: settings.nameSheets[i].field_sku
                });
            }
        }

        if (settings.nameSheets.length != count) throw 'Нету обязательных полей';

        return generalSheets;
    } catch (error) {
        console.log(error);
        return false
    }


}

// Получение SKU с главного файла
exports.getSKU = (settings, generalSheets) => {
    try {
        let sku = [];
        let file_selected;

        for (let i = 0; i < generalSheets.length; i++) {
            if (generalSheets[i].priority == 0) {
                file_selected = i;
                sku_field = generalSheets[i].field_sku
                break;
            }
        }
        for (let i = 0; i < settings.file[settings.nameSheets[file_selected].name].length; i++) {
            if (typeof parseInt(settings.file[settings.nameSheets[file_selected].name][i][sku_field]) == 'number' && !isNaN(parseInt(settings.file[settings.nameSheets[file_selected].name][i][sku_field]))) {
                sku.push(parseInt(settings.file[settings.nameSheets[file_selected].name][i][sku_field]));
            }
        }

        if (sku.length == 0) throw 'Нет но одного SKU'

        return sku;
    } catch (error) {
        console.log(error);
        return false
    }
}