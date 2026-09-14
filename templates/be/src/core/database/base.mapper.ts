export abstract class BaseMapper<TDomain, TPersistence> {
  abstract toDomain(raw: TPersistence): TDomain;

  abstract toPersistence(entity: TDomain): TPersistence;

  toDomainList(raws: TPersistence[]): TDomain[] {
    return raws.map((r) => this.toDomain(r));
  }

  toPersistenceList(entities: TDomain[]): TPersistence[] {
    return entities.map((e) => this.toPersistence(e));
  }
}
