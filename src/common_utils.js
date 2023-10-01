exports.sleep = sec => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

exports.logger = error => {
    try {
        if (error.response.data.error.code == 'AUTH_REQUIRED') {
            console.log('Ошибка Авторизации');
            return false
        }
    } catch (error) { }
    if (error.response) {
        console.log(error.code);
        console.log('Проблема с запросом. Попробуй поменять SekretKey и Cookie. Или обратись тому, кто писал этот долбанный код)))');
        return false
    }
}