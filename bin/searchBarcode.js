/** @format */

const excelToJson = require('convert-excel-to-json');
const xlsx = require('json-as-xlsx');

const file = excelToJson({
	sourceFile: '1.xlsx',
});

//
// первым указывается файл откуда береться SKU - товара (Есть возможность выбрать поле для SKU)
// вторым указываем файл где ищем SKU и берем название от поставщиков (Есть возможность выбрать поле для SKU)
const nameSheets = [
	{ name: 'Поставка Яндекс', priority: 0 },
	{ name: 'Связи товаров', priority: 1 },
];

// Показывает в какой позиции листы находятся
function getGeneralSheets(file, nameSheets) {
	let generalSheets = [];
	let sheets = Object.keys(file);

	try {
		let count = 0;
		for (let i = 0; i < nameSheets.length; i++) {
			if (sheets.indexOf(nameSheets[i].name) >= 0) {
				count = count + 1;
				generalSheets.push({
					name: nameSheets[i].name,
					position: sheets.indexOf(nameSheets[i].name),
					priority: nameSheets[i].priority,
				});
			}
		}

		if (nameSheets.length != count) throw 'Нету обязательных полей';
	} catch (error) {
		console.log(error);
		process.exit(0);
	}

	return generalSheets;
}

// Получение SKU с главного файла
function getSKU(file, nameSheets, generalSheets) {
	let sku = [];
	let sku_field = 'A'; // выбор пользователя

	let file_selected;

	for (let i = 0; i < generalSheets.length; i++) {
		if (generalSheets[i].priority == 0) {
			file_selected = i;
			break;
		}
	}

	for (let i = 0; i < file[nameSheets[file_selected].name].length; i++) {
		if (typeof file[nameSheets[file_selected].name][i][sku_field] == 'number') {
			sku.push(file[nameSheets[file_selected].name][i][sku_field]);
		}
	}

	return sku;
}

// Выбор названия для поиска у поставщиков
function getSearchData(file, nameSheets, generalSheets, sku) {
	let search = [];

	let sku_field = 'A';
	let merchants_field = ['D', 'E']; // Исключительно алфавитный порядок - ЭТО ВАЖНО

	let file_selected;

	for (let i = 0; i < generalSheets.length; i++) {
		if (generalSheets[i].priority == 1) {
			file_selected = i;
			break;
		}
	}

	for (let i = 0; i < sku.length; i++) {
		for (let k = 0; k < file[nameSheets[file_selected].name].length; k++) {
			if (file[nameSheets[file_selected].name][k][sku_field] == sku[i]) {
				let names = [];
				for (let l = 0; l < merchants_field.length; l++) {
					try {
						if (
							file[nameSheets[file_selected].name][k][merchants_field[l]]
								.length >= 10
						)
							names.push({
								sku: sku[i],
								name: file[nameSheets[file_selected].name][k][
									merchants_field[l]
								],
								merchant: merchants_field[l],
							});
					} catch (error) {}
				}

				search.push(names);
			}
		}
	}

	return {
		data: Object.assign({}, search),
		merchant: merchants_field.length,
	};
}

// Найти в файлах поставщика название товара, потом получить штрихкод и цену
function replaceDataMerchant(file, generalSheets, searchData) {
	let keys = Object.keys(file);

	// console.log(generalSheets[0].name);

	for (let i = 0; i < keys.length; i++) {
		let k = 0;
		while (k < generalSheets.length) {
			if (generalSheets[k].name == keys[i]) {
				keys.splice(i, 1);
			}
			k++;
		}
	}

	// console.log(keys);

	for (const key in searchData.data) {
		if (searchData.data[key].length >= 1) {
			if (searchData.data[key][0].merchant == 'D') {
				// console.log('D');
				for (let i = 0; i < file[keys[0]].length; i++) {
					if (file[keys[0]][i].A == searchData.data[key][0].name) {
						// console.log(typeof searchData.data[key][0].barcode);
						searchData.data[key][0].barcode = file[keys[0]][i].B;
						searchData.data[key][0].price = file[keys[0]][i].D;
						// console.log('D' + i);
					}
				}
			}
			// console.log(searchData.data[key]);
			if (searchData.data[key][0].merchant == 'E') {
				// console.log('E');
				for (let i = 0; i < file[keys[1]].length; i++) {
					if (file[keys[1]][i].A == searchData.data[key][0].name) {
						searchData.data[key][0].barcode = file[keys[1]][i].C;
						searchData.data[key][0].price = file[keys[1]][i].E;
						// console.log('_____');
						// console.log(searchData.data[key][0]);
					}
				}
			}
		}
		// console.log(searchData.data);
	}
	// console.log(searchData.data);
	return searchData.data;
}

let generalSheets = getGeneralSheets(file, nameSheets);
// console.log(generalSheets);
let sku = getSKU(file, nameSheets, generalSheets);
// console.log(sku);
let searchData = getSearchData(file, nameSheets, generalSheets, sku);
// console.log(searchData);
let dataMerchant = replaceDataMerchant(file, generalSheets, searchData);
// console.log(file);

let data = [
	{
		sheet: 'Product',
		columns: [
			{ label: 'sku', value: 'sku' }, // Top level data
			{ label: 'name', value: 'name' }, // Custom format
			{ label: 'barcode', value: 'barcode' }, // Run functions
			{ label: 'price', value: 'price' },
			{ label: 'rami', value: 'rami' },
			{ label: 'bara', value: 'bara' },
		],
	},
];
data[0].content = [];
// for (let i = 0; i < dataMerchant.length; i++) {
// 	const element = array[i];

// }

for (const key in dataMerchant) {
	try {
		if (dataMerchant[key][0].merchant == 'D') {
			// if (dataMerchant[key[0]].barcode != undefined) {
			data[0].content.push({
				sku: dataMerchant[key][0].sku,
				name: dataMerchant[key][0].name,
				barcode: dataMerchant[key][0].barcode,
				price: dataMerchant[key][0].price,
				rami: '++++++++',
				bara: '-------',
			});
			// }
			// console.log(typeof dataMerchant[key[0]].barcode);
		}
		if (dataMerchant[key][0].merchant == 'E') {
			// if (dataMerchant[key[0]].barcode != undefined) {
			data[0].content.push({
				sku: dataMerchant[key][0].sku,
				name: dataMerchant[key][0].name,
				barcode: dataMerchant[key][0].barcode,
				price: dataMerchant[key][0].price,
				rami: '-------',
				bara: '++++++++',
			});
			// }
			// console.log(typeof dataMerchant[key[0]].barcode);
		}
	} catch (error) {}
}

let settings = {
	fileName: 'aaaa', // Name of the resulting spreadsheet
	// extraLength: 3, // A bigger number means that columns will be wider
	// writeMode: 'writeFile', // The available parameters are 'WriteFile' and 'write'. This setting is optional. Useful in such cases https://docs.sheetjs.com/docs/solutions/output#example-remote-file
	// writeOptions: {}, // Style options from https://docs.sheetjs.com/docs/api/write-options
	// RTL: true, // Display the columns from right-to-left (the default value is false)
};

xlsx(data, settings);
