import { BaseEntity } from './base.entity';

describe('BaseEntity', () => {
  class ConcreteEntity extends BaseEntity {}

  describe('constructor', () => {
    it('should auto-generate a UUID id when no props provided', () => {
      const entity = new ConcreteEntity();
      expect(entity.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should use provided id when given', () => {
      const entity = new ConcreteEntity({ id: 'custom-id' });
      expect(entity.id).toBe('custom-id');
    });

    it('should set version to 1 by default', () => {
      const entity = new ConcreteEntity();
      expect(entity.version).toBe(1);
    });

    it('should initialize deletedAt as null', () => {
      const entity = new ConcreteEntity();
      expect(entity.deletedAt).toBeNull();
      expect(entity.isDeleted).toBe(false);
    });

    it('should accept provided timestamps', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const entity = new ConcreteEntity({ createdAt: date, updatedAt: date });
      expect(entity.createdAt).toBe(date);
      expect(entity.updatedAt).toBe(date);
    });
  });

  describe('markAsUpdated', () => {
    it('should increment version and update updatedAt', () => {
      const entity = new ConcreteEntity();
      const oldUpdatedAt = entity.updatedAt;
      const oldVersion = entity.version;
      entity.markAsUpdated();
      expect(entity.version).toBe(oldVersion + 1);
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt and mark isDeleted true', () => {
      const entity = new ConcreteEntity();
      entity.softDelete();
      expect(entity.deletedAt).not.toBeNull();
      expect(entity.isDeleted).toBe(true);
      expect(entity.version).toBe(2);
    });
  });

  describe('restore', () => {
    it('should clear deletedAt and restore entity', () => {
      const entity = new ConcreteEntity();
      entity.softDelete();
      entity.restore();
      expect(entity.deletedAt).toBeNull();
      expect(entity.isDeleted).toBe(false);
      expect(entity.version).toBe(3);
    });
  });
});
