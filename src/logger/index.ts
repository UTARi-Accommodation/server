const logger = (() => {
    let messageId = 1;
    return {
        log: (message: any) => {
            console.log(
                `Start of message ${messageId} at time of ${new Date().toISOString()}`
            );
            console.dir(message, { depth: null });
            console.log(
                `End of message ${messageId} at time of ${new Date().toISOString()} \n`
            );
            messageId += 1;
        },
    };
})();

export default logger;
