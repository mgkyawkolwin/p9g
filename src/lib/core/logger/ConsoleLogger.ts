/**
 * To log various info to console for debugging purposes during development.
 * Set CONSOLE_LOG_LEVEL in .env files to see the console output.
 * 1 - Info, 2 - Warning, 3 - Error, 4 - Debug
 * @example
 * CONSOLE_LOG_LEVEL = 4 ## to see all outputs
 * import c from 'ConsoleLogger';
 * c.i("This is warning.");
 * c.w("This is warning.");
 * c.e("This is error.");
 * c.d(someObject); // this output the json structure of the object
 */
class ConsoleLogger {
    private logLevels = {info:1, warning:2, error:3, debug:4};
    private logLevel = 0;

    constructor(){
        if(process.env.CONSOLE_LOG_LEVEL){
            this.logLevel = parseInt(process.env.CONSOLE_LOG_LEVEL);
        }
        if(process.env.NEXT_PUBLIC_CONSOLE_LOG_LEVEL){
            this.logLevel = parseInt(process.env.NEXT_PUBLIC_CONSOLE_LOG_LEVEL);
        }
    }

    public d(message: string): void;
    public d(message: number): void;
    public d(message: boolean): void;
    public d(object: object): void;

    public d(input: string | number | boolean | object): void {
        if (this.logLevel === this.logLevels.debug) {
            const message = typeof input !== 'object' 
                ? String(input) 
                : JSON.stringify(input);
            console.log('DEBUG: ' + message);
        }
    }

    public e(error : string): void;
    public e(error : Error): void;
    public e(error : string | Error):void{
        if(this.logLevel >= this.logLevels.error){
            const message = typeof error === 'string' ? error : error.message;
            console.log('ERROR: ' + message);
        }
            
    }

    public i(message : string){
        if(this.logLevel >= this.logLevels.info)
            console.log('INFO: ' + message);
    }

    public w(message : string){
        if(this.logLevel >= this.logLevels.warning)
            console.log('WARN: ' + message);
    }
}

const c = new ConsoleLogger();
export default c;
