import { injectable } from 'inversify';
import IMapper from "../IMapper";

@injectable()
export default class CustomMapper implements IMapper{
    
    // Overload signatures
    async map<TSource extends object, TDestination extends object>(
        source: TSource,
        DestinationClass: new () => TDestination
    ): Promise<TDestination>;
    
    async map<TSource extends object, TDestination extends object>(
        source: TSource,
        defaultValueProvider: () => TDestination
    ): Promise<TDestination>;
    
    async map<TSource extends object, TDestination extends object>(
        source: TSource,
        typeDefaults: TDestination
    ): Promise<TDestination>;
    
    // Implementation
    async map<TSource extends object, TDestination extends object>(
        source: TSource,
        destinationArg: (new () => TDestination) | (() => TDestination) | TDestination
    ): Promise<TDestination> {
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
            
            if (source.hasOwnProperty(key)) {
                const sourceValue = (source as any)[key];
                const destValue = result[destKey];
                const destType = typeof destValue;
                
                if (destType === 'number') {
                    const numValue = Number(sourceValue);
                    (result as any)[key] = isNaN(numValue) ? 0 : numValue;
                } else if (destType === 'boolean') {
                    (result as any)[key] = Boolean(sourceValue);
                } else if (destType === 'string') {
                    (result as any)[key] = sourceValue ? String(sourceValue) : undefined;
                } else if (destValue instanceof Date) {
                    (result as any)[key] = sourceValue ? new Date(sourceValue) : undefined;
                }  else if (destType === typeof sourceValue) {
                    (result as any)[key] = sourceValue;
                }else{
                    (result as any)[key] = sourceValue;
                }
            }
        });
        
        return result;
    }
}