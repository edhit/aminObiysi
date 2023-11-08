const Logger = require("@ptkdev/logger");

exports.logs = (data) => {
    const options = {
        language: "ru",
        colors: true,
        debug: true,
        info: true,
        warning: true,
        error: true,
        sponsor: true,
        write: true,
        type: "log",
        rotate: {
            size: "10M",
            encoding: "utf8",
        },
        path: {
            // remember: add string *.log to .gitignore
            debug_log: "./debug.log",
            error_log: "./errors.log",
        },
    };

    const logger = new Logger(options);
    // console.log(data);
    if (data.show == 'true' || data.show == true) {
        switch (data.type) {
            case 'stackoverflow':
                logger.stackoverflow(data.message)
                break;
            case 'info':
                logger.info(data.message)
                break;

            case 'warning':
                logger.warning(data.message)
                break;

            case 'debug':
                logger.debug(data.message)
                break;

            case 'sponsor':
                logger.sponsor(data.message)
                break;

            default:
                logger.error(data.message)
                break;
        }
    }

    return data
}

exports.sleep = sec => {
    return new Promise(resolve => setTimeout(resolve, sec * 1000))
}

exports.isPositiveInteger = value => {
    if (parseInt(Number(value)) === Number(value)) {
        return Number(value) > 0
    } else return false
}

exports.request_yandex = (error, show_error) => {
    try {
        if (error.response.data.error.code == 'AUTH_REQUIRED') {
            this.logs({
                type: 'error',
                show: show_error,
                message: 'Ошибка Авторизации'
            });
            return false
        }
    } catch (error) { }
    if (error.response) {
        // logger.error(error.response.data.errors);
        // logger.error(error.message);
        this.logs({
            type: 'error',
            show: show_error,
            message: 'Проблема с запросом. Попробуй поменять SekretKey и Cookie. Или обратись тому, кто писал этот долбанный код)))'
        });

        return false
    }
}

