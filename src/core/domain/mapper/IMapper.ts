interface IMapper{
    map<TSource,TDestination,TSourceType,TDestinationType,TOption>(source:TSource, sourceType:TSourceType, desinationType:TDestinationType, options?:TOption) : TDestination;
}