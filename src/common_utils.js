exports.sleep = sec => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

exports.isPositiveInteger = value => {
    if (parseInt(Number(value)) === Number(value)) {
        return Number(value) > 0
    } else return false
}

exports.separator = (number, common) => {
    console.log();
    console.log('#' + (number) + ' / ' + common.length + '________________________________________________');
}

exports.logger = error => {
    try {
        if (error.response.data.error.code == 'AUTH_REQUIRED') {
            console.log('Ошибка Авторизации');
            return false
        }
    } catch (error) { }
    if (error.response) {
        console.log(error.response.data.errors);
        console.log(error.message);
        console.log('Проблема с запросом. Попробуй поменять SekretKey и Cookie. Или обратись тому, кто писал этот долбанный код)))');
        return false
    }
}