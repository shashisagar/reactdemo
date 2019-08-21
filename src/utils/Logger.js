const { smconfig } = window;
function info() {
    if(smconfig.env === 'development') {
        // console.info(new Date());
        console.info(...arguments);
    }

}
module.exports = { info };
