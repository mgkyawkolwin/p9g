export default interface IMapper {
   map<TSource, TDestination>(
      source: TSource,
      DestinationClass: new () => TDestination
  ): TDestination;

  mapAsync<TSource, TDestination>(
      source: TSource,
      DestinationClass: new () => TDestination
  ): Promise<TDestination>;
  
  map<TSource, TDestination>(
      source: TSource,
      defaultValueProvider: () => TDestination
  ): TDestination;

  mapAsync<TSource, TDestination>(
      source: TSource,
      defaultValueProvider: () => TDestination
  ): Promise<TDestination>;
  
  map<TSource, TDestination>(
      source: TSource,
      typeDefaults: TDestination
  ): TDestination;

  mapAsync<TSource, TDestination>(
      source: TSource,
      typeDefaults: TDestination
  ): Promise<TDestination>;
}