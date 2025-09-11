export default interface IMapper {
   map<TSource extends object, TDestination extends object>(
      source: TSource,
      DestinationClass: new () => TDestination
   ): Promise<TDestination>;
}