class ConsoleLogger {
    private logLevels = {info:1, warning:2, error:3, debug:4};
    private logLevel = 0;

    constructor(){
        if(process.env.NODE_ENV === 'development'){
            if(process.env.CONSOLE_LOG_LEVEL){
                this.logLevel = parseInt(process.env.CONSOLE_LOG_LEVEL);
            }
            if(process.env.NEXT_PUBLIC_CONSOLE_LOG_LEVEL){
                this.logLevel = parseInt(process.env.NEXT_PUBLIC_CONSOLE_LOG_LEVEL);
            }
        }
    }

    public logDebug(message: string): void;
    public logDebug(message: number): void;
    public logDebug(message: boolean): void;
    public logDebug(object: object): void;

    public logDebug(input: string | number | boolean | object): void {
        if (this.logLevel === this.logLevels.debug) {
            const message = typeof input !== 'object' 
                ? String(input) 
                : JSON.stringify(input);
            console.log('DEBUG: ' + message);
        }
    }

    public logError(error : string): void;
    public logError(error : Error): void;
    public logError(error : string | Error):void{
        if(this.logLevel >= this.logLevels.error){
            const message = typeof error === 'string' ? error : error.message;
            console.log('ERROR: ' + message);
        }
            
    }

    public logInfo(message : string){
        if(this.logLevel >= this.logLevels.info)
            console.log('INFO: ' + message);
    }

    public logWarning(message : string){
        if(this.logLevel >= this.logLevels.warning)
            console.log('WARN: ' + message);
    }
}

const consoleLogger = new ConsoleLogger();
export default consoleLogger;
