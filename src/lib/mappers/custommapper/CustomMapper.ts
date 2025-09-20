import { injectable } from 'inversify';
import IMapper from "../IMapper";

@injectable()
export default class CustomMapper implements IMapper{
    
    async mapAsync<TSource, TDestination>(
        source: TSource,
        destinationArg: (new () => TDestination) | (() => TDestination) | TDestination
    ): Promise<TDestination> {
        return this.map(source, destinationArg);
    }
    
    
    map<TSource, TDestination>(
        source: TSource,
        destinationArg: (new () => TDestination) | (() => TDestination) | TDestination
    ): TDestination {
        let result: TDestination;
        
        // Determine how to create the result based on the argument type
        if (typeof destinationArg === 'function' && destinationArg.prototype && destinationArg.prototype.constructor) {
            // It's a class constructor: new () => TDestination
            result = new (destinationArg as new () => TDestination)();
        } else if (typeof destinationArg === 'function') {
            // It's a function: () => TDestination
            result = (destinationArg as () => TDestination)();
        } else {
            // It's an object: TDestination
            result = { ...destinationArg as TDestination };
        }
        
        // Common mapping logic
        Object.keys(result).forEach((key) => {
            const destKey = key as keyof TDestination;
            const sourceValue = (source as any)[key];
            const sourceType = typeof sourceValue;
            const destValue = result[destKey];
            const destType = typeof destValue;
            
            if (source.hasOwnProperty(key)) {
                if (destType === sourceType){
                    (result as any)[key] = sourceValue;
                }else if (destType === 'number') {
                    const numValue = Number(sourceValue);
                    (result as any)[key] = isNaN(numValue) ? 0 : numValue;
                } else if (destType === 'boolean') {
                    (result as any)[key] = Boolean(sourceValue);
                } else if (destType === 'string') {
                    (result as any)[key] = sourceValue != null && sourceValue != undefined ? String(sourceValue) : '';
                } else if (destValue instanceof Date) {
                    (result as any)[key] = sourceValue ? new Date(sourceValue) : undefined;
                }  else if (destType === typeof sourceValue) {
                    (result as any)[key] = sourceValue;
                }else{
                    (result as any)[key] = sourceValue;
                }
            }else{
                //source does not have destination property, assign default values
                if (destType === 'number') {
                    (result as any)[key] = 0;
                } else if (destType === 'boolean') {
                    (result as any)[key] = false;
                } else if (destType === 'string') {
                    (result as any)[key] = '';
                }else{
                    (result as any)[key] = undefined;
                }
            }
        });
        
        return result;
    }
}